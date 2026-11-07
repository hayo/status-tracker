/*
 * Wassenaar Aanzien: houd bij hoe je aanzien in Wassenaar groeit.
 * Alles staat in localStorage van deze browser. Punten en eigenschappen worden steeds
 * opnieuw uitgerekend uit het logboek, zodat een verwijderde regel ook echt meetelt.
 * Verhoog bij elke wijziging de versie in gegevens.js én VERSIE in sw.js.
 */

import { VERSIES, RANGEN, EIGENSCHAPPEN, EIGENSCHAP_MAX, CATEGORIEEN, SYMBOLEN, STARTVRAGEN } from './gegevens.js';

const SLEUTEL = 'wassenaar_renown';
const WEERGAVEN = ['start', 'status', 'loggen', 'symbolen', 'strategie', 'gegevens', 'wijzigingen'];
const KALENDER_WEKEN = 17;
const STAAF_WEKEN = 8;
const KALENDER_STAPPEN = [1, 30, 80, 200]; // ondergrens in PR per dag voor stap 1 tot 4
const ACTIVITEITEN = new Map(CATEGORIEEN.flatMap((c) => c.activiteiten.map((a) => [a.id, { ...a, categorie: c.naam }])));

const el = {};
for (const e of document.querySelectorAll('[id]')) el[e.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = e;

const getal = (n) => Math.round(n).toLocaleString('nl');
const datumKort = new Intl.DateTimeFormat('nl', { day: 'numeric', month: 'short' });
const datumLang = new Intl.DateTimeFormat('nl', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const twee = (n) => String(n).padStart(2, '0');
const dagSleutel = (d) => `${d.getFullYear()}-${twee(d.getMonth() + 1)}-${twee(d.getDate())}`;
const alsDatum = (s) => { const [j, m, d] = s.split('-').map(Number); return new Date(j, m - 1, d); };
const plusDagen = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const maandag = (d) => plusDagen(d, -((d.getDay() + 6) % 7));
const nieuwId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const SVG = 'http://www.w3.org/2000/svg';

// Maakt een element. Tekst gaat altijd via textContent, dus notities kunnen geen HTML injecteren.
function maak(tag, eigen = {}, ...kinderen) {
  const e = tag.startsWith('svg:') ? document.createElementNS(SVG, tag.slice(4)) : document.createElement(tag);
  for (const [k, v] of Object.entries(eigen)) {
    if (v === undefined || v === false) continue;
    if (k === 'tekst') e.textContent = v;
    else if (k === 'bij') e.addEventListener('click', v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  e.append(...kinderen.filter((k) => k !== null && k !== undefined));
  return e;
}
const icoon = (naam, klasse = 'icoon') => maak('svg:svg', { class: klasse, 'aria-hidden': 'true', focusable: 'false' }, maak('svg:use', { href: `#i-${naam}` }));

/* ---------- Opslag ---------- */

let logboek = null; // null zolang de startvragen niet zijn beantwoord

function laad() {
  let ruw = null;
  try { ruw = JSON.parse(localStorage.getItem(SLEUTEL)); } catch { /* geen opslag of kapotte gegevens */ }
  return ruw ? leesIn(ruw) : null;
}

// Zet opgeslagen gegevens om naar een logboek. Kent ook het formaat van versie 1.
function leesIn(ruw) {
  if (typeof ruw !== 'object') throw new Error('Geen geldig bestand.');
  if (ruw.versie === 2 && Array.isArray(ruw.logboek)) return ruw.logboek.filter((r) => r && typeof r.datum === 'string' && Number.isFinite(r.punten));
  if (!Number.isFinite(ruw.points)) throw new Error('Geen geldig bestand.');
  const oud = (Array.isArray(ruw.history) ? ruw.history : []).map((h) => ({
    id: nieuwId(),
    datum: dagSleutel(new Date(h.date)),
    naam: String(h.desc ?? ''),
    punten: Number(h.points) || 0,
    eigenschappen: {},
    ...(h.desc === 'Eerste Inschatting Voltooid' ? { start: true } : {}),
  }));
  // Versie 1 bewaarde maar 50 regels. De rest van de punten, de eigenschappen en de symbolen gaan in één regel.
  const rest = ruw.points - oud.reduce((s, r) => s + r.punten, 0);
  const eerste = oud.map((r) => r.datum).sort()[0] ?? dagSleutel(new Date());
  return [...oud, {
    id: nieuwId(), datum: eerste, naam: 'Eerdere stand overgenomen', punten: rest,
    eigenschappen: ruw.skills ?? {}, symbolen: Array.isArray(ruw.milestones) ? ruw.milestones : [], start: true,
  }];
}

function bewaar() {
  try { localStorage.setItem(SLEUTEL, JSON.stringify({ versie: 2, logboek })); } catch { meld('Opslaan lukte niet. Bewaar je gegevens als bestand.'); }
}

/* ---------- Rekenen ---------- */

const totaal = () => logboek.reduce((s, r) => s + r.punten, 0);
const behaald = () => new Set(logboek.flatMap((r) => r.symbolen ?? []));
const gesorteerd = () => [...logboek].sort((a, b) => b.datum.localeCompare(a.datum) || (b.tijd ?? '').localeCompare(a.tijd ?? ''));
const rangIndex = (p) => RANGEN.findLastIndex((r) => p >= r.min);
const telt = (r) => !r.start; // startregels tellen niet mee in kalender, weken en reeks

function eigenschappen() {
  const som = Object.fromEntries(Object.keys(EIGENSCHAPPEN).map((k) => [k, 0]));
  for (const r of logboek) for (const [k, v] of Object.entries(r.eigenschappen ?? {})) if (k in som) som[k] += v;
  return som;
}

// Per week, vanaf maandag: aantal regels en punten.
function perWeek(weken) {
  const eerste = maandag(plusDagen(new Date(), -7 * (weken - 1)));
  const lijst = Array.from({ length: weken }, (_, i) => ({ van: plusDagen(eerste, 7 * i), aantal: 0, punten: 0 }));
  for (const r of logboek) {
    const i = Math.floor((alsDatum(r.datum) - eerste) / 864e5 / 7);
    if (i >= 0 && i < weken && telt(r)) { lijst[i].aantal++; lijst[i].punten += r.punten; }
  }
  return lijst;
}

function reeks() {
  const actief = new Set(logboek.filter(telt).map((r) => dagSleutel(maandag(alsDatum(r.datum)))));
  let week = maandag(new Date());
  if (!actief.has(dagSleutel(week))) week = plusDagen(week, -7);
  let n = 0;
  while (actief.has(dagSleutel(week))) { n++; week = plusDagen(week, -7); }
  return n;
}

/* ---------- Weergave ---------- */

function toonStatus() {
  const p = totaal();
  const i = rangIndex(p);
  const rang = RANGEN[i], volgende = RANGEN[i + 1];
  el.punten.textContent = getal(p);
  el.rangNaam.textContent = rang.naam;
  el.rangUitleg.textContent = rang.uitleg;
  el.voortgang.value = volgende ? Math.min(100, ((p - rang.min) / (volgende.min - rang.min)) * 100) : 100;
  el.voortgangTekst.textContent = volgende ? `Nog ${getal(volgende.min - p)} PR tot ${volgende.naam}` : 'Je hebt de hoogste rang';
  el.ladder.replaceChildren(...RANGEN.map((r, j) => maak('li', {
    class: j < i ? 'gehaald' : j === i ? 'nu' : undefined,
    'aria-current': j === i ? 'step' : undefined,
  }, maak('span', { class: 'ladder-naam', tekst: r.naam }), maak('span', { class: 'ladder-min', tekst: getal(r.min) }))));

  const weken = perWeek(KALENDER_WEKEN);
  const nu = weken.at(-1);
  el.cijfers.replaceChildren(...[
    ['Deze week', `${getal(nu.punten)} PR`],
    ['Weken op rij actief', getal(reeks())],
    ['Activiteiten gelogd', getal(logboek.filter((r) => telt(r) && !r.symbolen).length)],
    ['Statussymbolen', `${behaald().size} van ${SYMBOLEN.length}`],
  ].map(([dt, dd]) => maak('div', { class: 'cijfer' }, maak('dt', { tekst: dt }), maak('dd', { tekst: dd }))));

  toonKalender();
  toonWeken(weken.slice(-STAAF_WEKEN));
  el.wekenTabel.tBodies[0].replaceChildren(...weken.slice().reverse().map((w) => maak('tr', {},
    maak('th', { scope: 'row', tekst: datumKort.format(w.van) }), maak('td', { tekst: getal(w.aantal) }), maak('td', { tekst: getal(w.punten) }))));

  const eig = eigenschappen();
  el.eigenschappen.replaceChildren(...Object.entries(EIGENSCHAPPEN).map(([k, naam]) =>
    balk(`eig-${k}`, naam, `${getal(eig[k])} PR`, eig[k] / EIGENSCHAP_MAX)));

  const gedaan = new Set(logboek.map((r) => r.activiteit));
  el.pijlers.replaceChildren(...CATEGORIEEN.map((c) => {
    const n = c.activiteiten.filter((a) => gedaan.has(a.id)).length;
    return balk(`pijler-${c.id}`, c.naam, `${n} van ${c.activiteiten.length}`, n / c.activiteiten.length);
  }));

  const regels = gesorteerd().slice(0, 12);
  el.logboek.replaceChildren(...(regels.length ? regels.map(logRegel) : [maak('li', { class: 'leeg', tekst: 'Nog niets gelogd.' })]));
}

function balk(id, naam, waarde, deel) {
  return maak('li', { class: 'balk' },
    maak('label', { class: 'balk-naam', for: id, tekst: naam }), maak('span', { class: 'balk-waarde', tekst: waarde }),
    maak('meter', { id, min: 0, max: 1, value: Math.min(1, Math.max(0, deel)) }));
}

function logRegel(r) {
  return maak('li', {},
    maak('div', { class: 'log-tekst' },
      maak('p', { class: 'log-naam', tekst: r.naam }),
      r.notitie ? maak('p', { class: 'log-notitie', tekst: r.notitie }) : null,
      maak('time', { class: 'klein', datetime: r.datum, tekst: datumLang.format(alsDatum(r.datum)) })),
    maak('span', { class: 'log-punten', tekst: `${r.punten < 0 ? '' : '+'}${getal(r.punten)}` }),
    maak('button', { type: 'button', class: 'knop-icoon', 'aria-label': `Haal uit logboek: ${r.naam}`, bij: () => haalWeg(r) }, icoon('weg')));
}

function toonKalender() {
  const cel = 14, gat = 3, links = 26, boven = 18;
  const vandaag = new Date();
  const eerste = maandag(plusDagen(vandaag, -7 * (KALENDER_WEKEN - 1)));
  const perDag = new Map();
  for (const r of logboek) {
    if (!telt(r)) continue;
    const d = perDag.get(r.datum) ?? { aantal: 0, punten: 0 };
    d.aantal++; d.punten += r.punten;
    perDag.set(r.datum, d);
  }
  const breedte = links + KALENDER_WEKEN * (cel + gat), hoogte = boven + 7 * (cel + gat);
  const svg = maak('svg:svg', { class: 'kalender-svg', viewBox: `0 0 ${breedte} ${hoogte}`, role: 'img', 'aria-labelledby': 'kalender-titel' },
    maak('svg:title', { id: 'kalender-titel', tekst: `Kalender: op ${perDag.size} dagen iets gelogd. De cijfers per week staan in de tabel.` }));
  ['ma', 'wo', 'vr'].forEach((t, i) => svg.append(maak('svg:text', { class: 'as-tekst', x: 0, y: boven + (i * 2) * (cel + gat) + 11, tekst: t })));
  let maand = -1;
  for (let w = 0; w < KALENDER_WEKEN; w++) {
    const x = links + w * (cel + gat);
    const start = plusDagen(eerste, 7 * w);
    if (start.getMonth() !== maand) {
      maand = start.getMonth();
      if (w < KALENDER_WEKEN - 1) svg.append(maak('svg:text', { class: 'as-tekst', x, y: 11, tekst: datumKort.formatToParts(start).find((p) => p.type === 'month').value }));
    }
    for (let d = 0; d < 7; d++) {
      const dag = plusDagen(start, d);
      if (dag > vandaag) continue;
      const info = perDag.get(dagSleutel(dag));
      const stap = info ? KALENDER_STAPPEN.findLastIndex((g) => info.punten >= g) + 1 : 0;
      svg.append(maak('svg:rect', { class: `dag stap-${stap}`, x, y: boven + d * (cel + gat), width: cel, height: cel, rx: 3 },
        maak('svg:title', { tekst: `${datumLang.format(dag)}: ${info ? `${info.aantal} gelogd, ${getal(info.punten)} PR` : 'niets gelogd'}` })));
    }
  }
  el.kalender.replaceChildren(svg);
  const vakjes = ['0', ...KALENDER_STAPPEN.map((g, i) => (KALENDER_STAPPEN[i + 1] ? `${g}–${KALENDER_STAPPEN[i + 1] - 1}` : `${g}+`))];
  el.kalenderLegenda.replaceChildren('PR per dag:', ...vakjes.map((t, i) => maak('span', { class: 'legenda-stap' }, maak('span', { class: `legenda-vak stap-${i}`, 'aria-hidden': 'true' }), t)));
}

function toonWeken(weken) {
  const breedte = 320, hoogte = 140, boven = 16, onder = 18, vak = breedte / weken.length, staaf = Math.min(28, vak - 8);
  const max = Math.max(...weken.map((w) => w.punten), 1);
  const hoogste = weken.findIndex((w) => w.punten === max);
  const svg = maak('svg:svg', { class: 'weken-svg', viewBox: `0 0 ${breedte} ${hoogte}`, role: 'img', 'aria-labelledby': 'weken-titel' },
    maak('svg:title', { id: 'weken-titel', tekst: `Punten per week, de laatste ${weken.length} weken. De cijfers staan in de tabel.` }),
    maak('svg:line', { class: 'as-lijn', x1: 0, x2: breedte, y1: hoogte - onder, y2: hoogte - onder }));
  weken.forEach((w, i) => {
    const h = Math.max(w.punten ? 2 : 0, ((hoogte - boven - onder) * w.punten) / max);
    const x = i * vak + (vak - staaf) / 2, y = hoogte - onder - h, r = Math.min(4, h);
    const midden = i * vak + vak / 2;
    svg.append(maak('svg:path', { class: 'week-staaf', d: `M${x} ${hoogte - onder}V${y + r}q0 -${r} ${r} -${r}h${staaf - 2 * r}q${r} 0 ${r} ${r}V${hoogte - onder}z` },
      maak('svg:title', { tekst: `Week van ${datumKort.format(w.van)}: ${getal(w.punten)} PR` })));
    svg.append(maak('svg:text', { class: 'as-tekst', x: midden, y: hoogte - 4, 'text-anchor': 'middle', tekst: datumKort.format(w.van) }));
    if ((i === weken.length - 1 || i === hoogste) && w.punten > 0) {
      svg.append(maak('svg:text', { class: 'week-waarde', x: midden, y: y - 4, 'text-anchor': 'middle', tekst: getal(w.punten) }));
    }
  });
  el.weken.replaceChildren(svg);
}

function actieKnop(a, info, bij) {
  return maak('li', {}, maak('button', { type: 'button', class: 'actie', bij },
    maak('span', { class: 'actie-naam', tekst: a.naam }),
    maak('span', { class: 'actie-info', tekst: info }),
    maak('span', { class: 'actie-punten', tekst: `+${getal(a.punten)}` })));
}

function bouwActiviteiten() {
  el.activiteiten.replaceChildren(...CATEGORIEEN.map((c) => maak('section', { class: 'kaart categorie', 'aria-labelledby': `cat-${c.id}` },
    maak('h3', { id: `cat-${c.id}`, tekst: c.naam }),
    maak('ul', { class: 'acties' }, ...c.activiteiten.map((a) => actieKnop(a, EIGENSCHAPPEN[a.eigenschap], () => vraagLog(a)))))));
}

function toonVaak() {
  const tel = new Map();
  for (const r of logboek) if (ACTIVITEITEN.has(r.activiteit)) tel.set(r.activiteit, (tel.get(r.activiteit) ?? 0) + 1);
  const top = [...tel].sort((a, b) => b[1] - a[1]).slice(0, 5);
  el.vaakBlok.hidden = !top.length;
  el.vaak.replaceChildren(...top.map(([id, n]) => {
    const a = ACTIVITEITEN.get(id);
    return actieKnop(a, `${n} keer gedaan`, () => vraagLog(a));
  }));
}

function filter() {
  const woorden = el.zoek.value.toLocaleLowerCase('nl').split(/\s+/).filter(Boolean);
  let iets = false;
  for (const sectie of el.activiteiten.children) {
    let hier = false;
    for (const li of sectie.querySelectorAll('li')) {
      const tekst = li.textContent.toLocaleLowerCase('nl') + sectie.querySelector('h3').textContent.toLocaleLowerCase('nl');
      li.hidden = !woorden.every((w) => tekst.includes(w));
      hier ||= !li.hidden;
    }
    sectie.hidden = !hier;
    iets ||= hier;
  }
  el.nietsGevonden.hidden = iets;
  el.vaakBlok.hidden = woorden.length > 0 || !el.vaak.children.length;
}

function toonSymbolen() {
  const ja = behaald();
  const regel = (s) => actieKnop(s, EIGENSCHAPPEN[s.eigenschap], () => vraagLog(s, true));
  el.symbolenBehaald.replaceChildren(...(ja.size
    ? SYMBOLEN.filter((s) => ja.has(s.id)).map((s) => maak('li', { class: 'symbool' }, icoon('medaille'), maak('span', { tekst: s.naam })))
    : [maak('li', { class: 'leeg', tekst: 'Nog geen statussymbolen. Kies er een als je hem bereikt hebt.' })]));
  el.symbolenOpen.replaceChildren(...SYMBOLEN.filter((s) => !ja.has(s.id)).map(regel));
}

function toonVersies() {
  el.versie.textContent = VERSIES[0].versie;
  el.versies.replaceChildren(...VERSIES.flatMap((v) => [
    maak('h3', {}, `Versie ${v.versie}, `, maak('time', { datetime: v.datum, tekst: datumLang.format(alsDatum(v.datum)) })),
    maak('ul', {}, ...v.wijzigingen.map((w) => maak('li', { tekst: w }))),
  ]));
}

function bouwStart() {
  el.startFormulier.prepend(...STARTVRAGEN.map((v, i) => maak('fieldset', { class: 'keuze' },
    maak('legend', { tekst: `${i + 1}. ${v.vraag}` }),
    ...v.antwoorden.map(([tekst, punten], j) => maak('label', { class: 'keuze-optie' },
      maak('input', { type: 'radio', name: v.id, value: punten, required: true, checked: j === 0 }), maak('span', { tekst: tekst }))))));
}

function verwerk() {
  toonStatus();
  toonVaak();
  filter();
  toonSymbolen();
}

/* ---------- Acties ---------- */

let teLoggen = null;

function vraagLog(item, symbool = false) {
  teLoggen = { item, symbool };
  el.logTitel.textContent = item.naam;
  el.logInfo.textContent = `+${getal(item.punten)} PR · ${EIGENSCHAPPEN[item.eigenschap]}${symbool ? ' · statussymbool' : ''}`;
  el.logDatum.value = dagSleutel(new Date());
  el.logDatum.max = el.logDatum.value;
  el.logNotitie.value = '';
  el.logVenster.showModal();
}

function voegToe(regel) {
  const voor = rangIndex(totaal());
  logboek.push({ id: nieuwId(), tijd: new Date().toISOString(), ...regel });
  bewaar();
  verwerk();
  const na = rangIndex(totaal());
  if (na > voor) {
    el.nieuweRang.textContent = RANGEN[na].naam;
    el.rangVenster.showModal();
  }
}

el.logVenster.addEventListener('close', () => {
  if (el.logVenster.returnValue !== 'ja' || !teLoggen) return;
  const { item, symbool } = teLoggen;
  teLoggen = null;
  const notitie = el.logNotitie.value.trim();
  voegToe({
    datum: el.logDatum.value || dagSleutel(new Date()),
    naam: symbool ? `Statussymbool: ${item.naam}` : item.naam,
    punten: item.punten,
    eigenschappen: { [item.eigenschap]: item.punten },
    ...(symbool ? { symbolen: [item.id] } : { activiteit: item.id }),
    ...(notitie ? { notitie } : {}),
  });
  meld(`+${getal(item.punten)} PR. Opgeslagen.`);
});

function vraag(titel, tekst, knop, ja) {
  el.vraagTitel.textContent = titel;
  el.vraagTekst.textContent = tekst;
  el.vraagJa.textContent = knop;
  el.vraagVenster.returnValue = '';
  el.vraagVenster.addEventListener('close', () => { if (el.vraagVenster.returnValue === 'ja') ja(); }, { once: true });
  el.vraagVenster.showModal();
}

function haalWeg(r) {
  vraag('Uit het logboek halen?', `"${r.naam}" gaat uit het logboek. Je verliest ${getal(r.punten)} PR.`, 'Haal weg', () => {
    logboek = logboek.filter((x) => x.id !== r.id);
    bewaar();
    verwerk();
    meld('Uit het logboek gehaald.');
  });
}

el.startFormulier.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(el.startFormulier);
  const eig = {};
  let punten = 0;
  for (const v of STARTVRAGEN) {
    const p = Number(data.get(v.id));
    punten += p;
    eig[v.eigenschap] = (eig[v.eigenschap] ?? 0) + p * v.deel;
  }
  logboek = [];
  voegToe({ datum: dagSleutel(new Date()), naam: 'Startpunt berekend', punten, eigenschappen: eig, start: true });
  location.hash = '#status';
  meld(`Welkom in Wassenaar. Je begint als ${RANGEN[rangIndex(punten)].naam}.`);
});

el.bewaarKnop.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ versie: 2, logboek }, null, 1)], { type: 'application/json' }));
  maak('a', { href: url, download: `wassenaar-aanzien-${dagSleutel(new Date())}.json` }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

el.terugzetBestand.addEventListener('change', async () => {
  const bestand = el.terugzetBestand.files[0];
  el.terugzetBestand.value = '';
  if (!bestand) return;
  let nieuw;
  try { nieuw = leesIn(JSON.parse(await bestand.text())); } catch { meld('Dit bestand kan de app niet lezen.'); return; }
  vraag('Bestand terugzetten?', `Je huidige gegevens worden vervangen door ${nieuw.length} regels uit "${bestand.name}".`, 'Zet terug', () => {
    logboek = nieuw;
    bewaar();
    verwerk();
    location.hash = '#status';
    meld('Je gegevens zijn teruggezet.');
  });
});

el.wisKnop.addEventListener('click', () => vraag('Alles wissen?', 'Al je punten, je logboek en je symbolen gaan weg.', 'Wis alles', () => {
  try { localStorage.removeItem(SLEUTEL); } catch { /* niets te wissen */ }
  logboek = null;
  location.hash = '#start';
  toon();
}));

el.zoek.addEventListener('input', filter);

let meldKlok;
function meld(tekst) {
  el.melding.textContent = tekst;
  el.melding.classList.add('zichtbaar');
  clearTimeout(meldKlok);
  meldKlok = setTimeout(() => el.melding.classList.remove('zichtbaar'), 4000);
}

/* ---------- Navigatie ---------- */

function toon(verplaatsFocus = false) {
  let id = location.hash.slice(1);
  if (!logboek) id = 'start';
  else if (id === 'start' || !WEERGAVEN.includes(id)) id = 'status';
  for (const w of WEERGAVEN) el[w].hidden = w !== id;
  el.menu.hidden = !logboek;
  for (const a of el.menu.querySelectorAll('a')) {
    if (a.hash === `#${id}`) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  if (verplaatsFocus) document.getElementById(`${id}-kop`).focus();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', () => toon(true));

try { logboek = laad(); } catch { logboek = null; }
bouwStart();
bouwActiviteiten();
toonVersies();
if (logboek) verwerk();
toon();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
