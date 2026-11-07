/*
 * Rangonderscheidingen in de stijl van de NAVO: strepen (chevrons) en een boog voor manschappen en
 * onderofficieren, sterren, een balk en een krans voor officieren. Een rang in RANGEN met een embleem
 * krijgt zo een eigen icoon, als symbool in de sprite (az-i-rang-0, az-i-rang-1, …).
 */

const r1 = (n) => Math.round(n * 10) / 10;

function ster(cx, cy, r) {
  return `M${Array.from({ length: 10 }, (_, i) => {
    const h = -Math.PI / 2 + (i * Math.PI) / 5, s = i % 2 ? r * 0.42 : r;
    return `${r1(cx + s * Math.cos(h))} ${r1(cy + s * Math.sin(h))}`;
  }).join('L')}Z`;
}

// De paden van een embleem in een vlak van 64 bij 64. e: { strepen, boog, sterren, balk, krans }.
export function embleem(e) {
  const d = [];
  const strepen = e.strepen ?? 0, sterren = e.sterren ?? 0;
  if (strepen) {
    const hoog = (strepen - 1) * 9 + 21 + (e.boog ? 12 : 0);
    let y = (64 - hoog) / 2;
    for (let i = 0; i < strepen; i++, y += 9) d.push(`M8 ${y + 14}L32 ${y}L56 ${y + 14}V${y + 21}L32 ${y + 7}L8 ${y + 21}Z`);
    if (e.boog) {
      const b = y - 9 + 24;
      d.push(`M8 ${b}Q32 ${b + 12} 56 ${b}V${b + 6}Q32 ${b + 18} 8 ${b + 6}Z`);
    }
  } else if (sterren) {
    const onder = e.balk || e.krans;
    const cy = onder ? 24 : 32, r = sterren === 1 ? 13 : sterren >= 4 ? 7 : 9.5, stap = sterren >= 4 ? 14.5 : 19;
    for (let i = 0; i < sterren; i++) d.push(ster(32 + (i - (sterren - 1) / 2) * stap, cy, r));
    if (e.balk) d.push('M8 42H56V48H8Z');
    if (e.krans) d.push('M8 38Q32 64 56 38L56 44Q32 70 8 44Z', 'M30 50H34V58H30Z');
  } else {
    d.push('M12 29H52V35H12Z');
  }
  return d;
}
