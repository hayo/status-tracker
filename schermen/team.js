/*
 * De teampagina: je teamleden naast elkaar. Rang en PR in een ranglijst, de skills in een tabel, en
 * per lid de loadout, speelstijl, patches, prestaties en laatste activiteiten.
 * De profielen komen van andere spelers. Alles wordt hier opnieuw gecontroleerd en alleen als tekst
 * getoond; onbekende ids slaan we over.
 */

import { W } from '../wereld.js';
import { maak, icoon, getal, metTeken } from '../ui.js';
import { ACTIVITEITEN, loadout, tredeZichtbaar } from '../spel.js';
import { staal } from '../staal.js';
import { toonCode } from '../opslag.js';

const { RANGEN, EIGENSCHAPPEN, EIGENSCHAP_MAX, SYMBOLEN, PRESTATIES } = W;

const datumKort = new Intl.DateTimeFormat('nl', { day: 'numeric', month: 'short' });
const tijd = (iso) => (iso ? new Date(iso).toLocaleString('nl', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const heel = (x) => (Number.isFinite(Number(x)) ? Math.round(Math.max(-1e9, Math.min(1e9, Number(x)))) : 0);
const ids = (lijst, bron) => {
  const bekend = new Map(bron.map((x) => [x.id, x]));
  return Array.isArray(lijst) ? [...new Set(lijst.map(String))].filter((id) => bekend.has(id)).map((id) => bekend.get(id)) : [];
};

// Maakt van een profiel van de server iets wat we veilig kunnen tonen.
export function schoon(p, lid) {
  const v = p && typeof p === 'object' ? p : {};
  const kit = v.loadout && typeof v.loadout === 'object' ? v.loadout : {};
  return {
    lid,
    callsign: String(v.callsign ?? '').trim().slice(0, 24) || 'Onbekend',
    rang: Math.max(0, Math.min(RANGEN.length - 1, heel(v.rang))),
    pr: heel(v.pr),
    reputatie: heel(v.reputatie),
    skills: Object.fromEntries(Object.keys(EIGENSCHAPPEN).map((k) => [k, Math.max(0, heel(v.skills?.[k]))])),
    stijl: W.SPEELSTIJLEN.find((s) => s.id === v.stijl) ?? null,
    loadout: {
      ...(typeof kit.naam === 'string' && kit.naam.trim() ? { naam: kit.naam.trim().slice(0, 30) } : {}),
      ...Object.fromEntries((W.LOADOUT?.delen ?? []).map((d) => [d.id, d.opties.find((o) => o[0] === kit[d.id])?.[0]]).filter(([, o]) => o)),
      extra: Array.isArray(kit.extra) ? kit.extra.map(String).slice(0, 30) : [],
    },
    symbolen: ids(v.symbolen, SYMBOLEN),
    prestaties: ids(v.prestaties, PRESTATIES),
    laatste: (Array.isArray(v.laatste) ? v.laatste : []).slice(0, 5)
      .map((r) => ({ a: ACTIVITEITEN.get(String(r?.activiteit)), datum: String(r?.datum ?? ''), punten: heel(r?.punten) }))
      .filter((r) => r.a && /^\d{4}-\d{2}-\d{2}$/.test(r.datum)),
  };
}

// De naam van het team: de naam die de meeste leden noemen. Zo kan één vreemd profiel hem niet veranderen.
export function teamNaam(leden) {
  const tel = new Map();
  for (const l of leden) {
    const n = String(l.profiel?.teamnaam ?? '').trim().slice(0, 40);
    if (n) tel.set(n, (tel.get(n) ?? 0) + 1);
  }
  return [...tel].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'zonder naam';
}

export const procent = (punten) => Math.round(Math.min(1, punten / EIGENSCHAP_MAX) * 100);

function ranglijst(leden, eigen) {
  return leden.map((l, i) => maak('tr', { class: l.lid === eigen ? 'jij' : null },
    maak('td', { tekst: `${i + 1}` }),
    maak('th', { scope: 'row' }, l.callsign, l.lid === eigen ? maak('span', { class: 'zacht', tekst: ' (jij)' }) : null),
    maak('td', { class: 'team-rang' }, icoon(RANGEN[l.rang].icoon), ` ${RANGEN[l.rang].code ?? RANGEN[l.rang].naam}`, maak('span', { class: 'verborgen', tekst: `, ${RANGEN[l.rang].naam}` })),
    maak('td', { tekst: getal(l.pr) }),
    maak('td', { tekst: getal(l.reputatie) }),
    maak('td', { tekst: l.stijl?.naam ?? '–' })));
}

export function skilltabel(leden, eigen) {
  const sleutels = Object.keys(EIGENSCHAPPEN);
  const beste = Object.fromEntries(sleutels.map((k) => [k, Math.max(...leden.map((l) => procent(l.skills[k])))]));
  return [
    maak('caption', { class: 'verborgen', tekst: 'Skills van je teamleden, van 0 tot 100' }),
    maak('thead', {}, maak('tr', {}, maak('th', { scope: 'col', tekst: 'Callsign' }), ...sleutels.map((k) => maak('th', { scope: 'col', tekst: EIGENSCHAPPEN[k].kort })))),
    maak('tbody', {}, ...leden.map((l) => maak('tr', { class: l.lid === eigen ? 'jij' : null },
      maak('th', { scope: 'row', tekst: l.callsign }),
      ...sleutels.map((k) => {
        const p = procent(l.skills[k]);
        return maak('td', {}, p > 0 && p === beste[k] ? maak('strong', { class: 'beste' }, `${p}`, maak('span', { class: 'verborgen', tekst: ' (hoogste)' })) : `${p}`);
      })))),
  ];
}

export function kit(l) {
  const stukken = (W.LOADOUT?.delen ?? []).map((d) => [d, d.opties.find((o) => o[0] === l.loadout[d.id])]).filter(([, o]) => o);
  if (!stukken.length) return maak('p', { class: 'zacht', tekst: 'Nog geen loadout gekozen.' });
  return maak('ul', { class: 'team-kit' }, ...stukken.map(([d, [, naam, , spec]]) => maak('li', { class: 'team-stuk' },
    spec?.plaatje ? maak('img', { src: spec.plaatje, alt: '', width: 480, height: 240, loading: 'lazy' })
      : spec && !spec.geenBeeld ? staal(spec, null, 'helm') : null,
    maak('span', {}, maak('span', { class: 'zacht', tekst: `${d.naam}: ` }), naam))));
}

const lijstje = (titel, items) => [
  maak('h5', { tekst: `${titel} (${items.length})` }),
  items.length ? maak('ul', { class: 'team-chips' }, ...items.map((x) => maak('li', { class: 'team-chip' }, icoon(x.icoon), ` ${x.naam}`))) : maak('p', { class: 'zacht', tekst: 'Nog geen.' }),
];

export function profiel(l, eigen) {
  const r = RANGEN[l.rang];
  const uitstraling = W.LOADOUT ? loadout({ loadout: l.loadout }) : null;
  return maak('li', { class: 'team-lid' }, maak('details', {},
    maak('summary', {}, icoon(r.icoon), ` ${l.callsign}${l.lid === eigen ? ' (jij)' : ''} · ${r.naam} · ${getal(l.pr)} PR`),
    maak('dl', { class: 'feiten' }, ...[
      ['Rang', `${r.naam}${r.code ? ` (${r.code})` : ''}`],
      ['Prestigepunten', `${getal(l.pr)} PR`],
      [W.WERELD.bekendheid, getal(l.reputatie)],
      ['Speelstijl', l.stijl?.naam ?? 'nog niet gekozen'],
      ...(uitstraling ? [['Loadout', tredeZichtbaar(uitstraling.trede)
        ? `${l.loadout.naam ? `${l.loadout.naam}: ` : ''}${uitstraling.naam}`
        : l.loadout.naam ?? 'gekozen']] : []),
    ].map(([dt, dd]) => maak('div', {}, maak('dt', { tekst: dt }), maak('dd', { tekst: dd })))),
    maak('h5', { tekst: 'Loadout' }), kit(l),
    ...lijstje(W.WERELD.symbolen ?? 'Patches', l.symbolen),
    ...lijstje('Prestaties', l.prestaties),
    maak('h5', { tekst: 'Laatste activiteiten' }),
    l.laatste.length
      ? maak('ul', { class: 'team-laatste' }, ...l.laatste.map((x) => maak('li', {},
        maak('span', { class: 'zacht', tekst: `${datumKort.format(new Date(`${x.datum}T12:00`))} ` }), x.a.naam, x.punten < 0 ? null : maak('span', { class: 'actie-punten', tekst: ` ${metTeken(x.punten)}` }))))
      : maak('p', { class: 'zacht', tekst: 'Nog niets gelogd.' })));
}

// staat: { team, leden (null zolang er niets is), eigen (lid-hash), fout, bezig }
export function toonTeam(el, staat) {
  if (!el.team) return;
  const { team } = staat;
  el.teamUit.hidden = Boolean(team);
  el.teamAan.hidden = !team;
  el.teamTitel.textContent = team ? `Team ${team.naam}` : 'Je team';
  if (!team) return;
  el.teamCode.textContent = toonCode(team.code);
  el.teamLink.hidden = !staat.link;
  if (staat.link) el.teamLink.href = staat.link;
  el.teamLinkKopieer.hidden = !staat.link;
  el.teamBadge.hidden = !staat.badge;
  el.teamBadge.replaceChildren(...(staat.badge ? [maak('img', { src: staat.badge, alt: 'Badge van het team', width: 96, height: 96 })] : []));
  const leden = (staat.leden ?? []).map((l) => schoon(l.profiel, l.lid)).sort((a, b) => b.pr - a.pr || a.callsign.localeCompare(b.callsign, 'nl'));
  const laatst = (staat.leden ?? []).map((l) => l.bijgewerkt).sort().at(-1);
  el.teamStatus.textContent = staat.fout || (staat.bezig && !staat.leden ? 'Bezig met ophalen…'
    : `${leden.length} ${leden.length === 1 ? 'lid' : 'leden'}${laatst ? `, laatst bijgewerkt ${tijd(laatst)}` : ''}.`);
  el.teamStatus.classList.toggle('fout', Boolean(staat.fout));
  el.teamRijen.replaceChildren(...ranglijst(leden, staat.eigen));
  el.teamSkills.replaceChildren(...(leden.length ? skilltabel(leden, staat.eigen) : []));
  el.teamLeden.replaceChildren(...leden.map((l) => profiel(l, staat.eigen)));
}
