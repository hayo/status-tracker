/*
 * Het dorp: Wassenaar als fantasy-koninkrijk, getekend als oude kaart op perkament. Buurten zijn rijken
 * die kleuren naar hoe vaak je er was; plekken zijn lakzegels die goud worden als je ze ontdekte.
 * Tik op een zegel en log wat je daar deed.
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

// Een lakzegel: een cirkel met een golvende rand.
function zegelPad(r = 17, bulten = 14) {
  const punten = Array.from({ length: bulten * 2 }, (_, i) => {
    const hoek = (i * Math.PI) / bulten, straal = i % 2 ? r - 2.5 : r;
    return `${(straal * Math.cos(hoek)).toFixed(1)} ${(straal * Math.sin(hoek)).toFixed(1)}`;
  });
  return `M${punten.join('L')}Z`;
}

function versiering() {
  return maak('svg:defs', {},
    maak('svg:filter', { id: 'az-kaart-vezel', x: 0, y: 0, width: '100%', height: '100%' },
      maak('svg:feTurbulence', { type: 'fractalNoise', baseFrequency: 0.85, numOctaves: 3, stitchTiles: 'stitch' }),
      maak('svg:feColorMatrix', { type: 'matrix', values: '0 0 0 0 0.35 0 0 0 0 0.24 0 0 0 0 0.1 0 0 0 0.16 0' })),
    maak('svg:radialGradient', { id: 'az-kaart-vignet', cx: '50%', cy: '50%', r: '75%' },
      maak('svg:stop', { offset: '55%', class: 'vignet-midden' }), maak('svg:stop', { offset: '100%', class: 'vignet-rand' })),
    maak('svg:pattern', { id: 'az-kaart-golven', width: 46, height: 26, patternUnits: 'userSpaceOnUse' },
      maak('svg:path', { class: 'golf', d: 'M4 14q5-5 10 0t10 0' })),
    maak('svg:pattern', { id: 'az-kaart-heuvels', width: 40, height: 30, patternUnits: 'userSpaceOnUse' },
      maak('svg:path', { class: 'heuvel', d: 'M4 22q9-15 18 0' }), maak('svg:path', { class: 'heuvel-schaduw', d: 'M13 10q4 5 4 11' }),
      maak('svg:path', { class: 'heuvel', d: 'M24 9q6-9 12 0' })),
    maak('svg:pattern', { id: 'az-kaart-dennen', width: 26, height: 26, patternUnits: 'userSpaceOnUse' },
      maak('svg:path', { class: 'den', d: 'M7 3L12 13H2ZM7 13V16' }), maak('svg:path', { class: 'den', d: 'M19 12L24 22H14ZM19 22V25' })),
    ...KAART.wegen.map((w, i) => maak('svg:path', { id: `az-kaart-weg-${i}`, d: w.pad })));
}

function windroos() {
  const ster = (r1, r2, n, draai = 0) => `M${Array.from({ length: n * 2 }, (_, i) => {
    const h = draai + (i * Math.PI) / n - Math.PI / 2, r = i % 2 ? r2 : r1;
    return `${(r * Math.cos(h)).toFixed(1)} ${(r * Math.sin(h)).toFixed(1)}`;
  }).join('L')}Z`;
  return maak('svg:g', { class: 'windroos', transform: 'translate(95 100)', 'aria-hidden': 'true' },
    maak('svg:circle', { class: 'windroos-ring', r: 46 }), maak('svg:circle', { class: 'windroos-ring', r: 40 }),
    maak('svg:path', { class: 'windroos-klein', d: ster(30, 8, 4, Math.PI / 4) }),
    maak('svg:path', { class: 'windroos-groot', d: ster(44, 9, 4) }),
    maak('svg:circle', { class: 'windroos-hart', r: 4 }),
    ...[['N', 0, -54], ['O', 56, 5], ['Z', 0, 64], ['W', -56, 5]].map(([t, x, y]) => maak('svg:text', { x, y, 'text-anchor': 'middle', tekst: t })));
}

function zeegezicht() {
  return maak('svg:g', { class: 'zeegezicht', 'aria-hidden': 'true' },
    // Een schip met bolle zeilen
    maak('svg:g', { transform: 'translate(300 120) rotate(-6)' },
      maak('svg:path', { class: 'schip-romp', d: 'M-30 8Q0 24 30 8L24 0H-24Z' }),
      maak('svg:path', { class: 'schip-mast', d: 'M0 0V-38M-14 -2V-26' }),
      maak('svg:path', { class: 'schip-zeil', d: 'M2 -36Q20 -24 2 -6ZM-12 -24Q2 -16 -12 -6Z' }),
      maak('svg:path', { class: 'schip-vlag', d: 'M0 -38L10 -35L0 -32Z' })),
    // Een zeeslang die door de golven kronkelt
    maak('svg:g', { transform: 'translate(120 360)' },
      maak('svg:path', { class: 'slang', d: 'M-40 10Q-30 -14 -20 10M-10 10Q2 -18 14 10M24 10Q32 -8 40 4Q46 -4 52 -2' }),
      maak('svg:circle', { class: 'slang-oog', cx: 50, cy: -2, r: 1.6 }),
      maak('svg:text', { class: 'kaart-zeeslang', x: 6, y: 34, 'text-anchor': 'middle', tekst: 'Hier zwemmen zeeslangen' })));
}

function banier() {
  return maak('svg:g', { class: 'banier', 'aria-hidden': 'true' },
    maak('svg:path', { class: 'banier-staart', d: 'M650 34L628 50L650 66L662 50ZM968 34L990 50L968 66L956 50Z' }),
    maak('svg:path', { class: 'banier-doek', d: 'M656 26Q812 14 962 26V74Q812 62 656 74Z' }),
    maak('svg:use', { class: 'banier-kroon', href: '#az-i-crown', x: 668, y: 37, width: 24, height: 24 }),
    maak('svg:text', { x: 822, y: 57, 'text-anchor': 'middle', tekst: KAART.titel }));
}

function kader(breedte, hoogte) {
  const hoeken = [[16, 16], [breedte - 16, 16], [16, hoogte - 16], [breedte - 16, hoogte - 16]];
  return maak('svg:g', { class: 'kaart-kader', 'aria-hidden': 'true' },
    maak('svg:rect', { class: 'kader-buiten', x: 5, y: 5, width: breedte - 10, height: hoogte - 10 }),
    maak('svg:rect', { class: 'kader-binnen', x: 13, y: 13, width: breedte - 26, height: hoogte - 26 }),
    ...hoeken.map(([x, y]) => maak('svg:path', { class: 'kader-hoek', d: `M${x} ${y - 9}L${x + 9} ${y}L${x} ${y + 9}L${x - 9} ${y}Z` })));
}

function schaal() {
  return maak('svg:g', { class: 'schaal', transform: 'translate(60 640)', 'aria-hidden': 'true' },
    ...[0, 1, 2, 3].map((i) => maak('svg:rect', { class: i % 2 ? 'schaal-licht' : 'schaal-donker', x: i * 30, y: 0, width: 30, height: 7 })),
    maak('svg:text', { x: 60, y: -8, 'text-anchor': 'middle', tekst: 'Eén dagmars' }));
}

export function bouwKaart(el, bijActiviteit) {
  opActiviteit = bijActiviteit;
  const { breedte, hoogte } = KAART;
  const svg = maak('svg:svg', { class: 'kaart-svg', viewBox: `0 0 ${breedte} ${hoogte}`, width: breedte, height: hoogte, role: 'group', 'aria-label': 'Kaart van Wassenaar als koninkrijk, schematisch' },
    versiering(),
    maak('svg:rect', { class: 'kaart-perkament', width: breedte, height: hoogte }),
    maak('svg:path', { class: 'kaart-zee', d: KAART.zee }),
    maak('svg:path', { class: 'kaart-golven', d: KAART.zee }),
    maak('svg:path', { class: 'kaart-kustschaduw', d: KAART.kust }),
    maak('svg:path', { class: 'kaart-duin', d: KAART.duinen }),
    maak('svg:path', { class: 'kaart-heuvels', d: KAART.duinen }),
    maak('svg:path', { class: 'kaart-kust', d: KAART.kust }),
    ...KAART.bossen.flatMap((b) => [maak('svg:path', { class: 'kaart-bos', d: rond(b.punten, 30) }), maak('svg:path', { class: 'kaart-dennen', d: rond(b.punten, 30) })]),
    ...KAART.wegen.map((w) => maak('svg:path', { class: `kaart-weg ${w.soort}`, d: w.pad })),
    ...KAART.wegen.map((w, i) => maak('svg:text', { class: 'kaart-weg-naam' }, maak('svg:textPath', { href: `#az-kaart-weg-${i}`, startOffset: w.label, tekst: w.naam }))),
    zeegezicht(),
    maak('svg:text', { class: 'kaart-zee-label', x: 250, y: 232, 'text-anchor': 'middle', tekst: KAART.zeeNaam }),
    ...KAART.duinNamen.map(([naam, x, y]) => maak('svg:text', { class: 'kaart-duin-label', x, y, 'text-anchor': 'middle', tekst: naam })),
    ...KAART.bossen.map((b) => {
      const x = Math.min(KAART.breedte - 80, Math.round(b.punten.reduce((s, p) => s + p[0], 0) / b.punten.length));
      const y = b.naamOnder ? Math.max(...b.punten.map((p) => p[1])) + 18 : Math.min(...b.punten.map((p) => p[1])) - 8;
      return maak('svg:text', { class: 'kaart-bos-label', x, y, 'text-anchor': 'middle', tekst: b.naam });
    }),
    ...Object.entries(KAART.buurten).map(([naam, b]) => svgKnop({ class: 'kaart-buurt', 'data-buurt': naam, 'aria-label': `${b.titel} ${naam}` }, () => kies(el, 'buurt', naam),
      maak('svg:path', { d: rond(b.punten) }),
      maak('svg:text', { 'text-anchor': 'middle' },
        maak('svg:tspan', { class: 'kaart-buurt-titel', x: b.label[0], y: b.label[1] - 15, tekst: b.titel }), ' ',
        maak('svg:tspan', { class: 'kaart-buurt-label', x: b.label[0], y: b.label[1] + 3, tekst: naam })))),
    ...PLEKKEN.map((p) => {
      const [x, y] = KAART.plekken[p.id];
      return svgKnop({ class: 'kaart-pin', 'data-plek': p.id, transform: `translate(${x} ${y})`, 'aria-label': p.naam }, () => kies(el, 'plek', p.id),
        maak('svg:ellipse', { class: 'pin-schaduw', cx: 2, cy: 15, rx: 13, ry: 4 }),
        maak('svg:g', { class: 'pin-lijf' },
          maak('svg:path', { class: 'pin-rand', d: zegelPad() }),
          maak('svg:circle', { class: 'pin-binnen', r: 11.5 }),
          maak('svg:use', { class: 'pin-icoon', href: `#az-i-${p.icoon}`, x: -8, y: -8, width: 16, height: 16 })),
        maak('svg:title', { tekst: p.naam }));
    }),
    windroos(),
    banier(),
    schaal(),
    maak('svg:rect', { class: 'kaart-vezel', width: breedte, height: hoogte }),
    maak('svg:rect', { class: 'kaart-vignet', width: breedte, height: hoogte }),
    kader(breedte, hoogte));
  el.kaart.replaceChildren(svg);
  el.kaartLegenda.replaceChildren(
    maak('span', {}, maak('span', { class: 'legenda-pin ontdekt', 'aria-hidden': 'true' }), 'Ontdekt'),
    maak('span', {}, maak('span', { class: 'legenda-pin', 'aria-hidden': 'true' }), 'Nog te ontdekken'),
    'Rijk:',
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
    g.setAttribute('aria-label', `${KAART.buurten[g.dataset.buurt].titel} ${g.dataset.buurt}: ${n} keer actief`);
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
      maak('h3', {}, icoon('house', 'icoon goud'), `${KAART.buurten[gekozen.id].titel} ${gekozen.id}`),
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
