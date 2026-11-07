/*
 * De spelregels van Wassenaar Aanzien: punten, rang, bonussen, prestaties, missies, verval en
 * het jaaroverzicht. Alleen rekenen, geen pagina. Alles komt uit het spel:
 * { versie: 3, logboek, ronde, titel, pad, vergeten }.
 */

import {
  RANGEN, EIGENSCHAPPEN, CATEGORIEEN, PRESTATIES, TITELS, PADEN, PAD_BONUS, MISSIES,
  REEKS_STAP, REEKS_MAX, EVENTS, VERGETEN_NA, VERGETEN_PER_WEEK, VERGETEN_MAX,
} from './gegevens.js';

/* ---------- Datums ---------- */

const twee = (n) => String(n).padStart(2, '0');
export const dagSleutel = (d) => `${d.getFullYear()}-${twee(d.getMonth() + 1)}-${twee(d.getDate())}`;
export const alsDatum = (s) => { const [j, m, d] = s.split('-').map(Number); return new Date(j, m - 1, d); };
export const plusDagen = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const maandag = (d) => plusDagen(d, -((d.getDay() + 6) % 7));
// Afgerond, zodat een uur zomertijd geen dag scheelt.
export const dagenTussen = (a, b) => Math.round((b - a) / 864e5);
const weekVan = (datum) => dagSleutel(maandag(alsDatum(datum)));

/* ---------- Basis ---------- */

export const ACTIVITEITEN = new Map(CATEGORIEEN.flatMap((c) => c.activiteiten.map((a) => [a.id, { ...a, terrein: c.id }])));
export const telt = (r) => !r.start; // startregels tellen niet mee in kalender, weken, reeks en jaaroverzicht
export const rangIndex = (p) => RANGEN.findLastIndex((r) => p >= r.min);
export const ronde = (r) => r.ronde ?? 0;

export const totaal = (spel) => spel.logboek.reduce((s, r) => s + (ronde(r) === spel.ronde ? r.punten : 0), 0);
export const behaald = (logboek) => new Set(logboek.flatMap((r) => r.symbolen ?? []));

export function eigenschappen(logboek) {
  const som = Object.fromEntries(Object.keys(EIGENSCHAPPEN).map((k) => [k, 0]));
  for (const r of logboek) for (const [k, v] of Object.entries(r.eigenschappen ?? {})) if (k in som) som[k] += v;
  return som;
}

// Na VERGETEN_NA weken stilte zakt je PR per week, als je dat aan hebt staan.
export function verval(spel, vandaag = new Date()) {
  const laatste = spel.logboek.filter(telt).map((r) => r.datum).sort().at(-1);
  if (!spel.vergeten || !laatste) return { weken: 0, punten: 0 };
  const weken = Math.floor(dagenTussen(alsDatum(laatste), vandaag) / 7) - VERGETEN_NA;
  if (weken <= 0) return { weken: 0, punten: 0 };
  return { weken, punten: Math.round(totaal(spel) * Math.min(VERGETEN_MAX, weken * VERGETEN_PER_WEEK)) };
}

export const stand = (spel) => totaal(spel) - verval(spel).punten;

/* ---------- Weken en reeksen ---------- */

export function perWeek(logboek, weken, vandaag = new Date()) {
  const eerste = maandag(plusDagen(vandaag, -7 * (weken - 1)));
  const lijst = Array.from({ length: weken }, (_, i) => ({ van: plusDagen(eerste, 7 * i), aantal: 0, punten: 0 }));
  for (const r of logboek) {
    const i = Math.floor(dagenTussen(eerste, alsDatum(r.datum)) / 7);
    if (i >= 0 && i < weken && telt(r)) { lijst[i].aantal++; lijst[i].punten += r.punten; }
  }
  return lijst;
}

const actieveWeken = (logboek) => new Set(logboek.filter((r) => r.activiteit).map((r) => weekVan(r.datum)));

// Aantal weken op rij actief, direct vóór de week van deze maandag.
function reeksVoor(actief, week) {
  let n = 0;
  for (let w = plusDagen(week, -7); actief.has(dagSleutel(w)); w = plusDagen(w, -7)) n++;
  return n;
}

export function reeks(logboek, vandaag = new Date()) {
  const actief = actieveWeken(logboek);
  const week = maandag(vandaag);
  return reeksVoor(actief, week) + (actief.has(dagSleutel(week)) ? 1 : 0);
}

