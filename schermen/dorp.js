/*
 * Het dorp: Wassenaar als fantasy-koninkrijk, getekend als oude kaart op perkament. Buurten zijn rijken
 * met grillige grenzen: wat je nog niet bezocht, ligt in de mist, en hoe vaker je er was, hoe voller de
 * kleur van het rijk. Plekken zijn getekende gebouwtjes die kleur krijgen als je ze ontdekt.
 * Tik op een plek en log wat je daar deed.
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

// Een pseudo-willekeurig getal tussen -1 en 1, vast per punt. Zo is de kaart elke keer gelijk.
function ruis(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

// Eén grens tussen twee hoekpunten, met een hand getekende slinger. De slinger hangt alleen af van de
// twee punten, niet van de richting: twee rijken die een grens delen, tekenen precies dezelfde lijn.
function grens(a, b, stap = 16, uitslag = 5) {
  const omgedraaid = a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  const [p, q] = omgedraaid ? [b, a] : [a, b];
  const lengte = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const n = Math.max(2, Math.round(lengte / stap));
  const [nx, ny] = [-(q[1] - p[1]) / lengte, (q[0] - p[0]) / lengte];
  const punten = Array.from({ length: n + 1 }, (_, i) => {
    const x = p[0] + ((q[0] - p[0]) * i) / n, y = p[1] + ((q[1] - p[1]) * i) / n;
    const d = i === 0 || i === n ? 0 : ruis(Math.round(x), Math.round(y)) * uitslag;
    return [x + nx * d, y + ny * d];
  });
  return omgedraaid ? punten.reverse() : punten;
}

// Een vloeiende lijn door punten (Catmull-Rom), zonder het eerste punt.
function vloeiend(punten) {
  const r = (n) => Math.round(n * 10) / 10;
  const p = (i) => punten[Math.max(0, Math.min(punten.length - 1, i))];
  let d = '';
  for (let i = 0; i < punten.length - 1; i++) {
    const [a, b, c, e] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += `C${r(b[0] + (c[0] - a[0]) / 6)} ${r(b[1] + (c[1] - a[1]) / 6)} ${r(c[0] - (e[0] - b[0]) / 6)} ${r(c[1] - (e[1] - b[1]) / 6)} ${r(c[0])} ${r(c[1])}`;
  }
  return d;
}

// Een rijk als gesloten, grillig pad.
function rijkPad(punten) {
  return `M${punten[0][0]} ${punten[0][1]}${punten.map((p, i) => vloeiend(grens(p, punten[(i + 1) % punten.length]))).join('')}Z`;
}

// De gebouwtjes en landschapjes voor plekken, in een vlak rond 0,0 met de grond op y = 10.
const pad = (klasse, d) => maak('svg:path', { class: klasse, d });
const wiek = (hoek) => {
  const draai = ([x, y]) => [(x * Math.cos(hoek) - y * Math.sin(hoek)).toFixed(1), (-8 + x * Math.sin(hoek) + y * Math.cos(hoek)).toFixed(1)];
  return [[2, 0], [17, 0], [17, 4], [3, 4]].map(draai);
};
const TEKENINGEN = {
  kasteel: () => [
    pad('lm-muur', 'M-11 10V-3H-8V-6H-5V-3H-2V-6H2V-3H5V-6H8V-3H11V10Z'),
    pad('lm-muur', 'M-17 10V-10H-9V10ZM9 10V-10H17V10Z'),
    pad('lm-dak', 'M-18 -10L-13 -22L-8 -10ZM8 -10L13 -22L18 -10Z'),
    pad('lm-lijn', 'M13 -22V-28'), pad('lm-vlag', 'M13 -28L20 -26L13 -24Z'),
    pad('lm-donker', 'M-3 10V4Q0 0 3 4V10ZM-14 -6H-12V-2H-14ZM12 -6H14V-2H12Z')],
  molen: () => [
    pad('lm-muur', 'M-7 10L-4 -6H4L7 10Z'), pad('lm-dak', 'M-5 -6Q0 -13 5 -6Z'),
    ...[-3, -1, 1, 3].map((k) => pad('lm-wiek', `M${wiek((k * Math.PI) / 4).map((xy) => xy.join(' ')).join('L')}Z`)),
    maak('svg:circle', { class: 'lm-donker', cx: 0, cy: -8, r: 1.6 }), pad('lm-donker', 'M-2 10V5H2V10Z')],
  tempel: () => [
    pad('lm-steen', 'M-15 10H15V6H-15Z'), pad('lm-zuil', 'M-10 6V-4M-3.5 6V-4M3.5 6V-4M10 6V-4'),
    pad('lm-steen', 'M-14 -4H14V-7H-14Z'), pad('lm-dak', 'M-16 -7L0 -17L16 -7Z')],
  koepel: () => [
    pad('lm-muur', 'M-13 10V-4H13V10Z'), pad('lm-dak', 'M-8 -4Q-8 -17 0 -17Q8 -17 8 -4Z'),
    pad('lm-lijn', 'M0 -17V-24'), pad('lm-vlag', 'M0 -24L7 -22L0 -20Z'),
    pad('lm-donker', 'M-2 10V3H2V10ZM-9 0H-6V4H-9ZM6 0H9V4H6Z')],
  huis: () => [
    pad('lm-muur', 'M-14 10V0H-2V10Z'), pad('lm-dak', 'M-16 0L-8 -9L0 0Z'),
    pad('lm-muur', 'M0 10V-4H13V10Z'), pad('lm-dak', 'M-2 -4L6.5 -14L15 -4Z'),
    pad('lm-donker', 'M-10 10V5H-7V10ZM5 0H8V3H5Z')],
  herberg: () => [
    pad('lm-muur', 'M-12 10V-2H12V10Z'), pad('lm-dak', 'M-15 -2L0 -15L15 -2Z'),
    pad('lm-donker', 'M-3 10V3H3V10ZM-9 2H-6V5H-9Z'),
    pad('lm-lijn', 'M12 1H19V4'), pad('lm-vlag', 'M15 4H22V9H15Z')],
  markt: () => [
    pad('lm-muur', 'M-15 10V2H-1V10ZM1 10V2H15V10Z'),
    pad('lm-dak', 'M-16 2L-14 -6H-2L0 2ZM0 2L2 -6H14L16 2Z'),
    pad('lm-lijn', 'M-10 -6L-11 2M-6 -6V2M6 -6L5 2M10 -6V2')],
  tent: () => [
    pad('lm-muur', 'M-15 10L0 -14L15 10Z'), pad('lm-dak', 'M0 -14L-6 10H-2ZM0 -14L6 10H10Z'),
    pad('lm-lijn', 'M0 -14V-21'), pad('lm-vlag', 'M0 -21L8 -19L0 -17Z'), pad('lm-donker', 'M-3 10L0 4L3 10Z')],
  vuurtoren: () => [
    pad('lm-muur', 'M-6 10L-4 -10H4L6 10Z'), pad('lm-dak', 'M-5.6 5H5.6L5.2 0H-5.2ZM-4.8 -4H4.8L4.5 -8H-4.5Z'),
    pad('lm-vlag', 'M-4 -10V-15H4V-10Z'), pad('lm-dak', 'M-5 -15L0 -20L5 -15Z'),
    pad('lm-lijn', 'M-8 -13H-14M8 -13H14M-7 -17L-12 -21M7 -17L12 -21')],
  boom: () => [
    pad('lm-stam', 'M-7 10V2M7 10V1M0 10V-2'),
    maak('svg:circle', { class: 'lm-groen', cx: -7, cy: -2, r: 6 }), maak('svg:circle', { class: 'lm-groen', cx: 7, cy: -3, r: 6.5 }),
    maak('svg:circle', { class: 'lm-groen', cx: 0, cy: -9, r: 7 })],
  berg: () => [pad('lm-steen', 'M-17 10L-5 -13L3 0L8 -6L17 10Z'), pad('lm-muur', 'M-9 -5L-5 -13L-1 -5L-3 -7L-5 -4L-7 -7Z')],
  uitkijk: () => [
    pad('lm-lijn', 'M-7 10L-4 -6M7 10L4 -6M-6 5L5 -1M6 5L-5 -1'),
    pad('lm-muur', 'M-8 -6H8V-9H-8Z'), pad('lm-dak', 'M-10 -9L0 -18L10 -9Z')],
  school: () => [
    pad('lm-muur', 'M-15 10V-2H15V10Z'), pad('lm-dak', 'M-17 -2L-9 -9H9L17 -2Z'),
    pad('lm-muur', 'M-4 -9V-17H4V-9Z'), pad('lm-dak', 'M-5.5 -17L0 -23L5.5 -17Z'),
    pad('lm-donker', 'M-2 10V4H2V10ZM-11 1H-7V5H-11ZM7 1H11V5H7ZM-1.5 -15H1.5V-12H-1.5Z')],
  baan: () => [
    pad('lm-groen', 'M-16 10L-10 -6H10L16 10Z'), pad('lm-krijt', 'M-13 6H13M-11.5 2H11.5M0 -6V10'),
    pad('lm-lijn', 'M-14.5 2V-2M14.5 2V-2'), pad('lm-net', 'M-14.5 -1H14.5'),
    maak('svg:circle', { class: 'lm-vlag', cx: 6, cy: -11, r: 2.5 })],
  vlag: () => [
    pad('lm-groen', 'M-16 10Q0 1 16 10Q0 15 -16 10Z'), pad('lm-lijn', 'M0 9V-18'), pad('lm-vlag', 'M0 -18L14 -14L0 -10Z')],
};

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
    maak('svg:pattern', { id: 'az-kaart-mist', width: 52, height: 26, patternUnits: 'userSpaceOnUse' },
      maak('svg:path', { class: 'mist', d: 'M3 9H19Q24 9 24 5.5Q24 2 20.5 3M29 22H46Q50 22 50 18.5' })),
    maak('svg:radialGradient', { id: 'az-kaart-gloed' },
      maak('svg:stop', { offset: '0%', class: 'gloed-midden' }), maak('svg:stop', { offset: '100%', class: 'gloed-rand' })),
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
      maak('svg:g', { class: `rijk rijk-${b.kleur}` },
        maak('svg:path', { class: 'rijk-vlak', d: rijkPad(b.punten) }),
        maak('svg:path', { class: 'rijk-mist', d: rijkPad(b.punten) }),
        maak('svg:path', { class: 'rijk-band', d: rijkPad(b.punten) }),
        maak('svg:path', { class: 'rijk-grens', d: rijkPad(b.punten) })),
      maak('svg:text', { 'text-anchor': 'middle' },
        maak('svg:tspan', { class: 'kaart-buurt-titel', x: b.label[0], y: b.label[1] - 15, tekst: b.titel }), ' ',
        maak('svg:tspan', { class: 'kaart-buurt-label', x: b.label[0], y: b.label[1] + 3, tekst: naam })))),
    ...PLEKKEN.map((p) => {
      const [x, y, soort] = KAART.plekken[p.id];
      const knop = svgKnop({ class: 'kaart-pin', 'data-plek': p.id, transform: `translate(${x} ${y}) scale(1.25)`, 'aria-label': p.naam }, () => kies(el, 'plek', p.id),
        maak('svg:ellipse', { class: 'pin-gloed', cx: 0, cy: 6, rx: 26, ry: 14 }),
        maak('svg:ellipse', { class: 'pin-schaduw', cx: 1, cy: 10.5, rx: 16, ry: 3.5 }),
        maak('svg:g', { class: 'pin-lijf' }, ...TEKENINGEN[soort]()),
        maak('svg:circle', { class: 'pin-raak', cx: 0, cy: -4, r: 19 }),
        maak('svg:title', { tekst: p.naam }));
      const toonNaam = (aan) => el.kaart.querySelector(`[data-naam="${p.id}"]`).classList.toggle('zichtbaar', aan || knop.classList.contains('gekozen'));
      knop.addEventListener('pointerenter', () => toonNaam(true));
      knop.addEventListener('pointerleave', () => toonNaam(false));
      knop.addEventListener('focus', () => toonNaam(true));
      knop.addEventListener('blur', () => toonNaam(false));
      return knop;
    }),
    // De namen van plekken liggen bovenop alles en verschijnen bij aanwijzen of kiezen.
    maak('svg:g', { class: 'kaart-namen', 'aria-hidden': 'true' }, ...PLEKKEN.map((p) => {
      const [x, y] = KAART.plekken[p.id];
      return maak('svg:g', { class: 'kaart-naam', 'data-naam': p.id },
        maak('svg:text', { class: 'kaart-naam-rand', x, y: y + 34, 'text-anchor': 'middle', tekst: p.naam }),
        maak('svg:text', { x, y: y + 34, 'text-anchor': 'middle', tekst: p.naam }));
    })),
    windroos(),
    banier(),
    schaal(),
    maak('svg:rect', { class: 'kaart-vezel', width: breedte, height: hoogte }),
    maak('svg:rect', { class: 'kaart-vignet', width: breedte, height: hoogte }),
    kader(breedte, hoogte));
  el.kaart.replaceChildren(svg);
  el.kaartLegenda.replaceChildren(
    maak('span', {}, maak('span', { class: 'legenda-pin ontdekt', 'aria-hidden': 'true' }), 'Plek ontdekt'),
    maak('span', {}, maak('span', { class: 'legenda-pin', 'aria-hidden': 'true' }), 'Nog te ontdekken'),
    'Rijk:',
    ...['in de mist', '1–2×', '3–5×', '6–10×', '11×+'].map((t, i) => maak('span', {}, maak('span', { class: `legenda-vak stap-${i}`, 'aria-hidden': 'true' }), t)));
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
    el.kaart.querySelector(`[data-naam="${g.dataset.plek}"]`).classList.toggle('zichtbaar', g.classList.contains('gekozen') || g.matches(':hover, :focus'));
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
      maak('p', { class: 'zacht', tekst: 'Een plek in kleur heb je ontdekt; een vage plek nog niet. Je eerste bezoek geeft ×2. Een rijk in de mist bezocht je nog niet; hoe voller de kleur, hoe vaker je er was.' }));
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
