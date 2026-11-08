/*
 * De motor: level je karakter op in een wereld, zoals Wassenaar Aanzien of Veldrang. De inhoud komt
 * uit wereld.js, die de ingang van de app (app.js) vult. Alles staat in localStorage van deze browser. Punten, skills, prestaties en titels worden steeds
 * opnieuw uitgerekend uit het logboek (spel.js), zodat een verwijderde regel ook echt meetelt.
 * Na elke wijziging een nieuwe versie bovenaan wijzigingen/versies.js.
 *
 * Alles hangt onder #aanzien, en elk id begint met az-. Binnen een site botst dan niets.
 */

import { W } from './wereld.js';
import {
  dagSleutel, alsDatum, plusDagen, maandag, dagenTussen, ACTIVITEITEN, telt, rangIndex, rang as rangVan, verval,
  netwerk, gastvrijheid, opvolgingen, roddel, nationaleDag, komendeNationaleDagen, dossiers,
  kringStand, kosten, energie,
  behaald, perWeek, reeks, event, volgendEvent, pad, bonussen, statistiek, voortgang, ontgrendeld,
  missies, jaren, jaaroverzicht, samenvoegen, loadout,
} from './spel.js';
import * as opslag from './opslag.js';
import { maak, icoon, meter, getal, factor, metTeken } from './ui.js';
import { staal } from './staal.js';
import { toonKarakter } from './schermen/karakter.js';
import { embleem } from './embleem.js';
import { bouwKaart, toonKaart } from './schermen/dorp.js';

const {
  RANGEN, EIGENSCHAPPEN, EIGENSCHAP_MAX, CATEGORIEEN, SYMBOLEN, STARTVRAGEN, PRESTATIES, TITELS, PADEN, PAD_VANAF,
  ROLLEN, QUIZ, QUIZ_PUNTEN, DUNBAR, HECHT_VANAF, NATIONAAL_MARGE, PLEKKEN, BUURTEN, DOSSIER_STAPPEN, DOSSIER_BELONING,
  KRINGEN, KRING_SYMBOOL, TYPEN, VERSIES, WERELD, LOADOUT,
} = W;

const SLEUTEL = WERELD.sleutel;
const SYNC_SLEUTEL = `${WERELD.sleutel}_sync`; // { code, revisie, open }: apart, zodat de code niet in een savegame komt
const WEERGAVEN = ['start', 'status', 'karakter', 'dorp', 'loggen', 'erelijst', 'strategie', 'gegevens', 'wijzigingen'];
const KALENDER_WEKEN = 17;
const STAAF_WEKEN = 8;
const KALENDER_STAPPEN = [1, 30, 80, 200]; // ondergrens in PR per dag voor stap 1 tot 4
const UITRUSTING = 8; // zo veel statussymbolen rond de avatar
const NIVEAU = EIGENSCHAP_MAX / 10;

