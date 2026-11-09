/*
 * Teams op de server. Uit de teamcode komen drie dingen:
 * - het id van het team (een hash), waaronder de server het team bewaart;
 * - de sleutel waarmee elk lid zijn profiel versleutelt (en de badge van het team);
 * - een schrijfbewijs: wie dat heeft, kan aansluiten. De server bewaart alleen de hash ervan.
 * Een kijklink (teampagina) bevat alleen het id en de sleutel. Wie de link heeft, kan het team zien,
 * maar niet aansluiten; daarvoor is de code nodig. De server kan niets lezen.
 * De korte kijklink bevat alleen een linkgeheim (16 bytes), ook uit de teamcode. Onder de hash daarvan
 * bewaart de server het id en de sleutel, versleuteld met dat geheim. Ook dat kan de server niet lezen.
 * Elk lid heeft ook een eigen geheim token. De server bewaart daarvan alleen de hash (lid), zodat alleen
 * jij je eigen profiel kunt bijwerken of weghalen.
 */

import { W } from './wereld.js';
import { versleutel, ontsleutel, vraag, hex } from './opslag.js';

const tekst = new TextEncoder();
const naarB64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const uitB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (t) => t.charCodeAt(0));
const sha = async (s) => hex(await crypto.subtle.digest('SHA-256', tekst.encode(s)));
const aes = (ruw) => crypto.subtle.importKey('raw', ruw, 'AES-GCM', false, ['encrypt', 'decrypt']);

export const nieuwToken = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export const lidVan = (token) => sha(token);

// Alles wat uit de teamcode volgt. Dezelfde afleiding als sleutels(code, ':team') in opslag.js.
export async function uitCode(code) {
  const id = await sha(`${W.WERELD.sync.id}:team:${code}`);
  const basis = await crypto.subtle.importKey('raw', tekst.encode(code), 'HKDF', false, ['deriveBits']);
  const ruw = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: tekst.encode(`${W.WERELD.sync.zout}:team`), info: tekst.encode('sleutel') }, basis, 256));
  const kort = naarB64url(new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: tekst.encode(`${W.WERELD.sync.zout}:team`), info: tekst.encode('link') }, basis, 128)));
  return { id, sleutel: await aes(ruw), kijk: naarB64url(ruw), schrijf: await sha(`schrijf:${code}`), kort };
}

// Uit het linkgeheim: het id waaronder de server de korte link bewaart, en de sleutel ervoor.
const uitKort = async (kort) => ({ id: await sha(`${W.WERELD.sync.id}:link:${kort}`), sleutel: await aes(uitB64url(kort)) });

// Een leesbaar stukje van de teamnaam voor in de link: 'Delta Wolves' wordt 'delta-wolves'.
export const slug = (naam) => String(naam ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '');

// De kijklink: de naam als slug, dan het linkgeheim (kort), of anders id en sleutel. Alles achter het #,
// zodat de server niets ziet, ook de naam niet. Zonder naam blijft alleen het laatste deel over.
export const kijklink = (team, naam) => [slug(naam), team.kort ?? `${team.id}.${team.kijk}`].filter(Boolean).join('/');

// Het team uit een kijklink: { id, kijk, sleutel, kort? }, of null als de link niet klopt of de korte
// link niet (meer) bestaat. Een korte link vraagt de server om het id en de sleutel.
export async function uitKijklink(deel) {
  const laatste = String(deel).split('/').at(-1);
  if (/^[A-Za-z0-9_-]{22}$/.test(laatste)) {
    const link = await uitKort(laatste);
    const a = await vraag({ actie: 'team-link-lees', id: link.id });
    if (a.status === 404) return null;
    if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
    let kijk;
    try { kijk = await ontsleutel(link.sleutel, a.data); } catch { return null; }
    if (!/^[0-9a-f]{64}$/.test(a.id ?? '') || !/^[A-Za-z0-9_-]{43}$/.test(kijk ?? '')) return null;
    return { id: a.id, kijk, sleutel: await aes(uitB64url(kijk)), kort: laatste };
  }
  const [id, kijk] = laatste.split('.');
  if (!/^[0-9a-f]{64}$/.test(id ?? '') || !/^[A-Za-z0-9_-]{43}$/.test(kijk ?? '')) return null;
  return { id, kijk, sleutel: await aes(uitB64url(kijk)) };
}

// Zet de korte link op de server: onder de hash van het linkgeheim het id en de sleutel, versleuteld
// met dat geheim. Alleen leden kunnen dat. Elk lid maakt dezelfde link, want hij volgt uit de code.
export async function zetKorteLink(code, token) {
  const team = await uitCode(code);
  const link = await uitKort(team.kort);
  const a = await vraag({ actie: 'team-link', id: team.id, token, schrijf: team.schrijf, link: link.id, data: await versleutel(link.sleutel, team.kijk) });
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
}

