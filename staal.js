/*
 * Camostalen: een stukje camouflage als SVG, getekend uit een soort en een paar kleuren. Het patroon
 * is pseudo-willekeurig maar vast per id, zodat een staal elke keer hetzelfde is.
 * Soorten: effen, vlekken, multicam, digitaal, splinter, stippen, erwten, chips, blad, schubben,
 * strepen, tijger, penseel, lizard, ghillie en speedsoft. De kleuren: de eerste is de grond.
 */

import { maak } from './ui.js';

const B = 120, H = 80;

// Een vaste reeks getallen tussen 0 en 1 per id (mulberry32).
function reeks(id) {
  let a = [...id].reduce((h, t) => Math.imul(h ^ t.charCodeAt(0), 2654435761) >>> 0, 1779033703);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n) => Math.round(n * 10) / 10;

// Een ronde, grillige vlek rond x, y.
function vlek(rnd, x, y, r, punten = 7, rek = 1) {
  const p = Array.from({ length: punten }, (_, i) => {
    const h = (i / punten) * 2 * Math.PI, s = r * (0.6 + rnd() * 0.6);
    return [x + Math.cos(h) * s * rek, y + Math.sin(h) * s];
  });
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(p.at(-1), p[0]);
  return `M${r1(start[0])} ${r1(start[1])}${p.map((q, i) => {
    const m = mid(q, p[(i + 1) % punten]);
    return `Q${r1(q[0])} ${r1(q[1])} ${r1(m[0])} ${r1(m[1])}`;
  }).join('')}Z`;
}

function veelhoek(punten) {
  return `M${punten.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}Z`;
}

