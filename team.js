/*
 * Teams op de server. Wie een team maakt, krijgt een teamcode. Daaruit komen het id van het team en
 * de sleutel waarmee elk lid zijn profiel versleutelt, net als bij de synccode (zie opslag.js). Wie
 * de code heeft, kan de profielen lezen; de server niet.
 * Elk lid heeft een eigen geheim token. De server bewaart alleen de hash ervan (lid), zodat alleen
 * jij je eigen profiel kunt bijwerken of weghalen.
 */

import { sleutels, versleutel, ontsleutel, vraag, hex } from './opslag.js';

const tekst = new TextEncoder();

export const nieuwToken = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export const lidVan = async (token) => hex(await crypto.subtle.digest('SHA-256', tekst.encode(token)));

// De leden van het team: [{ lid, profiel, bijgewerkt }], of null als er bij deze code geen team is.
// Een profiel dat niet te ontsleutelen is, slaan we over.
export async function lees(code) {
  const { id, sleutel } = await sleutels(code, ':team');
  const a = await vraag({ actie: 'team-lees', id });
  if (a.status !== 200 || !Array.isArray(a.leden)) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
  const leden = await Promise.all(a.leden.map(async (l) => {
    try { return { lid: String(l.lid), profiel: await ontsleutel(sleutel, l.data), bijgewerkt: String(l.bijgewerkt ?? '') }; } catch { return null; }
  }));
  return a.leden.length ? leden.filter(Boolean) : null;
}

export async function plaats(code, token, profiel) {
  const { id, sleutel } = await sleutels(code, ':team');
  const a = await vraag({ actie: 'team-schrijf', id, token, data: await versleutel(sleutel, profiel) });
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
}

export async function verlaat(code, token) {
  const { id } = await sleutels(code, ':team');
  const a = await vraag({ actie: 'team-verlaat', id, token });
  if (a.status !== 200) throw new Error(a.fout ?? `De server gaf ${a.status}.`);
}
