/*
 * De teampagina: een team om te bekijken, met een link. Achter het # staan het id van het team en de
 * sleutel om te lezen (zie team.js); de server ziet ze nooit. Aansluiten kan hier niet: daarvoor is de
 * teamcode nodig. Een wereld laadt dit na zijn eigen inhoud, zoals veldrang/teampagina.js.
 */

import { W } from './wereld.js';
import { maak, icoon, getal } from './ui.js';
import { embleem } from './embleem.js';
import { loadout, tredeZichtbaar } from './spel.js';
import { staal } from './staal.js';
import * as teams from './team.js';
import { schoon, skilltabel, profiel, teamNaam, procent } from './schermen/team.js';

const { RANGEN } = W;
const app = document.getElementById('aanzien');
const el = {};
for (const e of app.querySelectorAll('[id]')) el[e.id.slice(3).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = e;

// Rangen met een embleem krijgen een eigen icoon in de sprite, net als in de app.
const sprite = app.querySelector('svg.sprite');
RANGEN.forEach((r, i) => {
  if (!r.embleem) return;
  sprite.append(maak('svg:symbol', { id: `az-i-rang-${i}`, viewBox: '0 0 64 64' }, ...embleem(r.embleem).map((d) => maak('svg:path', { d, 'fill-rule': 'evenodd' }))));
  r.icoon = `rang-${i}`;
});

const plekNamen = ['Eerste plaats', 'Tweede plaats', 'Derde plaats'];

function kitVan(l) {
  const camo = W.LOADOUT?.delen.find((d) => d.id === 'camo')?.opties.find((o) => o[0] === l.loadout.camo);
  const wapen = W.LOADOUT?.delen.find((d) => d.id === 'wapen')?.opties.find((o) => o[0] === l.loadout.wapen);
  return [
    camo?.[3] && !camo[3].geenBeeld ? staal(camo[3], `Camo: ${camo[1]}`, 'helm') : null,
    wapen?.[3]?.plaatje ? maak('img', { class: 'tp-wapen', src: wapen[3].plaatje, alt: `Hoofdwapen: ${wapen[1]}`, width: 480, height: 240, loading: 'lazy' }) : null,
  ].filter(Boolean);
}

const onder = (l) => {
  const uit = W.LOADOUT ? loadout({ loadout: l.loadout }) : null;
  return [l.stijl?.naam, uit && tredeZichtbaar(uit.trede) ? uit.naam : null].filter(Boolean).join(' · ');
};

// De eerste drie op een podium: groot embleem, callsign, rang, PR en kit.
function podiumKaart(l, plek) {
  const r = RANGEN[l.rang];
  const kit = kitVan(l);
  return maak('li', { class: `tp-trede tp-plek-${plek + 1}` },
    maak('span', { class: 'tp-medaille', title: plekNamen[plek] }, maak('span', { class: 'verborgen', tekst: `${plekNamen[plek]}: ` }), `${plek + 1}`),
    icoon(r.icoon, 'icoon tp-embleem'),
    maak('strong', { class: 'tp-callsign', tekst: l.callsign }),
    maak('span', { class: 'tp-rangnaam', tekst: `${r.naam}${r.code ? ` · ${r.code}` : ''}` }),
    maak('span', { class: 'tp-pr' }, maak('strong', { tekst: getal(l.pr) }), ' PR'),
    onder(l) ? maak('span', { class: 'tp-stijl', tekst: onder(l) }) : null,
    kit.length ? maak('div', { class: 'tp-kit' }, ...kit) : null);
}

// Wie daarna komt, in een rij: plek, embleem, callsign en rang, kit en PR.
function rij(l, plek) {
  const r = RANGEN[l.rang];
  return maak('li', { class: 'tp-lid' },
    maak('span', { class: 'tp-plek', tekst: `${plek + 1}` }),
    icoon(r.icoon, 'icoon tp-embleem'),
    maak('div', { class: 'tp-wie' },
      maak('strong', { class: 'tp-callsign', tekst: l.callsign }),
      maak('span', { tekst: `${r.naam}${r.code ? ` · ${r.code}` : ''}` }),
      onder(l) ? maak('span', { class: 'zacht', tekst: onder(l) }) : null),
    maak('div', { class: 'tp-kit' }, ...kitVan(l)),
    maak('span', { class: 'tp-pr' }, maak('strong', { tekst: getal(l.pr) }), ' PR'));
}

// Per skill wie het beste is, met een balk.
function specialisten(leden) {
  return Object.entries(W.EIGENSCHAPPEN).map(([k, e]) => {
    const beste = leden.reduce((a, l) => (l.skills[k] > a.skills[k] ? l : a), leden[0]);
    const p = procent(beste.skills[k]);
    const balk = maak('span', { class: 'tp-balk' }, maak('span', {}));
    balk.firstChild.style.setProperty('--p', p);
    return maak('li', { class: `tp-specialist skill-${k}` },
      icoon(e.icoon, 'icoon tp-skill-icoon'),
      maak('span', { class: 'tp-skill-naam', tekst: e.kort }),
      maak('strong', { tekst: p > 0 ? beste.callsign : '–' }),
      maak('span', { class: 'tp-skill-getal', tekst: `${p}` }),
      balk);
  });
}

// De slug in de link volgt de naam van het team, ook als die verandert.
function zetLink(team, naam) {
  const hash = `#${teams.kijklink(team, naam)}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

el.tpKopieer?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    el.tpKopieer.lastChild.textContent = ' Gekopieerd';
  } catch {
    el.tpKopieer.lastChild.textContent = ' Kopieer de link uit de adresbalk';
  }
  setTimeout(() => { el.tpKopieer.lastChild.textContent = ' Kopieer de link'; }, 2500);
});

// Thuisveld en regio, de omschrijving en de links van het team. Alles als tekst; links alleen http(s).
function toonInfo(info) {
  const waar = [info.thuisveld, info.regio].filter(Boolean).join(', ');
  el.tpWaar.hidden = !waar;
  el.tpWaar.replaceChildren(...(waar ? [icoon('location-dot'), ` ${waar}`] : []));
  el.tpOmschrijving.hidden = !info.omschrijving;
  el.tpOmschrijving.textContent = info.omschrijving;
  el.tpLinks.hidden = !info.links.length;
  el.tpLinks.replaceChildren(...info.links.map((href) => maak('li', {},
    maak('a', { href, rel: 'noopener noreferrer nofollow ugc', target: '_blank' }, icoon('link'), ` ${teams.linkNaam(href)}`))));
}

function toon(team, data) {
  const leden = data.leden.map((l) => schoon(l.profiel, l.lid)).sort((a, b) => b.pr - a.pr || a.callsign.localeCompare(b.callsign, 'nl'));
  if (!leden.length) {
    el.tpStatus.textContent = 'Dit team heeft nog geen leden die we kunnen tonen.';
    return;
  }
  const naam = teamNaam(data.leden);
  zetLink(team, naam);
  document.title = `Team ${naam} · ${W.WERELD.naam}`;
  el.tpNaam.textContent = `Team ${naam}`;
  const badge = teams.badgeUrl(data.badge);
  el.tpBadge.classList.toggle('met-beeld', Boolean(badge));
  if (badge) el.tpBadge.replaceChildren(maak('img', { src: badge, alt: 'Badge van het team', width: 160, height: 160 }));
  const hoogste = Math.max(...leden.map((l) => l.rang));
  const samen = leden.reduce((s, l) => s + l.pr, 0);
  const sterk = Object.keys(W.EIGENSCHAPPEN).map((k) => [k, leden.reduce((s, l) => s + l.skills[k], 0)]).sort((a, b) => b[1] - a[1])[0];
  el.tpCijfers.replaceChildren(...[
    ['users', 'Leden', getal(leden.length)],
    ['trophy', 'Samen', `${getal(samen)} PR`],
    ['gauge-high', 'Gemiddeld', `${getal(samen / leden.length)} PR`],
    [RANGEN[hoogste].icoon, 'Hoogste rang', RANGEN[hoogste].naam],
    ...(sterk[1] > 0 ? [[W.EIGENSCHAPPEN[sterk[0]].icoon, 'Sterk in', W.EIGENSCHAPPEN[sterk[0]].kort]] : []),
  ].map(([ic, dt, dd]) => maak('div', {}, icoon(ic, 'icoon tp-cijfer-icoon'), maak('dt', { tekst: dt }), maak('dd', { tekst: dd }))));
  toonInfo(data.info ?? teams.schoneInfo(null));
  el.tpStatus.textContent = '';
  el.tpKopieer.hidden = !navigator.clipboard;
  el.tpPodium.replaceChildren(...leden.slice(0, 3).map(podiumKaart));
  el.tpLeden.replaceChildren(...leden.slice(3).map((l, i) => rij(l, i + 3)));
  el.tpLeden.hidden = leden.length <= 3;
  el.tpSpecialisten.replaceChildren(...specialisten(leden));
  el.tpSkills.replaceChildren(...skilltabel(leden, null, true));
  el.tpProfielen.replaceChildren(...leden.map((l) => profiel(l, null)));
  el.tpInhoud.hidden = false;
}
async function start() {
  const team = await teams.uitKijklink(location.hash.slice(1));
  if (!team) {
    el.tpStatus.textContent = 'Deze link is niet compleet. Vraag een teamlid om de link naar de teampagina.';
    el.tpStatus.classList.add('fout');
    return;
  }
  try {
    const data = await teams.lees(team);
    if (!data) {
      el.tpStatus.textContent = 'Dit team bestaat niet meer, of de link klopt niet.';
      el.tpStatus.classList.add('fout');
      return;
    }
    toon(team, data);
  } catch {
    el.tpStatus.textContent = 'De server is niet bereikbaar. Probeer het later opnieuw.';
    el.tpStatus.classList.add('fout');
  }
}

window.addEventListener('hashchange', start);
start();
