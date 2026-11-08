/*
 * Het karakterblad: wie je bent in je wereld. Avatar met uitrustingsvakken, een radar voor je skills
 * en een voor je kringen, de gunfactor als boog en je energie als ring.
 */

import { W } from '../wereld.js';
import { rang, kringen, kringStand, gunfactor, gunLabel, energie, kapitaal, ontgrendeld, pad, dagenInSpel, openTerreinen, loadout, speelstijl } from '../spel.js';
import { maak, icoon, meter, getal } from '../ui.js';
import { radar, boog, ring } from '../grafieken.js';

const { RANGEN, TITELS, EIGENSCHAPPEN, EIGENSCHAP_MAX, KRINGEN, SYMBOLEN, TYPEN, GUNFACTOR, ENERGIE, KAPITAAL, WERELD } = W;

const VAKKEN = 8;
const KRING_MAX = 1000; // de rand van de kringradar: de hoogste stand
// De assen van de radars hebben een korte naam (kort); de volle namen staan in de lijst eronder.

export function toonKarakter(el, spel, st, vandaag) {
  const nu = rang(spel, st);
  const r = RANGEN[nu.index];
  const vrij = ontgrendeld(spel, st);
  const titel = TITELS.find((t) => t.id === spel.titel && vrij.titels.has(t.id));
  const gekozenPad = pad(spel);
  const type = TYPEN.find((t) => t.id === spel.type);

  el.bladRangIcoon.setAttribute('href', `#az-i-${r.icoon}`);
  el.bladNiveau.textContent = r.code ?? `Niv. ${nu.index + 1}`;
  el.bladRang.textContent = r.naam;
  el.bladTitel.textContent = titel ? `“${titel.naam}”` : 'Nog geen titel';
  el.bladUitleg.textContent = r.uitleg;
  el.bladFeiten.replaceChildren(...[
    ['Prestigepunten', `${getal(nu.punten)} PR`],
    [WERELD.bekendheid, `${getal(st.erkenning.score)} · ${st.erkenning.niveau}`],
    ['Pad', gekozenPad?.naam ?? 'nog niet gekozen'],
    ...(TYPEN.length ? [['Type', type?.naam ?? 'nog niet gekozen']] : []),
    ...(W.SPEELSTIJLEN.length ? [['Speelstijl', speelstijl(spel)?.naam ?? 'nog niet gekozen']] : []),
    ...(W.LOADOUT ? [['Loadout', loadout(spel)?.naam ?? 'nog niet gekozen']] : []),
    [WERELD.bezig, `${getal(dagenInSpel(spel))} ${dagenInSpel(spel) === 1 ? 'dag' : 'dagen'}`],
    ['New Game+', spel.ronde ? `${spel.ronde} keer` : 'nog niet'],
  ].map(([dt, dd]) => maak('div', {}, maak('dt', { tekst: dt }), maak('dd', { tekst: dd }))));

  // Uitrusting: je duurste statussymbolen in vaste vakken, de rest leeg.
  const symbolen = SYMBOLEN.filter((s) => st.symbolen.has(s.id)).sort((a, b) => b.punten - a.punten).slice(0, VAKKEN);
  el.vakken.replaceChildren(...Array.from({ length: VAKKEN }, (_, i) => {
    const s = symbolen[i];
    return s
      ? maak('li', { class: 'vak vol', title: s.naam }, icoon(s.icoon), maak('span', { tekst: s.naam }))
      : maak('li', { class: 'vak' }, icoon('lock'), maak('span', { tekst: 'Leeg vak' }));
  }));

  // Skills
  const skills = Object.entries(EIGENSCHAPPEN).map(([k, e]) => ({ k, e, deel: Math.min(1, st.skills[k] / EIGENSCHAP_MAX) }));
  el.radarSkills.replaceChildren(radar('az-radar-skills-svg', 'Skills', skills.map(({ k, deel }) => ({
    naam: EIGENSCHAPPEN[k].kort, deel, tekst: `${Math.floor(deel * 100)} van 100`,
  }))));
  el.eigenschappen.replaceChildren(...skills.map(({ k, e, deel }) => maak('li', { class: `waarde skill-${k}` },
    icoon(e.icoon), maak('span', { class: 'waarde-naam', tekst: e.naam }),
    maak('span', { class: 'skill-waarde', tekst: `${Math.floor(deel * 100)} / 100` }),
    maak('span', { class: 'skill-niveau', tekst: `Niv. ${Math.floor(deel * 10)}` }))));

  // Kringen
  const stand = kringen(spel.logboek);
  el.radarKringen.replaceChildren(radar('az-radar-kringen-svg', 'Kringen', KRINGEN.map((k) => ({
    naam: k.kort, deel: stand[k.id] / KRING_MAX, tekst: `${kringStand(stand[k.id])}, ${getal(stand[k.id])}`,
  }))));
  el.kringen.replaceChildren(...KRINGEN.map((k) => maak('li', { class: stand[k.id] < 0 ? 'waarde kring negatief' : 'waarde kring' },
    icoon(k.icoon, 'icoon kring-icoon'), maak('span', { class: 'waarde-naam', tekst: k.naam }),
    maak('span', { class: 'kring-stand', tekst: `${kringStand(stand[k.id])} · ${getal(stand[k.id])}` }))));

  // Gunfactor en energie
  const g = gunfactor(spel.logboek);
  el.gun.replaceChildren(boog('az-gun-svg', GUNFACTOR.titel, g, [GUNFACTOR.streber, GUNFACTOR.gegund]));
  el.gunWaarde.textContent = gunLabel(g);
  el.gunUitleg.textContent = GUNFACTOR.uitleg[g < GUNFACTOR.streber ? 0 : g >= GUNFACTOR.gegund ? 2 : 1];
  if (ENERGIE && el.energie) toonEnergie(el, spel, vandaag, type);
  if (KAPITAAL.length && el.kapitaal) {
    el.kapitaal.replaceChildren(...kapitaal(spel, st).map((k) => maak('div', {}, maak('dt', {}, icoon(k.icoon), k.naam), maak('dd', { tekst: getal(k.waarde) }))));
  }

  el.pijlers.replaceChildren(...openTerreinen(spel).map((c) => {
    const n = c.activiteiten.filter((a) => st.perActiviteit.has(a.id)).length;
    return maak('li', { class: `terrein cat-${c.kleur}` }, icoon(c.icoon), maak('label', { for: `az-pijler-${c.id}`, tekst: c.naam }),
      maak('span', { class: 'terrein-waarde', tekst: `${n} / ${c.activiteiten.length}` }), meter(`az-pijler-${c.id}`, n / c.activiteiten.length));
  }));

  el.symbolenBehaald.replaceChildren(...(st.symbolen.size
    ? SYMBOLEN.filter((s) => st.symbolen.has(s.id)).map((s) => maak('li', { class: 'trofee' }, icoon(s.icoon), maak('span', { tekst: s.naam })))
    : [maak('li', { class: 'leeg', tekst: WERELD.geenSymbolen })]));
}

// Energie: alleen in een wereld met ENERGIE.
function toonEnergie(el, spel, vandaag, type) {
  const e = energie(spel, vandaag);
  el.energie.replaceChildren(ring('az-energie-svg', 'Energie deze week', Math.max(0, e.over), e.budget, e.over < 25 ? 'ring-laag' : ''));
  el.energieWaarde.textContent = e.over < 0 ? 'Sociale kater' : `${getal(e.over)} van ${getal(e.budget)}`;
  el.energieUitleg.textContent = e.over < 0
    ? 'Je zit over je budget. Activiteiten leveren minder op tot volgende week, behalve wat je oplaadt.'
    : `${type ? type.uitleg : 'Kies je type op de Erelijst.'} Een gezinsdag laadt altijd op.`;
  el.energieBlok.classList.toggle('kater', e.over < 0);
}