// Elk element met een id, bijvoorbeeld #az-log-datum als el.logDatum.
const app = document.getElementById('aanzien');
const el = {};
for (const e of app.querySelectorAll('[id]')) el[e.id.slice(3).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = e;

const datumKort = new Intl.DateTimeFormat('nl', { day: 'numeric', month: 'short' });
const datumLang = new Intl.DateTimeFormat('nl', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const maandNaam = (m) => new Intl.DateTimeFormat('nl', { month: 'long' }).format(new Date(2026, m, 1));
const nieuwId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const vandaag = () => dagSleutel(new Date());
/* ---------- Opslag ---------- */

let spel = null; // null zolang de startvragen niet zijn beantwoord

function laad() {
  let ruw = null;
  try { ruw = JSON.parse(localStorage.getItem(SLEUTEL)); } catch { /* geen opslag of kapotte gegevens */ }
  return ruw ? leesIn(ruw) : null;
}

// Zet opgeslagen gegevens om naar een spel. Kent ook de formaten van versie 1 en 2.
function leesIn(ruw) {
  if (!ruw || typeof ruw !== 'object') throw new Error('Geen geldig bestand.');
  const nieuw = { versie: 3, logboek: [], ronde: 0, titel: null, pad: null, type: null, loadout: {}, vergeten: false, generatie: nieuwId(), bijgewerkt: '', verwijderd: [] };
  if (ruw.versie >= 2 && Array.isArray(ruw.logboek)) {
    const geldig = ruw.logboek.filter((r) => r && typeof r.datum === 'string' && Number.isFinite(r.punten));
    return {
      ...nieuw,
      logboek: geldig,
      ronde: Number.isInteger(ruw.ronde) ? ruw.ronde : 0,
      titel: typeof ruw.titel === 'string' ? ruw.titel : null,
      pad: typeof ruw.pad === 'string' ? ruw.pad : null,
      type: TYPEN.some((t) => t.id === ruw.type) ? ruw.type : null,
      loadout: ruw.loadout && typeof ruw.loadout === 'object'
        ? Object.fromEntries(Object.entries(ruw.loadout).filter(([k, v]) => (k === 'extra' ? Array.isArray(v) : typeof v === 'string'))
          .map(([k, v]) => [k, k === 'extra' ? v.filter((x) => typeof x === 'string') : v]))
        : {},
      vergeten: ruw.vergeten === true,
      generatie: typeof ruw.generatie === 'string' ? ruw.generatie : nieuw.generatie,
      bijgewerkt: typeof ruw.bijgewerkt === 'string' ? ruw.bijgewerkt : '',
      verwijderd: Array.isArray(ruw.verwijderd) ? ruw.verwijderd.filter((id) => typeof id === 'string') : [],
    };
  }
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
  const eerste = oud.map((r) => r.datum).sort()[0] ?? vandaag();
  return {
    ...nieuw,
    logboek: [...oud, {
      id: nieuwId(), datum: eerste, naam: 'Eerdere stand overgenomen', punten: rest,
      eigenschappen: ruw.skills ?? {}, symbolen: Array.isArray(ruw.milestones) ? ruw.milestones : [], start: true,
    }],
  };
}

function bewaarLokaal() {
  try { localStorage.setItem(SLEUTEL, JSON.stringify(spel)); } catch { meld('Niet opgeslagen', 'Bewaar je savegame als bestand.', true); }
}

function bewaar() {
  spel.bijgewerkt = new Date().toISOString();
  bewaarLokaal();
  if (sync) {
    sync.open = true;
    bewaarSync();
    planSync();
  }
}

/* ---------- Opslag op de server ---------- */

let sync = null; // null als dit apparaat niet op de server bewaart
let syncKlok, syncBezig = false, syncNogEens = false;

function laadSync() {
  try {
    const s = JSON.parse(localStorage.getItem(SYNC_SLEUTEL));
    return s && opslag.leesCode(s.code) ? { code: s.code, revisie: Number(s.revisie) || 0, open: s.open === true } : null;
  } catch { return null; }
}

function bewaarSync() {
  try {
    if (sync) localStorage.setItem(SYNC_SLEUTEL, JSON.stringify(sync));
    else localStorage.removeItem(SYNC_SLEUTEL);
  } catch { /* zonder opslag geen sync */ }
}

function syncStatus(tekst, fout = false) {
  el.syncStatus.textContent = tekst;
  el.syncStatus.classList.toggle('fout', fout);
}

function planSync() {
  clearTimeout(syncKlok);
  syncKlok = setTimeout(synchroniseer, 1500);
}

// Haalt op wat er op de server staat en voegt het samen met dit apparaat. Stuurt daarna wat hier nog open stond.
async function haalOp() {
  if (!sync) return;
  try {
    syncStatus('Bezig met ophalen…');
    const r = await opslag.lees(sync.code);
    if (r.spel && r.revisie !== sync.revisie) {
      const server = leesIn(r.spel);
      spel = spel ? samenvoegen(spel, server) : server;
      sync.revisie = r.revisie;
      bewaarLokaal();
      bewaarSync();
      verwerk();
      toon();
    }
    if (sync.open || !r.spel) await synchroniseer();
    else syncStatus(`Bijgewerkt om ${tijd()}.`);
  } catch {
    syncStatus('De server is niet bereikbaar. Je voortgang staat veilig op dit apparaat; de app probeert het later opnieuw.', true);
  }
}

async function synchroniseer() {
  if (!sync || !spel) return;
  if (syncBezig) { syncNogEens = true; return; }
  syncBezig = true;
  try {
    syncStatus('Bezig met bewaren…');
    for (let poging = 0; poging < 3; poging++) {
      const r = await opslag.schrijf(sync.code, sync.revisie, spel);
      if (!r.conflict) {
        sync = { ...sync, revisie: r.revisie, open: false };
        break;
      }
      // Een ander apparaat was eerder: samenvoegen en opnieuw proberen.
      if (r.spel) spel = samenvoegen(spel, leesIn(r.spel));
      sync.revisie = r.revisie;
      bewaarLokaal();
      verwerk();
    }
    bewaarSync();
    syncStatus(sync.open ? 'Bewaren lukte niet. De app probeert het later opnieuw.' : `Bewaard op de server om ${tijd()}.`, sync.open);
  } catch {
    syncStatus('De server is niet bereikbaar. Je voortgang staat veilig op dit apparaat; de app probeert het later opnieuw.', true);
  } finally {
    syncBezig = false;
    if (syncNogEens) { syncNogEens = false; planSync(); }
  }
}

const tijd = () => new Date().toLocaleTimeString('nl', { hour: '2-digit', minute: '2-digit' });

function toonSync() {
  el.syncUit.hidden = Boolean(sync);
  el.syncAan.hidden = !sync;
  if (sync) el.syncCode.textContent = opslag.toonCode(sync.code);
}

// Koppelt dit apparaat aan een bestaande code en neemt de voortgang van de server over.
async function koppel(invoer) {
  const code = opslag.leesCode(invoer);
  if (!code) { meld('Onbekende code', 'Een synccode heeft 26 letters en cijfers.', true); return; }
  let r;
  try { r = await opslag.lees(code); } catch { meld('Geen verbinding', 'De server is niet bereikbaar. Probeer het later opnieuw.', true); return; }
  if (!r.spel) { meld('Niets gevonden', 'Bij deze code staat geen voortgang op de server.', true); return; }
  const neemOver = () => {
    spel = leesIn(r.spel);
    sync = { code, revisie: r.revisie, open: false };
    bewaarLokaal();
    bewaarSync();
    toonSync();
    syncStatus(`Opgehaald om ${tijd()}.`);
    verwerk();
    location.hash = '#status';
    toon();
    meld('Gekoppeld', 'Je voortgang van de server staat nu ook op dit apparaat.');
  };
  if (spel) vraag('Voortgang van de server gebruiken?', 'Je voortgang op dit apparaat wordt vervangen door die van de server. Bewaar hem eerst als bestand als je hem wilt houden.', 'Gebruik de server', neemOver);
  else neemOver();
}

const gesorteerd = () => [...spel.logboek].sort((a, b) => b.datum.localeCompare(a.datum) || (b.tijd ?? '').localeCompare(a.tijd ?? ''));

/* ---------- Status ---------- */

function toonStatus() {
  const st = statistiek(spel);
  const nu = rangVan(spel, st);
  const p = nu.punten, i = nu.index;
  const rang = RANGEN[i], volgende = nu.volgende;
  const vrij = ontgrendeld(spel, st);
  const titel = TITELS.find((t) => t.id === spel.titel && vrij.titels.has(t.id));
  const gekozenPad = pad(spel);
  const val = verval(spel);

  el.punten.textContent = getal(p);
  el.rangNaam.textContent = rang.naam;
  el.titel.textContent = titel ? `“${titel.naam}”` : '';
  el.titel.hidden = !titel;
  el.rangUitleg.textContent = rang.uitleg;
  el.rangIcoon.setAttribute('href', `#az-i-${rang.icoon}`);
  el.niveau.textContent = rang.code ?? `Niv. ${i + 1}`;
  el.sterren.replaceChildren(...Array.from({ length: Math.min(spel.ronde, 5) }, () => icoon('star')));
  el.sterren.hidden = !spel.ronde;
  el.sterren.setAttribute('aria-label', `New Game+ ${spel.ronde} keer`);
  el.padLabel.replaceChildren(...(gekozenPad ? [icoon(gekozenPad.icoon), gekozenPad.naam] : []));
  el.padLabel.hidden = !gekozenPad;
  el.verval.textContent = val.punten ? `Vergeten worden: −${getal(val.punten)} PR na ${val.weken + 4} weken stilte` : '';
  el.verval.hidden = !val.punten;

  const symbolen = SYMBOLEN.filter((s) => st.symbolen.has(s.id)).sort((a, b) => b.punten - a.punten).slice(0, UITRUSTING);
  el.uitrusting.replaceChildren(...symbolen.map((s, n) => maak('li', { class: `uitrusting-${n}`, title: s.naam }, icoon(s.icoon), maak('span', { class: 'verborgen', tekst: s.naam }))));
  el.uitrusting.hidden = !symbolen.length;

  el.voortgang.value = volgende ? Math.min(100, ((p - rang.min) / (volgende.min - rang.min)) * 100) : 100;
  el.volgende.textContent = volgende ? volgende.naam : 'maximale rang bereikt';
  el.nodig.textContent = volgende ? (p < volgende.min ? `${getal(volgende.min - p)} PR nodig` : 'PR gehaald') : '';
  el.eisen.replaceChildren(...(volgende ? [
    [volgende.eisen.punten, `${getal(volgende.min)} PR`, `je hebt er ${getal(p)}`],
    [volgende.eisen.dagen, `${volgende.dagen} ${WERELD.eisDagen}`, `je bent ${nu.dagen} ${nu.dagen === 1 ? 'dag' : 'dagen'} bezig`],
    ...(volgende.ritueel ? [[volgende.eisen.ritueel, volgende.ritueel.tekst, volgende.eisen.ritueel ? 'gedaan' : 'nog niet']] : []),
    ...(volgende.erkenning ? [[volgende.eisen.erkenning, `${getal(volgende.erkenning)} erkenning: wat anderen naar jou toe deden`, `je hebt er ${getal(st.erkenning.totaal)}`]] : []),
    ...(volgende.kring ? [[volgende.eisen.kringen, `${kringStand(volgende.kring.vanaf)} in ${volgende.kring.aantal === KRINGEN.length ? 'alle' : volgende.kring.aantal} kringen`,
      `nu in ${Object.values(st.kringen).filter((n) => n >= volgende.kring.vanaf).length}`]] : []),
  ].map(([klaar, eis, stand]) => maak('li', { class: klaar ? 'eis klaar' : 'eis' },
    icoon(klaar ? 'circle-check' : 'hourglass-half', 'icoon eis-icoon'), maak('span', {}, maak('strong', { tekst: eis }), ` — ${stand}`))) : []));
  el.eisenKop.hidden = !volgende;
  el.eisenKop.textContent = volgende ? `Om ${volgende.naam} te worden:` : '';
  el.ladder.replaceChildren(...RANGEN.map((r, j) => maak('li', {
    class: j < i ? 'gehaald' : j === i ? 'nu' : undefined,
    'aria-current': j === i ? 'step' : undefined,
  }, icoon(j <= i ? r.icoon : 'lock'), maak('span', { class: 'ladder-naam', tekst: r.naam }), maak('span', { class: 'ladder-min', tekst: `${getal(r.min)} PR` }))));
  el.padOproep.hidden = !(i >= PAD_VANAF && !gekozenPad);

  toonMissies();
  toonVerplichtingen();
  toonBekendheid(st.erkenning);

  const laatste = gesorteerd().find((r) => r.roddel);
  const recent = laatste && dagenTussen(alsDatum(laatste.datum), new Date()) <= 14;
  el.roddel.hidden = !recent;
  if (recent) {
    el.roddel.classList.toggle('blaam', laatste.punten < 0);
    el.roddelTekst.textContent = `${laatste.naam.replace(/^Roddel /, '')} (${laatste.punten > 0 ? '+' : '−'}${getal(Math.abs(laatste.punten))} PR)`;
  }

  const weken = perWeek(spel.logboek, KALENDER_WEKEN);
  const r = reeks(spel.logboek);
  const reeksBonus = bonussen(spel, {}, vandaag()).lijst.find(([n]) => n.startsWith('Reeks'));
  el.cijfers.replaceChildren(...[
    ['bolt', 'cat-goud', 'Deze week', `+${getal(weken.at(-1).punten)} PR`],
    ['fire', 'cat-oranje', 'Weken op rij actief', reeksBonus ? `${r} · ${factor(reeksBonus[1])} XP` : getal(r)],
    ['trophy', 'cat-paars', 'Prestaties', `${vrij.prestaties.size} / ${PRESTATIES.length}`],
    ['medal', 'cat-blauw', WERELD.symbolen, `${st.symbolen.size} / ${SYMBOLEN.length}`],
  ].map(([ic, kleur, dt, dd]) => maak('div', { class: kleur },
    maak('dt', {}, maak('span', { class: 'cijfer-icoon', 'aria-hidden': 'true' }, icoon(ic)), maak('span', { class: 'cijfer-tekst', tekst: dt })), maak('dd', { tekst: dd }))));

  toonKalender();
  toonWeken(weken.slice(-STAAF_WEKEN));
  el.wekenTabel.tBodies[0].replaceChildren(...weken.slice().reverse().map((w) => maak('tr', {},
    maak('th', { scope: 'row', tekst: datumKort.format(w.van) }), maak('td', { tekst: getal(w.aantal) }), maak('td', { tekst: getal(w.punten) }))));

  const regels = gesorteerd().slice(0, 20);
  el.logboek.replaceChildren(...(regels.length ? regels.map(logRegel) : [maak('li', { class: 'leeg', tekst: 'Nog geen activiteiten gelogd.' })]));
}

function toonMissies() {
  const lijst = missies(spel);
  const einde = plusDagen(maandag(new Date()), 6);
  el.missiesEinde.textContent = `Nog ${dagenTussen(alsDatum(vandaag()), einde) + 1} ${dagenTussen(alsDatum(vandaag()), einde) ? 'dagen' : 'dag'}`;
  el.missies.replaceChildren(...lijst.map((m, n) => maak('li', { class: m.klaar ? 'missie klaar' : 'missie' },
    icoon(m.klaar ? 'circle-check' : 'bolt', 'icoon missie-icoon'),
    maak('label', { for: `az-missie-${n}`, tekst: m.tekst }),
    maak('span', { class: 'missie-beloning', tekst: m.klaar ? 'Voltooid' : `+${getal(m.beloning)} PR` }),
    maak('span', { class: 'missie-stand', tekst: `${getal(m.nu)} / ${getal(m.doel)}` }),
    meter(`az-missie-${n}`, m.nu / m.doel))));
}

// Bekendheid: wat er de laatste 90 dagen naar jou toe kwam.
function toonBekendheid(e) {
  el.bekendheid.textContent = getal(e.score);
  el.bekendheidNiveau.textContent = e.niveau;
  el.karakterBekend.textContent = `${WERELD.bekendheid}: ${e.niveau}`;
  el.bekendheidMeter.value = e.volgende ? Math.min(100, ((e.score - e.vanaf) / (e.volgende[0] - e.vanaf)) * 100) : 100;
  el.bekendheidVolgende.textContent = e.volgende ? `Nog ${getal(e.volgende[0] - e.score)} tot ${e.volgende[1]}` : WERELD.bekendTop;
  el.bekendheidVerhouding.textContent = e.binnen + e.uit === 0
    ? WERELD.bekendLeeg
    : `De laatste 90 dagen kwam er ${e.binnen} keer iets naar jou toe, en ging jij ${e.uit} keer naar anderen. ${e.binnen >= e.uit && e.binnen >= 10 ? 'Het omslagpunt: er komt meer naar je toe dan je zelf zoekt.' : `Voor elke 10 keer dat jij iets doet, komt er ${(e.uit ? (e.binnen / e.uit) * 10 : 10).toLocaleString('nl', { maximumFractionDigits: 1 })} naar jou toe.`}`;
}

// Wat je nog moet doen: bedankjes en tegenuitnodigingen.
function toonVerplichtingen() {
  const nu = new Date();
  const bedank = opvolgingen(spel.logboek, nu).filter((o) => o.resterend >= 0);
  const uit = gastvrijheid(spel.logboek, nu).open;
  el.verplichtingenBlok.hidden = !bedank.length && !uit.length;
  const dagen = (n) => (n <= 0 ? 'vandaag nog' : n === 1 ? 'nog 1 dag' : `nog ${n} dagen`);
  el.verplichtingen.replaceChildren(
    ...bedank.map((o) => maak('li', { class: 'verplichting' }, icoon('envelope'),
      maak('span', {}, maak('strong', { tekst: 'Stuur een bedankje' }), ` voor: ${o.regel.naam} (${dagen(o.resterend)}, ×2 PR)`),
      maak('button', { type: 'button', class: 'knop knop-klein', bij: () => vraagLog(ACTIVITEITEN.get(WERELD.bedankje), false, { voor: o.regel }) }, 'Gedaan'))),
    ...uit.map((u) => maak('li', { class: u.resterend < 0 ? 'verplichting te-laat' : 'verplichting' }, icoon('utensils'),
      maak('span', {}, maak('strong', { tekst: 'Nodig terug uit' }), ` na: ${u.regel.naam} — ${u.resterend < 0 ? WERELD.teLaat : `${dagen(u.resterend)} voor ×1,5 PR`}`))));
}

function logRegel(r) {
  const extra = [r.notitie, r.bonussen?.length ? `${r.bonussen.join(' · ')} (basis ${getal(r.basis)})` : null].filter(Boolean).join(' — ');
  return maak('li', {},
    maak('div', { class: 'log-tekst' },
      maak('p', { class: 'log-naam', tekst: r.naam }),
      extra ? maak('p', { class: 'log-notitie', tekst: extra }) : null,
      maak('time', { datetime: r.datum, tekst: datumLang.format(alsDatum(r.datum)) })),
    maak('span', { class: 'log-punten', tekst: `${r.punten < 0 ? '' : '+'}${getal(r.punten)}` }),
    maak('button', { type: 'button', class: 'knop-icoon', 'aria-label': `Haal uit logboek: ${r.naam}`, bij: () => haalWeg(r) }, icoon('trash-can')));
}

function toonEvent() {
  const land = nationaleDag(vandaag());
  const nu = event(vandaag()) ?? (land && {
    naam: `Nationale dag van ${land[0]}`, factor: 2, icoon: 'flag', alleen: ' op een nationale-dagreceptie',
    tot: dagSleutel(plusDagen(alsDatum(`2026-${land[1]}`), NATIONAAL_MARGE)).slice(5),
  });
  const straks = volgendEvent();
  for (const banner of [el.eventStatus, el.eventLoggen]) {
    banner.classList.toggle('actief', Boolean(nu));
    banner.replaceChildren(icoon(nu ? nu.icoon : 'calendar-days', 'icoon event-icoon'), maak('p', {},
      maak('strong', { tekst: nu ? `${nu.naam}: ${factor(nu.factor)} XP${nu.alleen ?? ''}!` : `Volgend event: ${straks.naam}` }), ' ',
      maak('span', { tekst: nu ? `Nog tot ${datumKort.format(alsDatum(`2026-${nu.tot}`))}.` : `Vanaf ${datumKort.format(alsDatum(`2026-${straks.van}`))}: ${factor(straks.factor)} XP.` })));
  }
}

function toonKalender() {
  const cel = 18, gat = 4, links = 30, boven = 20;
  const nu = new Date();
  const eerste = maandag(plusDagen(nu, -7 * (KALENDER_WEKEN - 1)));
  const perDag = new Map();
  for (const r of spel.logboek) {
    if (!telt(r)) continue;
    const d = perDag.get(r.datum) ?? { aantal: 0, punten: 0 };
    d.aantal++; d.punten += r.punten;
    perDag.set(r.datum, d);
  }
  const breedte = links + KALENDER_WEKEN * (cel + gat), hoogte = boven + 7 * (cel + gat);
  const svg = maak('svg:svg', { viewBox: `0 0 ${breedte} ${hoogte}`, width: breedte, height: hoogte, role: 'img', 'aria-labelledby': 'az-kalender-titel' },
    maak('svg:title', { id: 'az-kalender-titel', tekst: `Kalender: op ${perDag.size} dagen iets gelogd. De cijfers per week staan in de tabel.` }));
  ['ma', 'wo', 'vr'].forEach((t, i) => svg.append(maak('svg:text', { class: 'as-tekst', x: 0, y: boven + (i * 2) * (cel + gat) + 13, tekst: t })));
  let maand = -1;
  for (let w = 0; w < KALENDER_WEKEN; w++) {
    const x = links + w * (cel + gat);
    const start = plusDagen(eerste, 7 * w);
    if (start.getMonth() !== maand) {
      maand = start.getMonth();
      if (w < KALENDER_WEKEN - 1) svg.append(maak('svg:text', { class: 'as-tekst', x, y: 13, tekst: datumKort.formatToParts(start).find((p) => p.type === 'month').value }));
    }
    for (let d = 0; d < 7; d++) {
      const dag = plusDagen(start, d);
      if (dag > nu) continue;
      const info = perDag.get(dagSleutel(dag));
      const stap = info ? KALENDER_STAPPEN.findLastIndex((g) => info.punten >= g) + 1 : 0;
      svg.append(maak('svg:rect', { class: `dag stap-${stap}`, x, y: boven + d * (cel + gat), width: cel, height: cel, rx: 3 },
        maak('svg:title', { tekst: `${datumLang.format(dag)}: ${info ? `${info.aantal} gelogd, ${getal(info.punten)} PR` : 'niets gelogd'}` })));
    }
  }
  el.kalender.replaceChildren(svg);
  const vakjes = ['0', ...KALENDER_STAPPEN.map((g, i) => (KALENDER_STAPPEN[i + 1] ? `${g}–${KALENDER_STAPPEN[i + 1] - 1}` : `${g}+`))];
  el.kalenderLegenda.replaceChildren('PR per dag:', ...vakjes.map((t, i) => maak('span', {}, maak('span', { class: `legenda-vak stap-${i}`, 'aria-hidden': 'true' }), t)));
}

function toonWeken(weken) {
  const breedte = 400, hoogte = 160, boven = 18, onder = 20, vak = breedte / weken.length, staaf = Math.min(28, vak - 12);
  const max = Math.max(...weken.map((w) => w.punten), 1);
  const hoogste = weken.findIndex((w) => w.punten === max);
  const svg = maak('svg:svg', { viewBox: `0 0 ${breedte} ${hoogte}`, width: breedte, height: hoogte, role: 'img', 'aria-labelledby': 'az-weken-titel' },
    maak('svg:title', { id: 'az-weken-titel', tekst: `Punten per week, de laatste ${weken.length} weken. De cijfers staan in de tabel.` }),
    maak('svg:line', { class: 'as-lijn', x1: 0, x2: breedte, y1: hoogte - onder, y2: hoogte - onder }));
  weken.forEach((w, i) => {
    const h = Math.max(w.punten ? 2 : 0, ((hoogte - boven - onder) * w.punten) / max);
    const x = i * vak + (vak - staaf) / 2, y = hoogte - onder - h, r = Math.min(4, h);
    const midden = i * vak + vak / 2;
    svg.append(maak('svg:path', { class: i === weken.length - 1 ? 'week-staaf nu' : 'week-staaf', d: `M${x} ${hoogte - onder}V${y + r}q0 -${r} ${r} -${r}h${staaf - 2 * r}q${r} 0 ${r} ${r}V${hoogte - onder}z` },
      maak('svg:title', { tekst: `Week van ${datumKort.format(w.van)}: ${getal(w.punten)} PR` })));
    svg.append(maak('svg:text', { class: 'as-tekst', x: midden, y: hoogte - 4, 'text-anchor': 'middle', tekst: datumKort.format(w.van) }));
    if ((i === weken.length - 1 || i === hoogste) && w.punten > 0) {
      svg.append(maak('svg:text', { class: 'week-waarde', x: midden, y: y - 4, 'text-anchor': 'middle', tekst: getal(w.punten) }));
    }
  });
  el.weken.replaceChildren(svg);
}

/* ---------- Loggen ---------- */

function actieKnop(a, bij, info, voor = null) {
  return maak('li', {}, maak('button', { type: 'button', class: a.punten >= 100 ? 'actie groot' : 'actie', bij }, voor,
    maak('span', { class: 'actie-naam' }, a.naam, info ? maak('span', { class: 'actie-info', tekst: info }) : null),
    maak('span', { class: a.punten < 0 ? 'actie-punten min' : 'actie-punten', tekst: metTeken(a.punten) })));
}

function bouwActiviteiten() {
  el.activiteiten.replaceChildren(...CATEGORIEEN.map((c) => maak('section', { class: `categorie cat-${c.kleur}`, 'aria-labelledby': `az-cat-${c.id}`, ...(c.pad ? { 'data-pad': c.pad } : {}) },
    maak('h4', { class: 'categorie-kop', id: `az-cat-${c.id}` }, icoon(c.icoon), c.naam, maak('span', { class: 'pad-bonus', 'data-terrein': c.id })),
    maak('ul', { class: 'acties' }, ...c.activiteiten.map((a) => actieKnop(a, () => vraagLog(a)))))));
}

function toonLoggen() {
  const tel = new Map();
  for (const r of spel.logboek) if (ACTIVITEITEN.has(r.activiteit)) tel.set(r.activiteit, (tel.get(r.activiteit) ?? 0) + 1);
  const top = [...tel].sort((a, b) => b[1] - a[1]).slice(0, 5);
  el.vaakBlok.hidden = !top.length;
  el.vaak.replaceChildren(...top.map(([id, n]) => {
    const a = ACTIVITEITEN.get(id);
    return actieKnop(a, () => vraagLog(a), `${n} keer gedaan`);
  }));

  const p = pad(spel);
  for (const b of el.activiteiten.querySelectorAll('.pad-bonus')) b.textContent = p?.terreinen.includes(b.dataset.terrein) ? `${p.naam} ${factor(1.25)}` : '';

  const ja = behaald(spel.logboek);
  el.symbolenOpen.replaceChildren(...SYMBOLEN.filter((s) => !ja.has(s.id)).map((s) => {
    const li = actieKnop(s, () => vraagLog(s, true), EIGENSCHAPPEN[s.eigenschap].naam, maak('span', { class: 'actie-icoon', 'aria-hidden': 'true' }, icoon(s.icoon)));
    li.firstChild.classList.add('symbool');
    return li;
  }));
  filter();
}

function filter() {
  const woorden = el.zoek.value.toLocaleLowerCase('nl').split(/\s+/).filter(Boolean);
  let iets = false;
  for (const sectie of el.activiteiten.children) {
    let hier = false;
    for (const li of sectie.querySelectorAll('li')) {
      const tekst = li.textContent.toLocaleLowerCase('nl') + sectie.querySelector('h4').textContent.toLocaleLowerCase('nl');
      li.hidden = !woorden.every((w) => tekst.includes(w));
      hier ||= !li.hidden;
    }
    // Een terrein van een pad dat je niet koos, blijft dicht.
    const open = !sectie.dataset.pad || sectie.dataset.pad === spel?.pad;
    sectie.hidden = !hier || !open;
    iets ||= hier && open;
  }
  el.nietsGevonden.hidden = iets;
  el.vaakBlok.hidden = woorden.length > 0 || !el.vaak.children.length;
}

/* ---------- Erelijst ---------- */

function toonErelijst() {
  const st = statistiek(spel);
  const vrij = ontgrendeld(spel, st);
  const i = rangVan(spel, st).index;

  el.paden.replaceChildren(...PADEN.map((p) => maak('li', { class: spel.pad === p.id ? 'pad gekozen' : 'pad' },
    icoon(p.icoon),
    maak('div', {}, maak('p', { class: 'pad-naam', tekst: p.naam }), maak('p', { class: 'zacht', tekst: `${p.uitleg} ${factor(1.25)} XP op: ${p.terreinen.map((t) => CATEGORIEEN.find((c) => c.id === t).naam).join(', ')}.` })),
    spel.pad === p.id
      ? maak('span', { class: 'pad-status', tekst: 'Jouw pad' })
      : maak('button', { type: 'button', class: 'knop knop-klein', disabled: i < PAD_VANAF, bij: () => kiesPad(p) }, 'Kies dit pad'))));
  el.padUitleg.textContent = i < PAD_VANAF
    ? `Vanaf rang ${RANGEN[PAD_VANAF].naam} kies je een pad. Het geeft extra XP op drie terreinen.`
    : 'Kies een pad. Het geeft extra XP op drie terreinen. Je kunt later nog wisselen.';

  const titels = TITELS.filter((t) => vrij.titels.has(t.id));
  el.titels.replaceChildren(
    el.titels.querySelector('legend'),
    keuzeTitel(null, 'Geen titel', 'Alleen je rang.'),
    ...titels.map((t) => keuzeTitel(t.id, t.naam, t.uitleg)),
    ...TITELS.filter((t) => !vrij.titels.has(t.id)).map((t) => {
      const { nu, doel } = voortgang(t.voorwaarde, st);
      return maak('p', { class: 'titel-dicht' }, icoon('lock'), maak('span', {}, maak('strong', { tekst: t.naam }), ` — ${t.uitleg} (${getal(nu)} / ${getal(doel)})`));
    }));

  el.prestaties.replaceChildren(...PRESTATIES.map((p) => {
    const open = vrij.prestaties.has(p.id);
    const { nu, doel } = voortgang(p.voorwaarde, st);
    const verborgen = p.geheim && !open;
    return maak('li', { class: open ? 'prestatie open' : 'prestatie' },
      maak('span', { class: 'prestatie-icoon', 'aria-hidden': 'true' }, icoon(open ? p.icoon : verborgen ? 'user-secret' : 'lock')),
      maak('div', {},
        maak('p', { class: 'prestatie-naam', tekst: verborgen ? 'Geheime prestatie' : p.naam }),
        maak('p', { class: 'zacht', tekst: verborgen ? 'Ontdek zelf hoe je deze vrijspeelt.' : p.uitleg }),
        open || verborgen ? null : maak('span', { class: 'prestatie-stand' }, meter(`az-prestatie-${p.id}`, nu / doel), maak('label', { for: `az-prestatie-${p.id}`, tekst: `${getal(nu)} / ${getal(doel)}` }))),
      open ? maak('span', { class: 'prestatie-klaar', tekst: 'Behaald' }) : null);
  }));
  el.prestatiesTeller.textContent = `${vrij.prestaties.size} / ${PRESTATIES.length}`;

  const max = i === RANGEN.length - 1;
  el.prestigeUitleg.textContent = max
    ? `Je bent ${RANGEN.at(-1).naam}. Begin opnieuw als ${RANGEN[0].naam}, met een gouden ster. Je skills, prestaties en titels blijven.`
    : `Bereik eerst ${RANGEN.at(-1).naam} (${getal(RANGEN.at(-1).min)} PR). Dan kun je opnieuw beginnen met een gouden ster.`;
  el.prestigeKnop.disabled = !max;

  const lijst = jaren(spel.logboek);
  const gekozen = lijst.includes(el.jaar.value) ? el.jaar.value : lijst[0];
  el.jaar.replaceChildren(...lijst.map((j) => maak('option', { value: j, selected: j === gekozen }, j)));
  el.jaarKiezer.hidden = lijst.length < 2;
  toonJaar(gekozen);
}

function toonNetwerk() {
  const n = netwerk(spel.logboek);
  el.netwerkCijfers.replaceChildren(...[
    ['users', 'Mensen', `${n.mensen.length} / ${DUNBAR}`],
    ['people-group', 'Rollen', `${n.rollen.size} / ${ROLLEN.length}`],
    ['hand-holding-heart', 'Hechte banden', getal(n.hecht)],
  ].map(([ic, dt, dd]) => maak('div', {}, maak('dt', {}, icoon(ic), dt), maak('dd', { tekst: dd }))));
  el.netwerkLijst.replaceChildren(...(n.mensen.length
    ? n.mensen.slice(0, 30).map((m) => maak('li', {},
      maak('span', { class: 'netwerk-wie', tekst: m.wie }),
      maak('span', { class: 'zacht', tekst: m.rol || 'rol onbekend' }),
      maak('span', { class: m.keer >= HECHT_VANAF ? 'band hecht' : m.keer >= 3 ? 'band' : 'band zwak', tekst: `${m.keer >= HECHT_VANAF ? 'hecht' : m.keer >= 3 ? 'gewoon' : 'zwak'} · ${m.keer}×` })))
    : [maak('li', { class: 'leeg', tekst: 'Nog niemand. Vul bij het loggen in met wie je was.' })]));
  el.ontbrekend.textContent = n.mensen.length
    ? `Nog niemand in je netwerk als: ${ROLLEN.filter((r) => !n.rollen.has(r)).join(', ').toLocaleLowerCase('nl') || 'alle rollen gedekt!'}.`
    : '';
}

function toonDorpskaart() {
  const st = statistiek(spel);
  const gezien = new Set(spel.logboek.map((r) => ACTIVITEITEN.get(r.activiteit)?.plek).filter(Boolean));
  el.plekkenTeller.textContent = `${gezien.size} / ${PLEKKEN.length}`;
  el.plekken.replaceChildren(...PLEKKEN.map((p) => maak('li', { class: gezien.has(p.id) ? 'plek ontdekt' : 'plek' },
    icoon(gezien.has(p.id) ? p.icoon : 'location-dot', 'icoon plek-icoon'), maak('span', { tekst: p.naam }),
    maak('span', { class: 'verborgen', tekst: gezien.has(p.id) ? '(ontdekt)' : '(nog niet ontdekt)' }))));
  el.buurten.replaceChildren(...BUURTEN.map((b) => maak('li', { class: st.perBuurt.has(b) ? 'buurt actief' : 'buurt' },
    maak('span', { tekst: b }), maak('span', { class: 'buurt-aantal', tekst: `${st.perBuurt.get(b) ?? 0}×` }))));
  el.dossiers.replaceChildren(...dossiers(spel.logboek).map((d) => maak('li', { class: d.af ? 'dossier af' : 'dossier' },
    icoon(d.icoon),
    maak('div', {},
      maak('p', { class: 'dossier-naam', tekst: d.naam }),
      maak('ol', { class: 'dossier-stappen', 'aria-label': `${d.stappen.size} van ${DOSSIER_STAPPEN.length} stappen` },
        ...DOSSIER_STAPPEN.map((stap, n) => maak('li', { class: d.stappen.has(n + 1) ? 'stap gedaan' : 'stap', tekst: stap })))),
    maak('span', { class: 'dossier-status', tekst: d.af ? 'Afgerond' : `${d.stappen.size} / ${DOSSIER_STAPPEN.length}` }))));
}

function bouwQuiz() {
  if (!el.quiz) return;
  el.quiz.replaceChildren(...QUIZ.map((q, n) => maak('fieldset', { class: 'quizvraag', 'data-vraag': q.id },
    maak('legend', { tekst: `${n + 1}. ${q.vraag}` }),
    ...q.antwoorden.map((a, j) => maak('label', { class: 'keuze' },
      maak('input', { type: 'radio', name: `az-quiz-${q.id}`, value: j, bij: () => beantwoord(q, j) }), maak('span', { tekst: a }))),
    maak('p', { class: 'quiz-uitleg', role: 'status' }))));
}

function toonQuiz() {
  if (!el.quiz) return;
  const goed = new Set(spel.logboek.map((r) => r.quiz).filter(Boolean));
  for (const q of QUIZ) {
    const vak = el.quiz.querySelector(`[data-vraag="${q.id}"]`);
    if (!goed.has(q.id)) continue;
    vak.classList.add('goed');
    vak.disabled = true;
    vak.querySelectorAll('input')[q.goed].checked = true;
    vak.querySelector('.quiz-uitleg').textContent = `Goed! ${q.uitleg}`;
  }
  el.quizStand.textContent = `${goed.size} / ${QUIZ.length} goed`;
}

function beantwoord(q, j) {
  const uitleg = el.quiz.querySelector(`[data-vraag="${q.id}"] .quiz-uitleg`);
  if (j !== q.goed) {
    uitleg.textContent = 'Helaas, dat is het niet. Probeer het nog eens.';
    return;
  }
  voegToe({ datum: vandaag(), naam: `${WERELD.quiz}: ${q.vraag}`, punten: QUIZ_PUNTEN, eigenschappen: { [WERELD.quizSkill]: QUIZ_PUNTEN }, quiz: q.id });
  meld('Goed!', `+${QUIZ_PUNTEN} PR & XP voor ${EIGENSCHAPPEN[WERELD.quizSkill].naam}.`);
}

function toonNationaleDagen() {
  if (!el.nationaleDagen) return;
  el.nationaleDagen.replaceChildren(...komendeNationaleDagen(new Date(), 6).map((d) => maak('li', { class: 'nationale-dag' },
    icoon('flag'), maak('span', {}, maak('strong', { tekst: d.land }), ` — ${datumKort.format(d.datum)}${d.over <= 0 ? ' (nu!)' : ` (over ${d.over} ${d.over === 1 ? 'dag' : 'dagen'})`}`))));
}

function toonTypen() {
  if (!el.typen) return;
  el.typen.replaceChildren(el.typen.querySelector('legend'),
    ...[{ id: null, naam: 'Nog niet gekozen', uitleg: 'Niets laadt extra op, behalve je gezin.' }, ...TYPEN].map((t) => maak('label', { class: 'keuze' },
      maak('input', { type: 'radio', name: 'az-type', value: t.id ?? '', checked: (spel.type ?? null) === t.id, bij: () => { spel.type = t.id; bewaar(); verwerk(); meld('Type gekozen', t.naam); } }),
      maak('span', {}, maak('strong', { tekst: t.naam }), maak('span', { class: 'zacht', tekst: ` — ${t.uitleg}` })))));
}

// De loadout: per deel (camouflage, wapen) een keuze. Hoe exotischer, hoe meer aanzien op het veld.
function bouwLoadout() {
  if (!LOADOUT || !el.loadout) return;
  el.loadout.replaceChildren(...LOADOUT.delen.map((deel) => maak('p', { class: 'loadout-deel' },
    maak('label', { for: `az-loadout-${deel.id}`, tekst: deel.naam }),
    maak('select', { id: `az-loadout-${deel.id}` },
      maak('option', { value: '' }, 'Nog niet gekozen'),
      ...LOADOUT.treden.map((t, n) => [t, n]).reverse().map(([t, n]) => maak('optgroup', { label: t.naam },
        ...deel.opties.filter(([, , trede]) => trede === n).map(([id, naam]) => maak('option', { value: id }, naam))))),
    deel.opties.some((o) => o[3]) ? maak('span', { class: 'loadout-staal', id: `az-loadout-staal-${deel.id}` }) : null)));
  // Alle stalen op een rij, per trede van exotisch naar laag.
  if (el.loadoutStalen) {
    el.loadoutStalen.replaceChildren(...LOADOUT.delen.flatMap((deel) => deel.opties.filter((o) => o[3] && !o[3].plaatje)
      .sort((a, b) => b[2] - a[2])
      .map(([, naam, trede, spec]) => maak('li', { class: `staal-kaart trede-${trede}` },
        staal(spec, null, 'helm'),
        maak('span', { class: 'staal-naam', tekst: naam }),
        maak('span', { class: 'staal-trede', tekst: LOADOUT.treden[trede].naam }),
        spec.bron
          ? maak('a', { class: 'staal-bron', href: spec.bron.link, tekst: `Foto: ${spec.bron.maker}, ${spec.bron.licentie}` })
          : spec.geenBeeld ? maak('span', { class: 'staal-bron', tekst: 'Geen vrij beeld van dit patroon' }) : null))));
  }
  // Toebehoren: een vinkje per stuk, van exotisch naar laag.
  if (LOADOUT.extra) {
    el.loadout.append(maak('fieldset', { class: 'loadout-extra' },
      maak('legend', { tekst: `${LOADOUT.extra.naam} (meer dan ${LOADOUT.extra.max} is een kerstboom)` }),
      ...[...LOADOUT.extra.opties].sort((a, b) => b[2] - a[2]).map(([id, naam, trede, spec]) => maak('label', { class: 'keuze' },
        maak('input', { type: 'checkbox', value: id, bij: (e) => kiesExtra(id, e.target.checked) }),
        spec?.plaatje ? maak('img', { class: 'extra-plaatje', src: spec.plaatje, alt: '', width: 96, height: 48, loading: 'lazy' }) : null,
        maak('span', {}, naam, maak('span', { class: 'zacht', tekst: ` · ${LOADOUT.treden[trede].naam}` }))))));
  }
  for (const s of el.loadout.querySelectorAll('select')) s.addEventListener('change', (e) => kiesLoadout(e.target.id.slice('az-loadout-'.length), e.target.value));
}

function kiesLoadout(deel, id) {
  spel.loadout = { ...spel.loadout, [deel]: id };
  if (!id) delete spel.loadout[deel];
  bewaar();
  verwerk();
}

function kiesExtra(id, aan) {
  const nu = new Set(spel.loadout?.extra ?? []);
  if (aan) nu.add(id); else nu.delete(id);
  spel.loadout = { ...spel.loadout, extra: [...nu] };
  bewaar();
  verwerk();
}

function toonLoadout() {
  if (!LOADOUT || !el.loadout) return;
  for (const v of el.loadout.querySelectorAll('.loadout-extra input')) v.checked = (spel.loadout?.extra ?? []).includes(v.value);
  for (const deel of LOADOUT.delen) {
    const id = spel.loadout?.[deel.id] ?? '';
    el.loadout.querySelector(`#az-loadout-${deel.id}`).value = id;
    const vak = el.loadout.querySelector(`#az-loadout-staal-${deel.id}`);
    const optie = deel.opties.find((o) => o[0] === id);
    const spec = optie?.[3];
    if (vak) {
      vak.replaceChildren(...(!spec ? [] : spec.plaatje
        ? [maak('img', { class: 'loadout-plaatje', src: spec.plaatje, alt: `${deel.naam}: ${optie[1]}`, width: 480, height: 240, loading: 'lazy' })]
        : [staal(spec, `${deel.naam}: ${optie[1]}`)]));
    }
  }
  const l = loadout(spel);
  const namen = LOADOUT.terreinen.map((t) => CATEGORIEEN.find((c) => c.id === t).naam.split(':')[0].toLocaleLowerCase('nl'));
  el.loadoutStand.textContent = l
    ? `Uitstraling: ${l.naam}. ${l.factor === 1 ? 'Geen bonus of malus' : `${factor(l.factor)} XP`} op ${namen.join(', ')}.${l.kerstboom ? ` Kerstboom: ${l.toebehoren} toebehoren is te veel, ${factor(LOADOUT.extra.malus)}.` : ''}`
    : 'Kies je camouflage en je hoofdwapen. Hoe exotischer, hoe meer aanzien. Huurkit is het saaist.';
}

function keuzeTitel(id, naam, uitleg) {
  return maak('label', { class: 'keuze' },
    maak('input', { type: 'radio', name: 'az-titel', value: id ?? '', checked: (spel.titel ?? null) === id || (id === null && !spel.titel), bij: () => kiesTitel(id) }),
    maak('span', {}, maak('strong', { tekst: naam }), maak('span', { class: 'zacht', tekst: ` — ${uitleg}` })));
}

function toonJaar(jaar) {
  if (!jaar) { el.jaaroverzicht.replaceChildren(maak('p', { class: 'leeg', tekst: 'Nog niets gelogd.' })); return; }
  const j = jaaroverzicht(spel, jaar);
  el.jaarTitel.textContent = WERELD.jaar.replace('{jaar}', jaar);
  el.jaaroverzicht.replaceChildren(...[
    ['bolt', 'PR verdiend', getal(j.punten)],
    ['list-check', 'Activiteiten', `${getal(j.acties)} op ${getal(j.dagen)} dagen`],
    ['calendar-days', 'Beste maand', j.besteMaand ? `${maandNaam(j.besteMaand.maand)} · ${getal(j.besteMaand.punten)} PR` : '—'],
    ['mug-hot', 'Favoriete activiteit', j.topActiviteit ? `${j.topActiviteit.naam} (${j.topActiviteit.keer}×)` : '—'],
    ['globe', 'Favoriete terrein', j.topTerrein ? `${j.topTerrein.naam} (${j.topTerrein.keer}×)` : '—'],
    ['fire', 'Langste reeks', `${j.reeks} ${j.reeks === 1 ? 'week' : 'weken'}`],
    ['medal', WERELD.symbolen, getal(j.symbolen)],
    ['circle-check', 'Weekmissies', getal(j.missies)],
    ['arrow-trend-up', 'Grootste stijging', j.rangTot > j.rangVan ? `${RANGEN[j.rangVan].naam} → ${RANGEN[j.rangTot].naam}` : RANGEN[j.rangTot].naam],
  ].map(([ic, dt, dd]) => maak('div', {}, maak('dt', {}, icoon(ic), dt), maak('dd', { tekst: dd }))));
}

/* ---------- Beloningen ---------- */

// Wat je nu hebt. Na een actie vergelijken we dit, voor het beloningsvenster.
function momentopname() {
  const st = statistiek(spel);
  return { rang: rangVan(spel, st).index, skills: st.skills, ...ontgrendeld(spel, st) };
}

function beloningen(voor, na) {
  const lijst = [];
  if (na.rang > voor.rang) lijst.push(['crown', `Nieuwe rang: ${RANGEN[na.rang].naam}`]);
  if (na.rang >= PAD_VANAF && voor.rang < PAD_VANAF && !spel.pad) lijst.push(['star', 'Je kunt nu een pad kiezen, op de Erelijst']);
  for (const [k, e] of Object.entries(EIGENSCHAPPEN)) {
    const [a, b] = [voor.skills[k], na.skills[k]].map((x) => Math.min(10, Math.floor(x / NIVEAU)));
    if (b > a) lijst.push([e.icoon, `${e.naam} → Niv. ${b}`]);
  }
  for (const p of PRESTATIES) if (na.prestaties.has(p.id) && !voor.prestaties.has(p.id)) lijst.push([p.icoon, `Prestatie ontgrendeld: ${p.naam}`]);
  for (const t of TITELS) if (na.titels.has(t.id) && !voor.titels.has(t.id)) lijst.push(['medal', `Nieuwe titel: ${t.naam}`]);
  return lijst;
}

function toonBeloningen(lijst) {
  if (!lijst.length) return;
  el.beloningTitel.textContent = lijst.some(([ic]) => ic === 'crown') ? 'Nieuw niveau bereikt!' : 'Level up!';
  el.beloningLijst.replaceChildren(...lijst.map(([ic, tekst]) => maak('li', { class: 'beloning' }, icoon(ic), maak('span', { tekst }))));
  el.beloningVenster.showModal();
}

function voegToe(regel, stil = false) {
  const voor = momentopname();
  spel.logboek.push({ id: nieuwId(), tijd: new Date().toISOString(), ronde: spel.ronde, ...regel });
  const extra = [];
  for (const m of missies(spel)) {
    if (!m.klaar || m.beloond) continue;
    spel.logboek.push({ id: nieuwId(), tijd: new Date().toISOString(), ronde: spel.ronde, datum: vandaag(), naam: `Weekmissie: ${m.tekst}`, punten: m.beloning, eigenschappen: {}, missie: m.id });
    extra.push(['circle-check', `Weekmissie voltooid: ${m.tekst} (+${getal(m.beloning)} PR)`]);
  }
  for (const d of dossiers(spel.logboek)) {
    if (d.af || d.stappen.size < DOSSIER_STAPPEN.length) continue;
    spel.logboek.push({ id: nieuwId(), tijd: new Date().toISOString(), ronde: spel.ronde, datum: vandaag(), naam: `${WERELD.dossier} afgerond: ${d.naam}`, punten: DOSSIER_BELONING, eigenschappen: { [WERELD.dossierSkill]: DOSSIER_BELONING }, dossierAf: d.id });
    extra.push(['folder-open', `${WERELD.dossier} afgerond: ${d.naam} (+${getal(DOSSIER_BELONING)} PR)`]);
  }
  const rd = roddel(spel);
  if (rd) {
    const kring = KRINGEN.find((k) => k.id === rd.kring).naam;
    spel.logboek.push({ id: nieuwId(), tijd: new Date().toISOString(), ronde: spel.ronde, datum: vandaag(), naam: `Roddel bij ${kring.toLocaleLowerCase('nl')}: ${rd.tekst}`, punten: rd.punten, eigenschappen: {}, roddel: rd.id, kringen: rd.kringen });
    extra.push(['comments', `${rd.punten > 0 ? 'Lof' : 'Er wordt over je gepraat'} bij ${kring.toLocaleLowerCase('nl')}: ${rd.tekst} (${rd.punten > 0 ? '+' : '−'}${getal(Math.abs(rd.punten))} PR)`]);
  }
  bewaar();
  verwerk();
  if (!stil) toonBeloningen([...beloningen(voor, momentopname()), ...extra]);
}

/* ---------- Acties ---------- */

let teLoggen = null;

function vraagLog(item, symbool = false, extra = {}) {
  teLoggen = { item, symbool, voor: extra.voor };
  el.logTitel.textContent = extra.voor ? `${item.naam} — voor: ${extra.voor.naam}` : item.naam;
  el.logDatum.value = el.logDatum.max = vandaag();
  el.logNotitie.value = el.logWie.value = el.logRol.value = el.logBuurt.value = el.logDossier.value = '';
  el.logDossierVak.hidden = !item.dossierstap;
  el.logDossier.required = Boolean(item.dossierstap);
  el.logContact.hidden = symbool;
  el.logContact.open = false;
  el.logMensen.replaceChildren(...netwerk(spel.logboek).mensen.map((m) => maak('option', { value: m.wie })));
  toonBonus();
  el.logVenster.showModal();
}

function berekening() {
  const { item, symbool, voor } = teLoggen;
  const b = bonussen(spel, item, el.logDatum.value || vandaag(), { symbool, voor, rol: el.logRol.value || null });
  return { ...b, punten: Math.round(item.punten * b.factor) };
}

function toonBonus() {
  const { item, symbool } = teLoggen;
  const b = berekening();
  el.logInfo.textContent = `${metTeken(item.punten)} PR & XP · ${EIGENSCHAPPEN[item.eigenschap].naam}${symbool ? ` · ${WERELD.symbool.toLocaleLowerCase('nl')}` : ''}`;
  el.logBonus.replaceChildren(...(b.lijst.length
    ? [icoon('fire'), maak('span', { tekst: `${b.lijst.map(([n, f]) => `${n} ${factor(f)}`).join(' · ')} → ${metTeken(b.punten)} PR` })]
    : []));
  el.logBonus.hidden = !b.lijst.length;
  const a = ACTIVITEITEN.get(item.id);
  const gewichten = symbool ? (item.kringen ?? KRING_SYMBOOL) : a?.kringen ?? {};
  const effect = KRINGEN.filter((k) => gewichten[k.id]).map((k) => {
    const n = Math.round((gewichten[k.id] * item.punten) / 10);
    return `${k.naam} ${n < 0 ? '−' : '+'}${getal(Math.abs(n))}`;
  });
  const kost = symbool ? 0 : kosten(spel, item);
  const over = kost ? energie(spel, el.logDatum.value || vandaag()).over : 0;
  el.logEffect.textContent = [
    kost ? `Energie ${kost > 0 ? `−${kost}` : `+${-kost} (je laadt op)`}, nog ${getal(over - kost)} van 100 deze week` : null,
    effect.length ? effect.join(' · ') : null,
  ].filter(Boolean).join('. ');
}

el.logDatum.addEventListener('input', () => teLoggen && toonBonus());
el.logRol.addEventListener('change', () => teLoggen && toonBonus());
el.logWie.addEventListener('change', () => {
  const bekend = netwerk(spel.logboek).mensen.find((m) => m.wie.toLocaleLowerCase('nl') === el.logWie.value.trim().toLocaleLowerCase('nl'));
  if (bekend?.rol) el.logRol.value = bekend.rol;
  if (teLoggen) toonBonus();
});

el.logVenster.addEventListener('close', () => {
  if (el.logVenster.returnValue !== 'ja' || !teLoggen) return;
  const { item, symbool, voor } = teLoggen;
  const b = berekening();
  teLoggen = null;
  const notitie = el.logNotitie.value.trim();
  const datum = el.logDatum.value || vandaag();
  const wie = el.logWie.value.trim(), rol = el.logRol.value, buurt = el.logBuurt.value;
  const dossier = item.dossierstap ? el.logDossier.value : '';
  voegToe({
    datum,
    naam: symbool ? `${WERELD.symbool}: ${item.naam}` : item.naam,
    punten: b.punten,
    eigenschappen: { [item.eigenschap]: b.punten },
    ...(symbool ? { symbolen: [item.id] } : { activiteit: item.id }),
    ...(b.lijst.length ? { basis: item.punten, bonussen: b.lijst.map(([n, f]) => `${n} ${factor(f)}`) } : {}),
    ...(event(datum) && !symbool ? { event: true } : {}),
    ...(notitie ? { notitie } : {}),
    ...(!symbool && (wie || rol) ? { contact: { wie, rol } } : {}),
    ...(voor ? { voor: voor.id } : {}),
    ...(buurt && !symbool ? { buurt } : {}),
    ...(dossier ? { dossier } : {}),
    ...(!symbool ? { energie: kosten(spel, item) } : {}),
  });
  if (symbool) meld(WERELD.symboolGeclaimd, `${item.naam}: geclaimd!`);
  else meld('Activiteit gelogd', b.punten < 0 ? `${metTeken(b.punten)} PR & XP. Dat kost je aanzien.` : `${metTeken(b.punten)} PR & XP verdiend!`);
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
    spel.logboek = spel.logboek.filter((x) => x.id !== r.id);
    spel.verwijderd.push(r.id);
    bewaar();
    verwerk();
    meld('Uit het logboek', `−${getal(r.punten)} PR`);
  });
}

function kiesPad(p) {
  const wissel = spel.pad && spel.pad !== p.id;
  const doe = () => {
    spel.pad = p.id;
    bewaar();
    verwerk();
    meld('Pad gekozen', `${p.naam}: ${factor(1.25)} XP op je terreinen.`);
  };
  if (wissel) vraag('Ander pad kiezen?', `Je bonus geldt voortaan voor ${p.naam}. Wat je al gelogd hebt, blijft zoals het is.`, 'Kies dit pad', doe);
  else doe();
}

function kiesTitel(id) {
  spel.titel = id;
  bewaar();
  toonStatus();
  meld('Titel gekozen', id ? TITELS.find((t) => t.id === id).naam : 'Je voert geen titel.');
}

el.prestigeKnop.addEventListener('click', () => vraag('New Game+ beginnen?',
  `Je begint opnieuw als ${RANGEN[0].naam} met 0 PR, en krijgt een gouden ster. Je skills, prestaties, titels, logboek en pad blijven.`, 'Begin opnieuw', () => {
    spel.ronde++;
    voegToe({ datum: vandaag(), naam: `New Game+ ${spel.ronde} begonnen`, punten: 0, eigenschappen: {}, start: true });
    location.hash = '#status';
  }));

el.jaar.addEventListener('change', () => toonJaar(el.jaar.value));

el.vergeten.addEventListener('change', () => {
  spel.vergeten = el.vergeten.checked;
  bewaar();
  verwerk();
});

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
  spel = leesIn({ versie: 3, logboek: [] });
  voegToe({ datum: vandaag(), naam: 'Startpunt berekend', punten, eigenschappen: eig, start: true }, true);
  location.hash = '#status';
  meld(WERELD.welkom, `Je begint je reis als ${RANGEN[rangIndex(punten)].naam}.`);
});

