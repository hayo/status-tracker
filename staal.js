/*
 * Camostalen: een stukje echte camouflage. Een staal is een foto van het patroon (beeld), of een
 * effen kleur als er geen patroon is. In de vorm van een helm (vorm 'helm') of als rechthoek ('vlak').
 * De foto's komen van Wikimedia Commons, met een vrije licentie; de bron staat bij elk staal.
 */

import { maak } from './ui.js';

const B = 120, H = 80;

// Een helm van opzij, met de voorkant rechts: koepel, uitsparing voor het oor en een NVG-mount.
const HELM = 'M14 66C10 36 30 12 58 12C84 12 104 30 106 54L106 62L92 62C92 54 86 49 78 49L70 49C63 49 60 55 60 62L60 66Z';
const HELM_DETAIL = 'M96 26h9v11h-9zM24 44C40 41 60 41 80 43M22 52C30 51 40 51 50 52';

let teller = 0;

// Een staal als SVG. spec: { beeld?, kleuren? }. naam is de toegankelijke naam; zonder naam is het versiering.
export function staal(spec, naam = null, vorm = 'vlak') {
  const id = `az-staal-${++teller}`;
  const vulling = spec.beeld
    ? maak('svg:image', { href: spec.beeld, width: B, height: H, preserveAspectRatio: 'xMidYMid slice' })
    : maak('svg:rect', { width: B, height: H, fill: spec.kleuren?.[0] ?? '#8a8a6a' });
  const strepen = spec.strepen ? spec.strepen.map(([kleur, d]) => maak('svg:path', { d, fill: kleur })) : [];
  const svg = maak('svg:svg', {
    class: `staal staal-${vorm}`, viewBox: `0 0 ${B} ${H}`, width: B, height: H, preserveAspectRatio: 'xMidYMid slice',
    ...(naam ? { role: 'img', 'aria-label': naam } : { 'aria-hidden': 'true' }),
  });
  if (vorm === 'helm') {
    svg.append(
      maak('svg:defs', {}, maak('svg:clipPath', { id }, maak('svg:path', { d: HELM }))),
      maak('svg:ellipse', { class: 'helm-schaduw', cx: 60, cy: 70, rx: 46, ry: 5 }),
      maak('svg:g', { 'clip-path': `url(#${id})` }, vulling, ...strepen),
      maak('svg:path', { class: 'helm-rand', d: HELM }),
      maak('svg:path', { class: 'helm-detail', d: HELM_DETAIL }));
  } else {
    svg.append(vulling, ...strepen);
  }
  return svg;
}
