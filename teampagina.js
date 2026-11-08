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
import { schoon, skilltabel, profiel, teamNaam } from './schermen/team.js';

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

// Een kaart per lid: embleem, callsign, rang, PR en speelstijl, met camo-helm en hoofdwapen.
function kaart(l, plek) {
  const r = RANGEN[l.rang];
  const camo = W.LOADOUT?.delen.find((d) => d.id === 'camo')?.opties.find((o) => o[0] === l.loadout.camo);
  const wapen = W.LOADOUT?.delen.find((d) => d.id === 'wapen')?.opties.find((o) => o[0] === l.loadout.wapen);
  const uit = W.LOADOUT ? loadout({ loadout: l.loadout }) : null;
  return maak('li', { class: `tp-lid${plek < 3 ? ` tp-plek-${plek + 1}` : ''}` },
    maak('span', { class: 'tp-plek', tekst: `${plek + 1}` }),
    icoon(r.icoon, 'icoon tp-embleem'),
    maak('div', { class: 'tp-wie' },
      maak('strong', { class: 'tp-callsign', tekst: l.callsign }),
      maak('span', { tekst: `${r.naam}${r.code ? ` · ${r.code}` : ''}` }),
      maak('span', { class: 'zacht', tekst: [l.stijl?.naam, uit && tredeZichtbaar(uit.trede) ? uit.naam : null].filter(Boolean).join(' · ') })),
    maak('span', { class: 'tp-pr' }, maak('strong', { tekst: getal(l.pr) }), ' PR'),
    maak('div', { class: 'tp-kit' },
      camo?.[3] && !camo[3].geenBeeld ? staal(camo[3], `Camo: ${camo[1]}`, 'helm') : null,
      wapen?.[3]?.plaatje ? maak('img', { src: wapen[3].plaatje, alt: `Hoofdwapen: ${wapen[1]}`, width: 480, height: 240, loading: 'lazy' }) : null));
}

function toon(team, data) {
  const leden = data.leden.map((l) => schoon(l.profiel, l.lid)).sort((a, b) => b.pr - a.pr || a.callsign.localeCompare(b.callsign, 'nl'));
  const naam = teamNaam(data.leden);
  document.title = `Team ${naam} · ${W.WERELD.naam}`;
  el.tpNaam.textContent = `Team ${naam}`;
  const badge = teams.badgeUrl(data.badge);
  el.tpBadge.hidden = !badge;
  el.tpBadge.replaceChildren(...(badge ? [maak('img', { src: badge, alt: 'Badge van het team', width: 160, height: 160 })] : []));
  const hoogste = Math.max(...leden.map((l) => l.rang));
  el.tpCijfers.replaceChildren(...[
    ['Leden', getal(leden.length)],
    ['Samen', `${getal(leden.reduce((s, l) => s + l.pr, 0))} PR`],
    ['Hoogste rang', RANGEN[hoogste].naam],
  ].map(([dt, dd]) => maak('div', {}, maak('dt', { tekst: dt }), maak('dd', { tekst: dd }))));
  el.tpStatus.textContent = '';
  el.tpLeden.replaceChildren(...leden.map(kaart));
  el.tpSkills.replaceChildren(...skilltabel(leden, null));
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
