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

// Een veelhoek met afgeronde hoeken, als SVG-pad.
function rond(punten, straal = 22) {
  const n = punten.length;
  const naar = (a, b, d) => {
    const lengte = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const f = Math.min(0.5, d / lengte);
    return [Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f)];
  };
  return punten.map((p, i) => {
    const van = naar(p, punten[(i + n - 1) % n], straal), tot = naar(p, punten[(i + 1) % n], straal);
    return `${i ? 'L' : 'M'}${van[0]} ${van[1]}Q${p[0]} ${p[1]} ${tot[0]} ${tot[1]}`;
  }).join('') + 'Z';
}

function versiering() {
  return maak('svg:defs', {},
    maak('svg:linearGradient', { id: 'az-kaart-zee', x1: 0, y1: 0, x2: 1, y2: 1 },
      maak('svg:stop', { offset: 0, class: 'zee-diep' }), maak('svg:stop', { offset: 1, class: 'zee-ondiep' })),
    maak('svg:pattern', { id: 'az-kaart-golven', width: 44, height: 22, patternUnits: 'userSpaceOnUse' },
      maak('svg:path', { class: 'golf', d: 'M2 12q9-7 18 0' })),
    maak('svg:pattern', { id: 'az-kaart-rimpels', width: 28, height: 18, patternUnits: 'userSpaceOnUse' },
      maak('svg:path', { class: 'rimpel', d: 'M4 13q6-7 12 0' })),
    maak('svg:pattern', { id: 'az-kaart-bomen', width: 24, height: 24, patternUnits: 'userSpaceOnUse' },
      maak('svg:circle', { class: 'boom', cx: 6, cy: 7, r: 4.5 }), maak('svg:circle', { class: 'boom', cx: 17, cy: 17, r: 5.5 })),
    ...KAART.wegen.map((w, i) => maak('svg:path', { id: `az-kaart-weg-${i}`, d: w.pad })));
}

function windroos() {
  return maak('svg:g', { class: 'windroos', transform: 'translate(70 78)', 'aria-hidden': 'true' },
    maak('svg:circle', { r: 30 }),
    maak('svg:path', { class: 'windroos-noord', d: 'M0 -26L7 0L0 -5L-7 0Z' }),
    maak('svg:path', { class: 'windroos-zuid', d: 'M0 26L7 0L0 5L-7 0Z' }),
    maak('svg:path', { class: 'windroos-zuid', d: 'M-26 0L0 -5L-4 0L0 5ZM26 0L0 -5L4 0L0 5Z' }),
    maak('svg:text', { x: 0, y: -36, 'text-anchor': 'middle', tekst: 'N' }));
}

export function bouwKaart(el, bijActiviteit) {
  opActiviteit = bijActiviteit;
  const { breedte, hoogte } = KAART;
  const svg = maak('svg:svg', { class: 'kaart-svg', viewBox: `0 0 ${breedte} ${hoogte}`, width: breedte, height: hoogte, role: 'group', 'aria-label': 'Kaart van Wassenaar, schematisch' },
    versiering(),
    maak('svg:rect', { class: 'kaart-land', width: breedte, height: hoogte }),
    maak('svg:path', { class: 'kaart-zee', d: KAART.zee }),
    maak('svg:path', { class: 'kaart-golven', d: KAART.zee }),
    maak('svg:path', { class: 'kaart-duin', d: KAART.duinen }),
    maak('svg:path', { class: 'kaart-rimpels', d: KAART.duinen }),
    maak('svg:path', { class: 'kaart-strand', d: KAART.kust }),
    maak('svg:path', { class: 'kaart-vloedlijn', d: KAART.kust }),
    ...KAART.bossen.flatMap((b) => [maak('svg:path', { class: 'kaart-bos', d: rond(b.punten, 30) }), maak('svg:path', { class: 'kaart-bomen', d: rond(b.punten, 30) })]),
    ...KAART.wegen.flatMap((w) => [maak('svg:path', { class: `kaart-weg-rand ${w.soort}`, d: w.pad }), maak('svg:path', { class: `kaart-weg ${w.soort}`, d: w.pad })]),
    ...KAART.wegen.map((w, i) => maak('svg:text', { class: 'kaart-weg-naam' }, maak('svg:textPath', { href: `#az-kaart-weg-${i}`, startOffset: w.label, tekst: w.naam }))),
    maak('svg:text', { class: 'kaart-zee-label', x: 200, y: 270, tekst: 'Noordzee' }),
    ...KAART.duinNamen.map(([naam, x, y]) => maak('svg:text', { class: 'kaart-duin-label', x, y, 'text-anchor': 'middle', tekst: naam })),
    ...KAART.bossen.map((b) => {
      const x = Math.min(KAART.breedte - 70, Math.round(b.punten.reduce((s, p) => s + p[0], 0) / b.punten.length));
      const y = b.naamOnder ? Math.max(...b.punten.map((p) => p[1])) + 18 : Math.min(...b.punten.map((p) => p[1])) - 8;
      return maak('svg:text', { class: 'kaart-bos-label', x, y, 'text-anchor': 'middle', tekst: b.naam });
    }),
    ...Object.entries(KAART.buurten).map(([naam, b]) => svgKnop({ class: 'kaart-buurt', 'data-buurt': naam, 'aria-label': naam }, () => kies(el, 'buurt', naam),
      maak('svg:path', { d: rond(b.punten) }),
      maak('svg:text', { class: 'kaart-buurt-label', x: b.label[0], y: b.label[1], 'text-anchor': 'middle', tekst: naam.toLocaleUpperCase('nl') }))),
    ...PLEKKEN.map((p) => {
      const [x, y] = KAART.plekken[p.id];
      return svgKnop({ class: 'kaart-pin', 'data-plek': p.id, transform: `translate(${x} ${y + 12})`, 'aria-label': p.naam }, () => kies(el, 'plek', p.id),
        maak('svg:ellipse', { class: 'pin-schaduw', cx: 0, cy: 0, rx: 8, ry: 3 }),
        maak('svg:g', { class: 'pin-lijf' },
          maak('svg:path', { class: 'pin-rand', d: 'M0 0C-5 -9 -16 -14 -16 -26A16 16 0 1 1 16 -26C16 -14 5 -9 0 0Z' }),
          maak('svg:use', { class: 'pin-icoon', href: `#az-i-${p.icoon}`, x: -9, y: -35, width: 18, height: 18 })),
        maak('svg:title', { tekst: p.naam }));
    }),
    windroos(),
    maak('svg:g', { class: 'cartouche', 'aria-hidden': 'true' },
      maak('svg:rect', { x: 800, y: 18, width: 182, height: 54, rx: 8 }),
      maak('svg:use', { class: 'cartouche-kroon', href: '#az-i-crown', x: 814, y: 30, width: 30, height: 30 }),
      maak('svg:text', { x: 852, y: 54, tekst: 'Wassenaar' })),
    maak('svg:rect', { class: 'kaart-kader', x: 6, y: 6, width: breedte - 12, height: hoogte - 12, rx: 10 }),
    maak('svg:rect', { class: 'kaart-kader-binnen', x: 14, y: 14, width: breedte - 28, height: hoogte - 28, rx: 6 }));
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