// Het team: { leden: [{ lid, profiel, bijgewerkt }], badge: { type, data } | null, info }, of null als er
// geen team is. Een profiel dat niet te ontsleutelen is, slaan we over. info is altijd schoon (zie schoneInfo).
export async function lees(team) {
  const a = await vraag({ actie: 'team-lees', id: team.id });
  if (a.status !== 200 || !Array.isArray(a.leden)) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
  if (!a.leden.length) return null;
  const leden = await Promise.all(a.leden.map(async (l) => {
    try { return { lid: String(l.lid), profiel: await ontsleutel(team.sleutel, l.data), bijgewerkt: String(l.bijgewerkt ?? '') }; } catch { return null; }
  }));
  let badge, info;
  try { badge = a.badge ? await ontsleutel(team.sleutel, a.badge) : null; } catch { badge = null; }
  try { info = a.info ? await ontsleutel(team.sleutel, a.info) : null; } catch { info = null; }
  return { leden: leden.filter(Boolean), badge, info: schoneInfo(info), openbaar: typeof a.openbaar === 'string' ? a.openbaar : null, link: a.link === true };
}

async function schrijf(actie, code, token, waarde) {
  const team = await uitCode(code);
  const a = await vraag({ actie, id: team.id, token, schrijf: team.schrijf, data: waarde === null ? null : await versleutel(team.sleutel, waarde) });
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
}

export const plaats = (code, token, profiel) => schrijf('team-schrijf', code, token, profiel);
// badge: { type, data (base64) } of null om hem weg te halen.
export const zetBadge = (code, token, badge) => schrijf('team-badge', code, token, badge);

// De gegevens van het team: omschrijving, thuisveld, regio en links. Ieder lid kan ze aanpassen.
export const zetInfo = (code, token, info) => schrijf('team-info', code, token, schoneInfo(info));

// Maakt de teampagina openbaar onder de naam van het team, of met naam null weer besloten. De server
// krijgt dan de leessleutel van dit team (zie openbaar.php). Geeft de naam in de link, of null.
export async function zetOpenbaar(code, token, naam) {
  const team = await uitCode(code);
  const a = await vraag({ actie: 'team-openbaar', id: team.id, token, schrijf: team.schrijf, kijk: naam === null ? null : team.kijk, slug: slug(naam) });
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
  return typeof a.openbaar === 'string' ? a.openbaar : null;
}

export const INFO_MAX = { omschrijving: 500, thuisveld: 60, regio: 60, links: 5, link: 200 };

const regel = (x, max) => String(x ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// Een link mag alleen http of https zijn. Zonder http ervoor zetten we https:// ervoor.
export function schoneLink(x) {
  const tekst = String(x ?? '').trim();
  if (!tekst || tekst.length > INFO_MAX.link) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(tekst) ? tekst : `https://${tekst}`);
    return /^https?:$/.test(url.protocol) && url.hostname.includes('.') ? url.href : null;
  } catch { return null; }
}

// Maakt van wat er binnenkomt iets wat we veilig kunnen tonen. Teksten alleen als tekst.
export function schoneInfo(v) {
  const i = v && typeof v === 'object' ? v : {};
  return {
    omschrijving: String(i.omschrijving ?? '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, INFO_MAX.omschrijving),
    thuisveld: regel(i.thuisveld, INFO_MAX.thuisveld),
    regio: regel(i.regio, INFO_MAX.regio),
    links: [...new Set((Array.isArray(i.links) ? i.links : []).map(schoneLink).filter(Boolean))].slice(0, INFO_MAX.links),
  };
}

const SITES = [
  [/(^|\.)instagram\.com$/, 'Instagram'], [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, 'Facebook'],
  [/(^|\.)discord\.(gg|com)$/, 'Discord'], [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'YouTube'],
  [/(^|\.)tiktok\.com$/, 'TikTok'], [/(^|\.)(x|twitter)\.com$/, 'X'], [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/, 'WhatsApp'],
];

// De naam van een link voor op een knop: Instagram, Discord, of anders de site zelf.
export function linkNaam(href) {
  const host = new URL(href).hostname.replace(/^www\./, '');
  return SITES.find(([re]) => re.test(host))?.[1] ?? host;
}

export async function verlaat(code, token) {
  const { id } = await uitCode(code);
  const a = await vraag({ actie: 'team-verlaat', id, token });
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
}

// Een badge als url voor een <img>: een blob, zodat er geen data-URL in de pagina komt.
export function badgeUrl(badge) {
  if (!badge || typeof badge.data !== 'string' || !/^image\/(png|jpeg|webp)$/.test(badge.type ?? '')) return null;
  try { return URL.createObjectURL(new Blob([Uint8Array.from(atob(badge.data), (t) => t.charCodeAt(0))], { type: badge.type })); } catch { return null; }
}

// Maakt van een gekozen bestand een badge: hoogstens 256 beeldpunten, als webp.
export async function maakBadge(bestand) {
  const beeld = await createImageBitmap(bestand);
  const schaal = Math.min(1, 256 / Math.max(beeld.width, beeld.height));
  const doek = document.createElement('canvas');
  doek.width = Math.round(beeld.width * schaal);
  doek.height = Math.round(beeld.height * schaal);
  doek.getContext('2d').drawImage(beeld, 0, 0, doek.width, doek.height);
  const blob = await new Promise((klaar) => { doek.toBlob(klaar, 'image/webp', 0.86); });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let tekens = '';
  for (let i = 0; i < bytes.length; i += 0x8000) tekens += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { type: blob.type || 'image/webp', data: btoa(tekens) };
}
