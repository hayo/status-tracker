/*
 * Opslag op de server, versleuteld. De synccode is het enige geheim: daaruit komen het id waaronder
 * de server bewaart (een SHA-256-hash) en de sleutel waarmee de app versleutelt (HKDF, AES-GCM).
 * De server ziet de code en de voortgang dus nooit. Zie opslag.php.
 * Elke wereld heeft eigen namen voor het id en de sleutel (WERELD.sync): een code van de ene app
 * opent zo nooit de voortgang van de andere.
 */

import { W } from './wereld.js';

// Op een andere site dan hayobethlehem.nl (zoals GitHub Pages) gaat de opslag naar deze URL.
const SERVER = 'https://hayobethlehem.nl/content/forge/status-tracker/opslag.php';
const TEKENS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // zonder O, 0, I en 1, die lijken op elkaar
const LENGTE = 26; // 26 × 5 bits = 130 bits

const tekst = new TextEncoder();

export const url = document.querySelector('link[rel="manifest"]') && location.origin !== new URL(SERVER).origin
  ? SERVER
  : new URL('opslag.php', import.meta.url).href;

export function nieuweCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(LENGTE));
  return [...bytes].map((b) => TEKENS[b % TEKENS.length]).join('');
}

// Maakt van wat iemand intypt een code, of null. Streepjes, spaties en kleine letters mogen.
export function leesCode(invoer) {
  const code = String(invoer).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return code.length === LENGTE && [...code].every((t) => TEKENS.includes(t)) ? code : null;
}

export const toonCode = (code) => code.match(/.{1,5}/g).join('-');

export const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
const naarBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const uitBase64 = (s) => Uint8Array.from(atob(s), (t) => t.charCodeAt(0));

// deel scheidt soorten opslag met dezelfde soort code: '' voor je voortgang, ':team' voor een team.
export async function sleutels(code, deel = '') {
  const id = hex(await crypto.subtle.digest('SHA-256', tekst.encode(`${W.WERELD.sync.id}${deel}:${code}`)));
  const basis = await crypto.subtle.importKey('raw', tekst.encode(code), 'HKDF', false, ['deriveKey']);
  const sleutel = await crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: tekst.encode(`${W.WERELD.sync.zout}${deel}`), info: tekst.encode('sleutel') },
    basis, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
  return { id, sleutel };
}

export async function versleutel(sleutel, waarde) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const blok = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sleutel, tekst.encode(JSON.stringify(waarde))));
  const alles = new Uint8Array(iv.length + blok.length);
  alles.set(iv);
  alles.set(blok, iv.length);
  return naarBase64(alles);
}

export async function ontsleutel(sleutel, data) {
  const alles = uitBase64(data);
  const klaar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: alles.slice(0, 12) }, sleutel, alles.slice(12));
  return JSON.parse(new TextDecoder().decode(klaar));
}

export async function vraag(verzoek) {
  const antwoord = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verzoek),
    cache: 'no-store',
  });
  const inhoud = await antwoord.json().catch(() => ({}));
  return { status: antwoord.status, ...inhoud };
}

// Haalt de voortgang op: { revisie, spel }, of { revisie: 0, spel: null } als er nog niets is.
export async function lees(code) {
  const { id, sleutel } = await sleutels(code);
  const a = await vraag({ actie: 'lees', id });
  if (a.status === 404) return { revisie: 0, spel: null };
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
  return { revisie: a.revisie, spel: await ontsleutel(sleutel, a.data) };
}

// Bewaart, als de server nog op revisie staat. Anders: { conflict: true, revisie, spel } van de server.
export async function schrijf(code, revisie, spel) {
  const { id, sleutel } = await sleutels(code);
  const a = await vraag({ actie: 'schrijf', id, revisie, data: await versleutel(sleutel, spel) });
  if (a.status === 409) return { conflict: true, revisie: a.revisie, spel: a.data ? await ontsleutel(sleutel, a.data) : null };
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
  return { conflict: false, revisie: a.revisie };
}

export async function wis(code) {
  const { id } = await sleutels(code);
  const a = await vraag({ actie: 'wis', id });
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
}