el.bewaarKnop.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(spel, null, 1)], { type: 'application/json' }));
  maak('a', { href: url, download: `${WERELD.bestand}-${vandaag()}.json` }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

el.terugzetBestand.addEventListener('change', async () => {
  const bestand = el.terugzetBestand.files[0];
  el.terugzetBestand.value = '';
  if (!bestand) return;
  let nieuw;
  try { nieuw = leesIn(JSON.parse(await bestand.text())); } catch { meld('Fout', 'Dit bestand kan de app niet lezen.', true); return; }
  vraag('Savegame laden?', `Je huidige voortgang wordt vervangen door ${nieuw.logboek.length} regels uit "${bestand.name}".`, 'Laad', () => {
    spel = { ...nieuw, generatie: nieuwId() }; // vervangt ook wat op de server staat
    bewaar();
    verwerk();
    location.hash = '#status';
    meld('Savegame geladen', 'Je voortgang is teruggezet.');
  });
});

el.wisKnop.addEventListener('click', () => vraag('Alles wissen?',
  `Al je punten, je logboek, je prestaties en je symbolen gaan weg${sync ? ', ook van de server' : ''}.`, 'Wis alles', async () => {
    if (sync) {
      try { await opslag.wis(sync.code); } catch { meld('Niet van de server gewist', 'De server is niet bereikbaar. Je voortgang staat daar nog.', true); }
      sync = null;
      bewaarSync();
      toonSync();
    }
    try { localStorage.removeItem(SLEUTEL); } catch { /* niets te wissen */ }
    spel = null;
    location.hash = '#start';
    toon();
  }));

el.zoek.addEventListener('input', filter);

el.syncAanKnop.addEventListener('click', () => {
  sync = { code: opslag.nieuweCode(), revisie: 0, open: true };
  bewaarSync();
  toonSync();
  synchroniseer();
  meld('Opslag op de server staat aan', 'Bewaar je synccode goed. Zonder code kun je er niet meer bij.');
});

for (const [formulier, veld] of [[el.koppelFormulier, el.koppelCode], [el.startKoppel, el.startCode]]) {
  formulier.addEventListener('submit', (e) => {
    e.preventDefault();
    koppel(veld.value);
  });
}

el.kopieerKnop.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(opslag.toonCode(sync.code));
    meld('Gekopieerd', 'De synccode staat op je klembord.');
  } catch {
    meld('Kopiëren lukte niet', 'Schrijf de code over.', true);
  }
});

