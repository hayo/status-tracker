/*
 * Grafieken voor het karakterblad, als SVG met attributen (de CSP staat geen inline stijl toe).
 * Elke grafiek is een role="img" met een titel; de waarden staan ook als tekst ernaast.
 */

import { maak, getal } from './ui.js';

const rond = (n) => Math.round(n * 10) / 10;
const punt = (cx, cy, r, hoek) => [rond(cx + r * Math.cos(hoek)), rond(cy + r * Math.sin(hoek))];

// Een radar (spinnenweb) voor een profiel. assen: [{ naam, deel (0 tot 1), tekst }].
export function radar(id, titel, assen) {
  const breedte = 400, hoogte = 330, cx = 200, cy = 165, r = 105;
  const hoek = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / assen.length;
  const veelhoek = (f) => assen.map((_, i) => punt(cx, cy, r * f(i), hoek(i)).join(',')).join(' ');
  const svg = maak('svg:svg', { class: 'radar', viewBox: `0 0 ${breedte} ${hoogte}`, width: breedte, height: hoogte, role: 'img', 'aria-labelledby': `${id}-titel` },
    maak('svg:title', { id: `${id}-titel`, tekst: `${titel}: ${assen.map((a) => `${a.naam} ${a.tekst}`).join(', ')}` }));
  for (const f of [0.25, 0.5, 0.75, 1]) svg.append(maak('svg:polygon', { class: 'radar-ring', points: veelhoek(() => f) }));
  assen.forEach((a, i) => {
    const [x, y] = punt(cx, cy, r, hoek(i));
    svg.append(maak('svg:line', { class: 'radar-as', x1: cx, y1: cy, x2: x, y2: y }));
    const [lx, ly] = punt(cx, cy, r + 22, hoek(i));
    const anker = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end';
    svg.append(maak('svg:text', { class: 'radar-label', x: lx, y: ly + 4, 'text-anchor': anker, tekst: a.naam }));
  });
  svg.append(maak('svg:polygon', { class: 'radar-vlak', points: veelhoek((i) => Math.max(0.02, Math.min(1, assen[i].deel))) }));
  assen.forEach((a, i) => {
    const [x, y] = punt(cx, cy, r * Math.max(0.02, Math.min(1, a.deel)), hoek(i));
    svg.append(maak('svg:circle', { class: 'radar-punt', cx: x, cy: y, r: 5 }, maak('svg:title', { tekst: `${a.naam}: ${a.tekst}` })));
  });
  return svg;
}

// Een halve boog met een naald, van 0 tot 100, met drie zones.
export function boog(id, titel, waarde, zones = [30, 70]) {
  const cx = 110, cy = 110, r = 85;
  const hoek = (w) => Math.PI + (Math.max(0, Math.min(100, w)) / 100) * Math.PI;
  const stuk = (van, tot, klasse) => {
    const [x1, y1] = punt(cx, cy, r, hoek(van));
    const [x2, y2] = punt(cx, cy, r, hoek(tot));
    return maak('svg:path', { class: `boog-zone ${klasse}`, d: `M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}` });
  };
  const [nx, ny] = punt(cx, cy, r - 18, hoek(waarde));
  return maak('svg:svg', { class: 'boog', viewBox: '0 0 220 150', width: 220, height: 150, role: 'img', 'aria-labelledby': `${id}-titel` },
    maak('svg:title', { id: `${id}-titel`, tekst: `${titel}: ${getal(waarde)} van 100` }),
    stuk(0, zones[0], 'zone-laag'), stuk(zones[0], zones[1], 'zone-midden'), stuk(zones[1], 100, 'zone-hoog'),
    maak('svg:line', { class: 'boog-naald', x1: cx, y1: cy, x2: nx, y2: ny }),
    maak('svg:circle', { class: 'boog-as', cx, cy, r: 7 }),
    maak('svg:text', { class: 'boog-waarde', x: cx, y: cy + 36, 'text-anchor': 'middle', tekst: getal(waarde) }));
}

// Een ring die vol of leeg loopt, met het getal in het midden.
export function ring(id, titel, waarde, max, klasse = '') {
  const r = 52, omtrek = 2 * Math.PI * r;
  const deel = Math.max(0, Math.min(1, waarde / max));
  return maak('svg:svg', { class: `ring ${klasse}`, viewBox: '0 0 140 140', width: 140, height: 140, role: 'img', 'aria-labelledby': `${id}-titel` },
    maak('svg:title', { id: `${id}-titel`, tekst: `${titel}: ${getal(waarde)} van ${getal(max)}` }),
    maak('svg:circle', { class: 'ring-spoor', cx: 70, cy: 70, r }),
    maak('svg:circle', { class: 'ring-vulling', cx: 70, cy: 70, r, 'stroke-dasharray': `${rond(omtrek * deel)} ${rond(omtrek)}`, transform: 'rotate(-90 70 70)' }),
    maak('svg:text', { class: 'ring-waarde', x: 70, y: 78, 'text-anchor': 'middle', tekst: getal(waarde) }));
}