function langsteReeks(weken) {
  let beste = 0, nu = 0, vorige = null;
  for (const w of [...weken].sort()) {
    nu = vorige && dagenTussen(alsDatum(vorige), alsDatum(w)) === 7 ? nu + 1 : 1;
    beste = Math.max(beste, nu);
    vorige = w;
  }
  return beste;
}

/* ---------- Bonussen ---------- */

export function event(datum) {
  const md = datum.slice(5);
  return EVENTS.find((e) => md >= e.van && md <= e.tot) ?? null;
}

export function volgendEvent(vandaag = new Date()) {
  const md = dagSleutel(vandaag).slice(5);
  return EVENTS.find((e) => e.van > md) ?? EVENTS[0];
}

export const pad = (spel) => PADEN.find((p) => p.id === spel.pad) ?? null;

// De bonussen voor een activiteit op een datum: reeks, event en pad. Ze vermenigvuldigen.
export function bonussen(spel, activiteit, datum) {
  const lijst = [];
  const r = reeksVoor(actieveWeken(spel.logboek.filter((x) => x.datum < datum)), maandag(alsDatum(datum)));
  if (r) lijst.push([`Reeks ${r} ${r === 1 ? 'week' : 'weken'}`, Math.min(REEKS_MAX, 1 + r * REEKS_STAP)]);
  const e = event(datum);
  if (e) lijst.push([e.naam, e.factor]);
  const p = pad(spel);
  if (p?.terreinen.includes(ACTIVITEITEN.get(activiteit.id)?.terrein)) lijst.push([p.naam, 1 + PAD_BONUS]);
  return { lijst, factor: lijst.reduce((f, [, x]) => f * x, 1) };
}

/* ---------- Prestaties en titels ---------- */

export function statistiek(spel) {
  const acties = spel.logboek.filter((r) => r.activiteit && ACTIVITEITEN.has(r.activiteit));
  const tel = (lijst) => lijst.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map());
  const terreinVan = (r) => ACTIVITEITEN.get(r.activiteit).terrein;
  const perDag = new Map();
  for (const r of acties) perDag.set(r.datum, (perDag.get(r.datum) ?? new Set()).add(terreinVan(r)));
  const datums = [...new Set(acties.map((r) => r.datum))].sort();
  const weekPunten = new Map();
  for (const r of spel.logboek.filter(telt)) weekPunten.set(weekVan(r.datum), (weekPunten.get(weekVan(r.datum)) ?? 0) + r.punten);
  return {
    acties: acties.length,
    perActiviteit: tel(acties.map((r) => r.activiteit)),
    perTerrein: tel(acties.map(terreinVan)),
    verschillend: new Set(acties.map((r) => r.activiteit)).size,
    symbolen: behaald(spel.logboek),
    skills: eigenschappen(spel.logboek),
    reeks: langsteReeks(actieveWeken(spel.logboek)),
    week: Math.max(0, ...weekPunten.values()),
    dag: Math.max(0, ...[...perDag.values()].map((s) => s.size)),
    missies: spel.logboek.filter((r) => r.missie).length,
    prestige: spel.ronde,
    event: acties.filter((r) => r.event).length,
    comeback: datums.some((d, i) => i > 0 && dagenTussen(alsDatum(datums[i - 1]), alsDatum(d)) >= 28) ? 1 : 0,
  };
}

// Hoe ver je bent met een voorwaarde: { nu, doel }.
export function voortgang(v, st) {
  const doel = v.aantal ?? 1;
  const nu = {
    acties: () => st.acties,
    activiteit: () => st.perActiviteit.get(v.id) ?? 0,
    terrein: () => st.perTerrein.get(v.id) ?? 0,
    terreinen: () => st.perTerrein.size,
    verschillend: () => st.verschillend,
    reeks: () => st.reeks,
    week: () => st.week,
    dag: () => st.dag,
    symbool: () => (st.symbolen.has(v.id) ? 1 : 0),
    symbolen: () => st.symbolen.size,
    skill: () => st.skills[v.id] ?? 0,
    missies: () => st.missies,
    prestige: () => st.prestige,
    event: () => st.event,
    comeback: () => st.comeback,
  }[v.soort];
  if (v.soort === 'alle') {
    return { nu: v.lijst.filter((d) => gehaald(d, st)).length, doel: v.lijst.length };
  }
  return { nu: Math.min(doel, nu()), doel };
}

export const gehaald = (v, st) => { const { nu, doel } = voortgang(v, st); return nu >= doel; };

export function ontgrendeld(spel, st = statistiek(spel)) {
  return {
    prestaties: new Set(PRESTATIES.filter((p) => gehaald(p.voorwaarde, st)).map((p) => p.id)),
    titels: new Set(TITELS.filter((t) => gehaald(t.voorwaarde, st)).map((t) => t.id)),
  };
}