el.syncNuKnop.addEventListener('click', haalOp);

el.ontkoppelKnop.addEventListener('click', () => vraag('Dit apparaat ontkoppelen?',
  'Je voortgang blijft op dit apparaat en op de server staan, maar ze worden niet meer samen bijgewerkt.', 'Ontkoppel', () => {
    sync = null;
    bewaarSync();
    toonSync();
    meld('Ontkoppeld', 'Dit apparaat bewaart alleen nog in de browser.');
  }));

el.serverWisKnop.addEventListener('click', () => vraag('Wissen van de server?',
  'Je voortgang verdwijnt van de server. Op dit apparaat blijft hij staan. Andere apparaten met deze code bewaren dan niets meer op de server.', 'Wis van de server', async () => {
    try {
      await opslag.wis(sync.code);
      sync = null;
      bewaarSync();
      toonSync();
      meld('Gewist', 'Er staat niets meer van je op de server.');
    } catch {
      meld('Wissen lukte niet', 'De server is niet bereikbaar. Probeer het later opnieuw.', true);
    }
  }));

window.addEventListener('online', () => sync && haalOp());
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && sync && haalOp());

let meldKlok;
function meld(titel, tekst, fout = false) {
  el.meldingTitel.textContent = titel;
  el.meldingTekst.textContent = tekst;
  el.meldingIcoon.setAttribute('href', `#az-i-${fout ? 'circle-exclamation' : 'circle-check'}`);
  el.melding.classList.toggle('fout', fout);
  el.melding.classList.add('zichtbaar');
  clearTimeout(meldKlok);
  meldKlok = setTimeout(() => el.melding.classList.remove('zichtbaar'), 3500);
}

