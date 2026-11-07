/*
 * Het dorp: een schematische kaart van Wassenaar. Buurten kleuren naar hoe vaak je er actief was,
 * plekken lichten op als je ze ontdekte. Tik op een plek en log wat je daar deed.
 */

import { KAART, PLEKKEN, BUURTEN } from '../gegevens.js';
import { ACTIVITEITEN } from '../spel.js';
import { maak, icoon, getal, svgKnop } from '../ui.js';

const STAPPEN = [1, 3, 6, 11]; // vanaf zo veel keer krijgt een buurt een donkerder kleur
let gekozen = null; // { soort: 'plek' | 'buurt', id }
let opActiviteit = () => {};

export function bouwKaart(el, bijActiviteit) {
  opActiviteit = bijActiviteit;
  const { breedte, hoogte } = KAART;
  const svg = maak('svg:svg', { class: 'kaart-svg', viewBox: `0 0 ${breedte} ${hoogte}`, width: breedte, height: hoogte, role: 'group', 'aria-label': 'Kaart van Wassenaar, schematisch' },
    maak('svg:rect', { class: 'kaart-land', width: breedte, height: hoogte }),
    maak('svg:path', { class: 'kaart-zee', d: KAART.zee }),
    maak('svg:path', { class: 'kaart-kust', d: KAART.kust }),
    ...KAART.duinen.map((d) => maak('svg:path', { class: 'kaart-duin', d: d.pad })),
    ...KAART.wegen.map((w) => maak('svg:path', { class: 'kaart-weg', d: w.pad })),
    maak('svg:text', { class: 'kaart-zee-label', x: 120, y: 140, tekst: 'Noordzee' }),
    ...KAART.duinen.map((d) => maak('svg:text', { class: 'kaart-duin-label', x: d.label[0], y: d.label[1], 'text-anchor': 'middle', tekst: d.naam })),
    ...Object.entries(KAART.buurten).map(([naam, b]) => svgKnop({ class: 'kaart-buurt', 'data-buurt': naam, 'aria-label': naam }, () => kies(el, 'buurt', naam),
      maak('svg:path', { d: b.pad }),
      maak('svg:text', { class: 'kaart-buurt-label', x: b.label[0], y: b.label[1], 'text-anchor': 'middle', tekst: naam }))),
    ...PLEKKEN.map((p) => {
      const [x, y] = KAART.plekken[p.id];
      return svgKnop({ class: 'kaart-pin', 'data-plek': p.id, transform: `translate(${x} ${y})`, 'aria-label': p.naam }, () => kies(el, 'plek', p.id),
        maak('svg:circle', { class: 'pin-rand', r: 16 }),
        maak('svg:use', { class: 'pin-icoon', href: `#az-i-${p.icoon}`, x: -9, y: -9, width: 18, height: 18 }),
        maak('svg:title', { tekst: p.naam }));
    }));
  el.kaart.replaceChildren(svg);
  el.kaartLegenda.replaceChildren(
    maak('span', {}, maak('span', { class: 'legenda-pin ontdekt', 'aria-hidden': 'true' }), 'Ontdekt'),
    maak('span', {}, maak('span', { class: 'legenda-pin', 'aria-hidden': 'true' }), 'Nog te ontdekken'),
    'Buurt:',
    ...['0', '1–2', '3–5', '6–10', '11+'].map((t, i) => maak('span', {}, maak('span', { class: `legenda-vak stap-${i}`, 'aria-hidden': 'true' }), `${t}×`)));
}

function tellingen(spel) {
  const plek = new Map(), buurt = new Map();
  for (const r of spel.logboek) {
    const p = ACTIVITEITEN.get(r.activiteit)?.plek;
    if (p) plek.set(p, (plek.get(p) ?? 0) + 1);
    if (r.buurt) buurt.set(r.buurt, (buurt.get(r.buurt) ?? 0) + 1);
  }
  return { plek, buurt };
}

let laatsteSpel = null;

export function toonKaart(el, spel) {
  laatsteSpel = spel;
  const { plek, buurt } = tellingen(spel);
  for (const g of el.kaart.querySelectorAll('[data-plek]')) {
    const n = plek.get(g.dataset.plek) ?? 0;
    g.classList.toggle('ontdekt', n > 0);
    g.classList.toggle('gekozen', gekozen?.soort === 'plek' && gekozen.id === g.dataset.plek);
    g.setAttribute('aria-label', `${PLEKKEN.find((p) => p.id === g.dataset.plek).naam}: ${n ? `ontdekt, ${n} keer` : 'nog niet ontdekt'}`);
  }
  for (const g of el.kaart.querySelectorAll('[data-buurt]')) {
    const n = buurt.get(g.dataset.buurt) ?? 0;
    const stap = n ? STAPPEN.findLastIndex((s) => n >= s) + 1 : 0;
    g.setAttribute('class', `kaart-buurt stap-${stap}${gekozen?.soort === 'buurt' && gekozen.id === g.dataset.buurt ? ' gekozen' : ''}`);
    g.setAttribute('aria-label', `${g.dataset.buurt}: ${n} keer actief`);
  }
  el.kaartTeller.textContent = `${PLEKKEN.filter((p) => plek.has(p.id)).length} / ${PLEKKEN.length} plekken · ${BUURTEN.filter((b) => buurt.has(b)).length} / ${BUURTEN.length} buurten`;
  toonInfo(el, plek, buurt);
}

function kies(el, soort, id) {
  gekozen = { soort, id };
  if (laatsteSpel) toonKaart(el, laatsteSpel);
  el.kaartInfo.focus();
}

function toonInfo(el, plek, buurt) {
  if (!gekozen) {
    el.kaartInfo.replaceChildren(
      maak('h3', {}, icoon('location-dot', 'icoon goud'), 'Tik op een plek of buurt'),
      maak('p', { class: 'zacht', tekst: 'Goud is ontdekt, grijs nog niet. Een plek die je voor het eerst bezoekt, geeft ×2. Hoe donkerder een buurt, hoe vaker je er was.' }));
    return;
  }
  if (gekozen.soort === 'buurt') {
    const n = buurt.get(gekozen.id) ?? 0;
    el.kaartInfo.replaceChildren(
      maak('h3', {}, icoon('house', 'icoon goud'), gekozen.id),
      maak('p', { tekst: n ? `${getal(n)} keer actief in ${gekozen.id}.` : `Nog niets gelogd in ${gekozen.id}.` }),
      maak('p', { class: 'zacht', tekst: 'Kies bij het loggen onder "Met wie en waar?" de buurt. In een dorp ben je gevestigd per buurt.' }));
    return;
  }
  const p = PLEKKEN.find((x) => x.id === gekozen.id);
  const n = plek.get(p.id) ?? 0;
  const acties = [...ACTIVITEITEN.values()].filter((a) => a.plek === p.id);
  el.kaartInfo.replaceChildren(
    maak('h3', {}, icoon(p.icoon, 'icoon goud'), p.naam),
    maak('p', { class: n ? 'plek-status ontdekt' : 'plek-status', tekst: n ? `Ontdekt · ${getal(n)} keer` : 'Nog niet ontdekt: je eerste bezoek geeft ×2' }),
    maak('p', { class: 'zacht', tekst: 'Wat deed je hier?' }),
    maak('ul', { class: 'acties' }, ...acties.map((a) => maak('li', {}, maak('button', { type: 'button', class: a.punten >= 100 ? 'actie groot' : 'actie', bij: () => opActiviteit(a) },
      maak('span', { class: 'actie-naam', tekst: a.naam }), maak('span', { class: 'actie-punten', tekst: `+${getal(a.punten)}` }))))));
}
