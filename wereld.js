/*
 * De wereld waarin de motor draait: de inhoud van één app, zoals Wassenaar Aanzien of Veldrang.
 * De ingang van een app (app.js) laadt eerst een module die W vult met haar gegevens, en dan pas de motor.
 * Wat een wereld niet gebruikt, staat hier leeg. De motor slaat dat systeem dan over.
 */

export const W = {};

const LEEG = {
  TYPEN: [],
  SPEELSTIJLEN: [],
  ENERGIE: null,
  QUIZ: [],
  QUIZ_PUNTEN: 0,
  NATIONALE_DAGEN: [],
  NATIONAAL_MARGE: 0,
  NATIONAAL_BONUS: 1,
  KAPITAAL: [],
  LOADOUT: null,
};

export function vul(gegevens) {
  Object.assign(W, LEEG, gegevens);
}