/* ---------- Opbouw en navigatie ---------- */

function toonVersies() {
  el.versie.textContent = el.versieNu.textContent = VERSIES[0].versie;
  el.versies.replaceChildren(...VERSIES.map((v) => maak('section', {},
    maak('h3', { tekst: `Versie ${v.versie}` }),
    maak('p', {}, maak('time', { datetime: v.datum, tekst: datumLang.format(alsDatum(v.datum)) })),
    maak('ul', {}, ...v.wijzigingen.map((w) => maak('li', { tekst: w }))))));
}

function bouwStart() {
  el.startFormulier.prepend(...STARTVRAGEN.map((v, i) => maak('fieldset', {},
    maak('legend', { tekst: `${i + 1}. ${v.vraag}` }),
    ...v.antwoorden.map(([tekst, punten], j) => maak('label', { class: 'keuze' },
      maak('input', { type: 'radio', name: v.id, value: punten, required: true, checked: j === 0 }), maak('span', { tekst: tekst }))))));
}

function verwerk() {
  toonEvent();
  toonStatus();
  toonKarakter(el, spel, statistiek(spel), vandaag());
  toonKaart(el, spel);
  toonLoggen();
  toonErelijst();
  toonNetwerk();
  toonDorpskaart();
  toonTypen();
  toonQuiz();
  toonNationaleDagen();
  toonLoadout();
  el.vergeten.checked = spel.vergeten;
}