const TEKEN = {
  effen: () => [],
  vlekken: (rnd, k) => k.slice(1).flatMap((kleur, i) => Array.from({ length: 9 - i }, () => [kleur, vlek(rnd, rnd() * B, rnd() * H, 9 - i, 7, 1.8)])),
  multicam: (rnd, k) => k.slice(1).flatMap((kleur, i) => Array.from({ length: 10 }, () => [kleur, vlek(rnd, rnd() * B, rnd() * H, 7 - i * 0.8, 8, 1.2), 0.75])),
  digitaal: (rnd, k) => {
    const uit = [], vak = 5;
    for (let x = 0; x < B; x += vak) {
      for (let y = 0; y < H; y += vak) {
        const n = rnd();
        if (n < 0.45) continue;
        const kleur = k[1 + Math.floor(((n - 0.45) / 0.55) * (k.length - 1))] ?? k.at(-1);
        uit.push([kleur, `M${x} ${y}h${vak}v${vak}h-${vak}Z`]);
      }
    }
    return uit;
  },
  splinter: (rnd, k) => k.slice(1).flatMap((kleur) => Array.from({ length: 6 }, () => {
    const x = rnd() * B, y = rnd() * H;
    return [kleur, veelhoek([[x, y], [x + 10 + rnd() * 25, y + rnd() * 8 - 4], [x + 6 + rnd() * 18, y + 6 + rnd() * 12], [x - 6 - rnd() * 10, y + 4 + rnd() * 8]])];
  })),
  stippen: (rnd, k) => k.slice(1).flatMap((kleur, i) => Array.from({ length: 22 - i * 3 }, () => [kleur, vlek(rnd, rnd() * B, rnd() * H, 2.5 + rnd() * 2.5, 6)])),
  erwten: (rnd, k) => k.slice(1).flatMap((kleur) => Array.from({ length: 40 }, () => [kleur, vlek(rnd, rnd() * B, rnd() * H, 1.4 + rnd(), 5)])),
  chips: (rnd, k) => [
    ...k.slice(1, 3).flatMap((kleur) => Array.from({ length: 6 }, () => [kleur, vlek(rnd, rnd() * B, rnd() * H, 10, 8, 1.6)])),
    ...k.slice(3).flatMap((kleur) => Array.from({ length: 14 }, () => [kleur, vlek(rnd, rnd() * B, rnd() * H, 1.6, 5)])),
  ],
  blad: (rnd, k) => k.slice(1).flatMap((kleur) => Array.from({ length: 14 }, () => {
    const x = rnd() * B, y = rnd() * H, l = 5 + rnd() * 7, h = rnd() * Math.PI;
    const [dx, dy] = [Math.cos(h) * l, Math.sin(h) * l], [nx, ny] = [-dy * 0.45, dx * 0.45];
    return [kleur, `M${r1(x - dx)} ${r1(y - dy)}Q${r1(x + nx)} ${r1(y + ny)} ${r1(x + dx)} ${r1(y + dy)}Q${r1(x - nx)} ${r1(y - ny)} ${r1(x - dx)} ${r1(y - dy)}Z`];
  })),
  schubben: (rnd, k) => {
    const uit = [];
    for (let y = 0; y < H + 8; y += 8) {
      for (let x = (y / 8) % 2 ? 6 : 0; x < B + 12; x += 12) {
        const kleur = k[1 + Math.floor(rnd() * (k.length - 1))];
        if (rnd() < 0.55) uit.push([kleur, `M${x - 6} ${y}A6 6 0 0 0 ${x + 6} ${y}L${x} ${y - 6}Z`]);
      }
    }
    return uit;
  },
  strepen: (rnd, k) => k.slice(1).flatMap((kleur) => Array.from({ length: 7 }, () => {
    const x = rnd() * B, y = rnd() * H, l = 14 + rnd() * 18;
    return [kleur, `M${r1(x)} ${r1(y)}q${r1(l / 2)} ${r1(rnd() * 8 - 4)} ${r1(l)} 0q${r1(-l / 2)} ${r1(5 + rnd() * 4)} ${r1(-l)} 0Z`];
  })),
  tijger: (rnd, k) => k.slice(1).flatMap((kleur, i) => Array.from({ length: 4 }, (_, j) => {
    const y = ((j * 4 + i) / 12) * H + rnd() * 4, golf = () => r1(rnd() * 10 - 5);
    return [kleur, `M-5 ${r1(y)}C30 ${r1(y + +golf())} 60 ${r1(y - 6)} 125 ${r1(y + +golf())}L125 ${r1(y + 4)}C80 ${r1(y + 8)} 40 ${r1(y + 2)} -5 ${r1(y + 6)}Z`];
  })),
  penseel: (rnd, k) => k.slice(1).flatMap((kleur) => Array.from({ length: 5 }, () => {
    const x = rnd() * B, y = rnd() * H, l = 18 + rnd() * 20;
    return [kleur, `M${r1(x)} ${r1(y)}l${r1(l)} ${r1(-l * 0.5)}l${r1(3 + rnd() * 3)} ${r1(5 + rnd() * 4)}l${r1(-l)} ${r1(l * 0.55)}Z`];
  })),
  lizard: (rnd, k) => k.slice(1).flatMap((kleur) => Array.from({ length: 18 }, () => {
    const x = rnd() * B, y = rnd() * H, l = 8 + rnd() * 14;
    return [kleur, `M${r1(x)} ${r1(y)}h${r1(l)}v2.5h${r1(-l)}Z`];
  })),
  ghillie: (rnd, k) => k.slice(1).flatMap((kleur) => Array.from({ length: 60 }, () => {
    const x = rnd() * B, y = rnd() * H, dx = rnd() * 10 - 5, dy = 6 + rnd() * 8;
    return [kleur, `M${r1(x)} ${r1(y)}q${r1(dx)} ${r1(dy / 2)} ${r1(dx / 2)} ${r1(dy)}l1 0q${r1(dx / 2)} ${r1(-dy / 2)} ${r1(-dx / 2 + 1)} ${r1(-dy)}Z`];
  })),
  speedsoft: (rnd, k) => [
    [k[1], 'M0 0H50L20 80H0Z'],
    [k[2], 'M58 0H68L38 80H28Z'],
    [k[3], 'M76 0H86L56 80H46Z'],
    [k[1], 'M94 0H120V80H64Z'],
  ],
};

// Een staal als SVG. naam is de toegankelijke naam; zonder naam is het staal versiering.
export function staal(id, spec, naam = null) {
  const rnd = reeks(id);
  const vormen = (TEKEN[spec.soort] ?? TEKEN.effen)(rnd, spec.kleuren);
  return maak('svg:svg', {
    class: 'staal', viewBox: `0 0 ${B} ${H}`, width: B, height: H, preserveAspectRatio: 'xMidYMid slice',
    ...(naam ? { role: 'img', 'aria-label': naam } : { 'aria-hidden': 'true' }),
  },
  maak('svg:rect', { width: B, height: H, fill: spec.kleuren[0] }),
  ...vormen.map(([kleur, d, dekking]) => maak('svg:path', { d, fill: kleur, ...(dekking ? { 'fill-opacity': dekking } : {}) })));
}