/* ---------- Weekmissies ---------- */

// Drie missies per week, steeds dezelfde voor die week.
export function missies(spel, vandaag = new Date()) {
  const week = maandag(vandaag);
  const sleutel = dagSleutel(week);
  const nummer = Math.round(week.getTime() / 864e5 / 7);
  const ervoor = spel.logboek.filter((r) => r.activiteit && r.datum < sleutel && ACTIVITEITEN.has(r.activiteit));
  const gedaan = new Set(ervoor.map((r) => r.activiteit));
  const verkend = new Set(ervoor.map((r) => ACTIVITEITEN.get(r.activiteit).terrein));
  const terrein = CATEGORIEEN[nummer % CATEGORIEEN.length];
  const mogelijk = MISSIES.filter((m) => m.soort !== 'onbekend' || verkend.size < CATEGORIEEN.length);
  const gekozen = [0, 1, 2].map((k) => mogelijk[(nummer * 7 + k * 3) % mogelijk.length]);
  const uniek = [...new Set(gekozen)];
  while (uniek.length < 3) uniek.push(mogelijk.find((m) => !uniek.includes(m)));

  const deze = spel.logboek.filter((r) => r.activiteit && weekVan(r.datum) === sleutel && ACTIVITEITEN.has(r.activiteit));
  const terreinVan = (r) => ACTIVITEITEN.get(r.activiteit).terrein;
  return uniek.map((m) => {
    const nu = {
      terrein: () => deze.filter((r) => terreinVan(r) === terrein.id).length,
      nieuw: () => deze.filter((r) => !gedaan.has(r.activiteit)).length,
      acties: () => deze.length,
      pr: () => deze.reduce((s, r) => s + r.punten, 0),
      dagen: () => new Set(deze.map((r) => r.datum)).size,
      onbekend: () => deze.filter((r) => !verkend.has(terreinVan(r))).length,
    }[m.soort]();
    const id = `${sleutel}-${m.soort}`;
    return {
      id,
      tekst: m.tekst.replace('{terrein}', terrein.naam),
      nu: Math.min(nu, m.aantal),
      doel: m.aantal,
      beloning: m.beloning,
      klaar: nu >= m.aantal,
      beloond: spel.logboek.some((r) => r.missie === id),
    };
  });
}

/* ---------- Jaaroverzicht ---------- */

export const jaren = (logboek) => [...new Set(logboek.filter(telt).map((r) => r.datum.slice(0, 4)))].sort().reverse();

export function jaaroverzicht(spel, jaar) {
  const regels = spel.logboek.filter((r) => telt(r) && r.datum.startsWith(jaar));
  const acties = regels.filter((r) => r.activiteit && ACTIVITEITEN.has(r.activiteit));
  const top = (lijst) => [...lijst.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1])[0] ?? null;
  const maanden = new Array(12).fill(0);
  for (const r of regels) maanden[Number(r.datum.slice(5, 7)) - 1] += r.punten;
  const beste = maanden.indexOf(Math.max(...maanden));
  const rangOp = (tot) => {
    const ervoor = spel.logboek.filter((r) => r.datum < tot);
    const r = Math.max(0, ...ervoor.map(ronde));
    return rangIndex(ervoor.reduce((s, x) => s + (ronde(x) === r ? x.punten : 0), 0));
  };
  const topActiviteit = top(acties.map((r) => r.activiteit));
  const topTerrein = top(acties.map((r) => ACTIVITEITEN.get(r.activiteit).terrein));
  return {
    punten: regels.reduce((s, r) => s + r.punten, 0),
    acties: acties.length,
    dagen: new Set(acties.map((r) => r.datum)).size,
    besteMaand: maanden[beste] > 0 ? { maand: beste, punten: maanden[beste] } : null,
    topActiviteit: topActiviteit && { naam: ACTIVITEITEN.get(topActiviteit[0]).naam, keer: topActiviteit[1] },
    topTerrein: topTerrein && { naam: CATEGORIEEN.find((c) => c.id === topTerrein[0]).naam, keer: topTerrein[1] },
    symbolen: regels.filter((r) => r.symbolen?.length).length,
    missies: regels.filter((r) => r.missie).length,
    reeks: langsteReeks(new Set(acties.map((r) => weekVan(r.datum)))),
    rangVan: rangOp(`${jaar}-01-01`),
    rangTot: rangOp(`${Number(jaar) + 1}-01-01`),
  };
}

