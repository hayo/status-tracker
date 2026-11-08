/*
 * Lintjes: elke patch als een baton op een lintjesbalk, zoals op een uniform. Elk lint is symmetrisch
 * gestreept. Grondkleur en strepen komen van het id, zodat een patch altijd hetzelfde lint heeft;
 * de kleur van de skill komt meestal terug als streep. Hoge patches krijgen een gouden sterretje.
 */

import { maak } from './ui.js';

// De kleur van elke skill; die komt terug als streep. Een skill die hier niet staat, krijgt olijf.
const GROND = {
  precisie: '#8a2b1d', cqb: '#b0602a', stealth: '#2b331c', tactiek: '#2f4a6b', conditie: '#45552a', techniek: '#57445f',
  sociaal: '#2f5d50', netwerk: '#33475e', cultuur: '#57445f', vermogen: '#7c5a14', discretie: '#262a1c', lokaal: '#45552a',
};
const GRONDEN = ['#2f4a6b', '#8a2b1d', '#3f6b3a', '#7c5a14', '#57445f', '#b0602a', '#2b331c', '#c9a44c', '#5b7fa8', '#9b3a5a', '#2f5d50', '#d8d2bf'];
const KLEUREN = ['#c9a44c', '#f3eedc', '#1c1f16', '#8a2b1d', '#2f4a6b', '#3f6b3a', '#d8d2bf'];
const B = 36, H = 12;

// Een getal uit een tekst, steeds hetzelfde voor dezelfde tekst.
function hash(tekst) {
  let h = 2166136261;
  for (const t of tekst) h = Math.imul(h ^ t.codePointAt(0), 16777619);
  return h >>> 0;
}

// Strepen als [breedte, kleur] van de rand naar het midden; de rest is gespiegeld.
function strepen(s) {
  const h = hash(s.id);
  // De grondkleur verschilt per lint; de kleur van de skill komt terug als streep.
  const skill = GROND[s.eigenschap] ?? '#4b5a2e';
  let grond = GRONDEN[h % GRONDEN.length];
  if (grond === skill) grond = GRONDEN[(h >>> 3) % GRONDEN.length];
  const a = (h >>> 12) % 3 ? skill : KLEUREN[(h >>> 4) % KLEUREN.length];
  let b = KLEUREN[(h >>> 4) % KLEUREN.length];
  if (b === a || b === grond) b = KLEUREN[(h >>> 5) % KLEUREN.length];
  return [
    [[2, a], [16, grond]],
    [[18, grond]],
    [[5, grond], [2, a], [11, grond]],
    [[3, a], [4, grond], [2, b], [9, grond]],
    [[6, grond], [2, a], [2, b], [2, a], [6, grond]],
    [[1, b], [5, grond], [3, a], [9, grond]],
    [[8, grond], [10, a]],
    [[4, a], [14, grond]],
  ][(h >>> 8) % 8];
}

export function lint(s, metSter = false) {
  const rects = [];
  let x = 0;
  for (const [w, kleur] of strepen(s)) {
    rects.push(maak('svg:rect', { x, y: 0, width: w, height: H, fill: kleur }));
    rects.push(maak('svg:rect', { x: B - x - w, y: 0, width: w, height: H, fill: kleur }));
    x += w;
  }
  // Een gouden sterretje voor de hoge patches, zoals een onderscheiding op het lint.
  const ster = metSter ? [maak('svg:path', { class: 'lint-ster', d: 'M18 2.2l1.1 2.6 2.8.2-2.1 1.8.7 2.7L18 8l-2.5 1.5.7-2.7-2.1-1.8 2.8-.2z' })] : [];
  return maak('svg:svg', { class: 'lint', viewBox: `0 0 ${B} ${H}`, width: B, height: H, role: 'img', 'aria-label': s.naam },
    maak('svg:title', { tekst: s.naam }), ...rects, ...ster,
    maak('svg:rect', { class: 'lint-rand', x: 0.25, y: 0.25, width: B - 0.5, height: H - 0.5 }));
}

// Een lintjesbalk: rijen van per stuks, de hoogste bovenaan. Een onvolle rij staat bovenaan, in het midden.
export function lintjesbalk(symbolen, per = 6, sterVanaf = 1500) {
  const rest = symbolen.length % per;
  const rijen = [];
  let i = 0;
  if (rest) { rijen.push(symbolen.slice(0, rest)); i = rest; }
  for (; i < symbolen.length; i += per) rijen.push(symbolen.slice(i, i + per));
  return rijen.map((rij) => maak('ul', { class: 'lintjes-rij' },
    ...rij.map((s) => maak('li', {}, lint(s, s.punten >= sterVanaf)))));
}
