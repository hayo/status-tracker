/*
 * Kleine hulpjes voor de pagina, gedeeld door app.js en de schermen.
 * Tekst gaat altijd via textContent, dus notities en namen kunnen geen HTML injecteren.
 */

const SVG = 'http://www.w3.org/2000/svg';

export function maak(tag, eigen = {}, ...kinderen) {
  const e = tag.startsWith('svg:') ? document.createElementNS(SVG, tag.slice(4)) : document.createElement(tag);
  for (const [k, v] of Object.entries(eigen)) {
    if (v === undefined || v === false || v === null) continue;
    if (k === 'tekst') e.textContent = v;
    else if (k === 'bij') e.addEventListener(e.tagName === 'INPUT' ? 'change' : 'click', v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  e.append(...kinderen.filter((k) => k !== null && k !== undefined));
  return e;
}

export const icoon = (naam, klasse = 'icoon') => maak('svg:svg', { class: klasse, 'aria-hidden': 'true', focusable: 'false' }, maak('svg:use', { href: `#az-i-${naam}` }));
export const meter = (id, deel) => maak('span', { class: 'spoor' }, maak('meter', { id, min: 0, max: 1, value: Math.min(1, Math.max(0, deel)) }));
export const getal = (n) => Math.round(n).toLocaleString('nl');
// Punten met hun teken: +30 of −30.
export const metTeken = (n) => `${n < 0 ? '−' : '+'}${getal(Math.abs(n))}`;
export const factor = (f) => `×${f.toLocaleString('nl', { maximumFractionDigits: 2 })}`;

// Een SVG-element dat met Enter en spatie werkt als knop.
export function svgKnop(eigen, actie, ...kinderen) {
  const g = maak('svg:g', { role: 'button', tabindex: 0, ...eigen }, ...kinderen);
  g.addEventListener('click', actie);
  g.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      actie();
    }
  });
  return g;
}
