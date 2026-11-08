/*
 * Rangonderscheidingen, getekend naar die van de Koninklijke Landmacht: V-strepen (glad of in
 * visgraatmotief) voor manschappen en onderofficieren, zes-puntige sterren van ruitjes, een sierbalk
 * en een krans voor officieren, en een lege schouderstrook voor wie nog geen rang heeft.
 * Een rang in RANGEN met een embleem krijgt zo een eigen icoon in de sprite (az-i-rang-0, …).
 * Alles in één kleur (currentColor), in een vlak van 64 bij 64.
 */

const r1 = (n) => Math.round(n * 10) / 10;
const punt = (cx, cy, r, graden) => [r1(cx + r * Math.cos((graden * Math.PI) / 180)), r1(cy + r * Math.sin((graden * Math.PI) / 180))];

// Een ster van zes ruitjes, zoals op de schouder van een officier.
function ster(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const h = -90 + i * 60;
    const [a, b, c] = [punt(cx, cy, r * 0.48, h - 27), punt(cx, cy, r, h), punt(cx, cy, r * 0.48, h + 27)];
    const m = punt(cx, cy, r * 0.08, h);
    return `M${m.join(' ')}L${a.join(' ')}L${b.join(' ')}L${c.join(' ')}Z`;
  }).join('');
}

// Een V-streep met de punt omhoog. Glad, of in visgraatmotief: schuine latjes met kleine openingen.
function streep(y, visgraat, dik = 8) {
  if (!visgraat) return [`M6 ${y + 18}L32 ${y}L58 ${y + 18}V${y + 18 + dik}L32 ${y + dik}L6 ${y + 18 + dik}Z`];
  const d = [];
  const latjes = 7;
  for (const kant of [-1, 1]) {
    for (let i = 0; i < latjes; i++) {
      const t0 = i / latjes, t1 = (i + 0.72) / latjes;
      const x = (t) => r1(32 + kant * 26 * (1 - t));
      const yo = (t) => r1(y + 18 + dik - 18 * t), yb = (t) => r1(y + 18 - 18 * t);
      d.push(`M${x(t0)} ${yo(t0)}L${x(t1)} ${yo(t1)}L${x(t1 + 0.05)} ${yb(t1 + 0.05)}L${x(t0 + 0.05)} ${yb(t0 + 0.05)}Z`);
    }
  }
  return d;
}

const BALK = 'M6 49C12 45 18 47 24 45C28 44 30 46 32 44C34 46 36 44 40 45C46 47 52 45 58 49C52 53 46 51 40 53C36 54 34 52 32 54C30 52 28 54 24 53C18 51 12 53 6 49Z';
const KRANS = [
  'M14 30C8 40 12 52 28 58L30 55C17 50 14 41 18 31Z', 'M50 30C56 40 52 52 36 58L34 55C47 50 50 41 46 31Z',
  'M9 38L14 36L13 42ZM11 47L16 44L16 50ZM55 38L50 36L51 42ZM53 47L48 44L48 50ZM28 57H36V61H28Z',
];

// De paden van een embleem. e: { schouder } of { strepen, visgraat, breed } of { sterren, balk, krans }.
export function embleem(e) {
  if (e.schouder) {
    return ['M18 62V12L32 3L46 12V62ZM21 59H43V13.6L32 6.6L21 13.6Z', 'M32 11A5 5 0 1 1 31.9 11Z'];
  }
  if (e.strepen) {
    const dik = e.breed ? 14 : 8;
    const hoog = (e.strepen - 1) * (dik + 5) + 18 + dik;
    let y = (64 - hoog) / 2;
    const d = [];
    for (let i = 0; i < e.strepen; i++, y += dik + 5) d.push(...streep(y, e.visgraat, dik));
    return d;
  }
  const n = e.sterren ?? 0;
  if (e.krans) return [ster(32, 9, 6.5), ster(13, 23, 6.5), ster(51, 23, 6.5), ster(32, 32, 6.5), ...KRANS];
  if (n === 1 && !e.balk) return [ster(32, 32, 14)];
  if (n === 1) return [ster(32, 24, 11), BALK];
  if (!e.balk) return Array.from({ length: n }, (_, i) => ster(32, 12 + i * (40 / (n - 1)), 8.5));
  return [...Array.from({ length: n }, (_, i) => ster(32, 8 + i * 13, 6.5)), BALK];
}