function toon(verplaatsFocus = false) {
  let id = location.hash.slice(1);
  if (!spel) id = 'start';
  else if (id === 'start' || !WEERGAVEN.includes(id)) id = 'status';
  for (const w of WEERGAVEN) el[w].hidden = w !== id;
  el.menu.hidden = !spel;
  for (const a of el.menu.querySelectorAll('a')) {
    if (a.hash === `#${id}`) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  if (verplaatsFocus) el[`${id}Kop`].focus();
}

window.addEventListener('hashchange', () => toon(true));

// Rangen met een embleem krijgen een eigen icoon in de sprite.
const sprite = app.querySelector('svg.sprite');
RANGEN.forEach((r, i) => {
  if (!r.embleem) return;
  sprite.append(maak('svg:symbol', { id: `az-i-rang-${i}`, viewBox: '0 0 64 64' }, ...embleem(r.embleem).map((d) => maak('svg:path', { d }))));
  r.icoon = `rang-${i}`;
});

try { spel = laad(); } catch { spel = null; }
sync = laadSync();
bouwStart();
bouwActiviteiten();
bouwQuiz();
bouwKaart(el, (a) => vraagLog(a));
bouwLoadout();
el.logRol.append(...ROLLEN.map((r) => maak('option', { value: r }, r)));
el.logBuurt.append(...BUURTEN.map((b) => maak('option', { value: b }, b)));
el.logDossier.append(...dossiers([]).map((d) => maak('option', { value: d.id }, d.naam)));
toonVersies();
toonSync();
// Gaat het verwerken van je gegevens mis, dan opent de app toch, met de fout erbij. Je gegevens blijven staan.
let startFout = null;
if (spel) {
  try { verwerk(); } catch (fout) { startFout = fout; }
}
toon();
el.laden.hidden = !startFout;
if (startFout) {
  el.laden.textContent = `Er ging iets mis bij het openen van je voortgang (${startFout.message}). Je gegevens zijn niet weg. Bewaar je savegame onder Gegevens en stuur deze melding door.`;
}
haalOp();

// Alleen als losse pagina. Binnen een site gaat de site over het offline werken.
if (document.querySelector('link[rel="manifest"]') && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('sw.js', import.meta.url)).catch(() => {});
}
