/*
 * Teams op de server. Uit de teamcode komen drie dingen:
 * - het id van het team (een hash), waaronder de server het team bewaart;
 * - de sleutel waarmee elk lid zijn profiel versleutelt (en de badge van het team);
 * - een schrijfbewijs: wie dat heeft, kan aansluiten. De server bewaart alleen de hash ervan.
 * Een kijklink (teampagina) bevat alleen het id en de sleutel. Wie de link heeft, kan het team zien,
 * maar niet aansluiten; daarvoor is de code nodig. De server kan niets lezen.
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
  return { id, sleutel: await aes(ruw), kijk: naarB64url(ruw), schrijf: await sha(`schrijf:${code}`) };
}

// De kijklink: id en sleutel, achter het # zodat de server ze nooit ziet.
export const kijklink = (team) => `${team.id}.${team.kijk}`;

export async function uitKijklink(deel) {
  const [id, kijk] = String(deel).split('.');
  if (!/^[0-9a-f]{64}$/.test(id ?? '') || !/^[A-Za-z0-9_-]{43}$/.test(kijk ?? '')) return null;
  return { id, sleutel: await aes(uitB64url(kijk)) };
}

// Het team: { leden: [{ lid, profiel, bijgewerkt }], badge: { type, data } | null }, of null als er geen
// team is. Een profiel dat niet te ontsleutelen is, slaan we over.
export async function lees(team) {
  const a = await vraag({ actie: 'team-lees', id: team.id });
  if (a.status !== 200 || !Array.isArray(a.leden)) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
  if (!a.leden.length) return null;
  const leden = await Promise.all(a.leden.map(async (l) => {
    try { return { lid: String(l.lid), profiel: await ontsleutel(team.sleutel, l.data), bijgewerkt: String(l.bijgewerkt ?? '') }; } catch { return null; }
  }));
  let badge;
  try { badge = a.badge ? await ontsleutel(team.sleutel, a.badge) : null; } catch { badge = null; }
  return { leden: leden.filter(Boolean), badge };
}

async function schrijf(actie, code, token, waarde) {
  const team = await uitCode(code);
  const a = await vraag({ actie, id: team.id, token, schrijf: team.schrijf, data: waarde === null ? null : await versleutel(team.sleutel, waarde) });
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
}

export const plaats = (code, token, profiel) => schrijf('team-schrijf', code, token, profiel);
// badge: { type, data (base64) } of null om hem weg te halen.
export const zetBadge = (code, token, badge) => schrijf('team-badge', code, token, badge);

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
