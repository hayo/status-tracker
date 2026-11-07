# Wassenaar Aanzien

Een kleine web-app. Je houdt bij wat je doet in Wassenaar en ziet hoe je aanzien groeit.

- Je logt activiteiten en statussymbolen. Daarvoor krijg je punten (PR).
- Met genoeg punten stijg je in rang, van Voorbijganger tot Ereburger.
- Je ziet je voortgang: de rangladder, een kalender, punten per week, je eigenschappen en wat je per groep al gedaan hebt.
- Het strategieboek legt uit waarom deze activiteiten helpen.

De app staat op <https://hayo.github.io/status-tracker/>.

## Je gegevens

Alles staat alleen in je eigen browser. Er gaat niets online.

- Bewaar je gegevens af en toe als bestand, via **Gegevens → Bewaar als bestand**.
- Op een andere telefoon of computer zet je dat bestand terug via **Gegevens → Zet een bestand terug**.
- Wis je de gegevens van je browser? Dan is alles weg, behalve wat je als bestand bewaard hebt.

## Op je telefoon

1. Open de app in Safari of Chrome.
2. Kies **Deel → Zet op beginscherm** (iPhone) of **Installeer app** (Android).
3. De app werkt daarna ook zonder internet.

Let op: op een iPhone heeft de app op het beginscherm eigen opslag, los van Safari. Gebruik dus steeds dezelfde.

## Eenmalig: GitHub Pages aanzetten

1. Ga in deze repo naar **Settings → Pages**.
2. Kies bij **Source** voor **Deploy from a branch**.
3. Kies branch `main` en map `/ (root)`. Klik op **Save**.

## Activiteiten en symbolen aanpassen

Alle activiteiten, statussymbolen, rangen en startvragen staan in `gegevens.js`.

- Voeg een activiteit toe met een nieuw id, bijvoorbeeld `a12`.
- Verander nooit een bestaand id. Het logboek verwijst ernaar.

## Versies

De versie staat onderaan elke pagina. Klik erop en je ziet wat er veranderd is.

- Het eerste cijfer gaat omhoog bij een compleet nieuw ontwerp, zoals van 1.0 naar 2.0.
- Het tweede cijfer gaat omhoog bij een groot nieuw onderdeel, zoals van 2.0 naar 2.1.
- Het derde cijfer gaat omhoog bij elke andere wijziging, zoals van 2.1 naar 2.1.1.

Na elke wijziging zet je bovenaan `VERSIES` in `gegevens.js` een nieuwe versie. Zet hetzelfde nummer in `VERSIE` in `sw.js`. Anders blijven telefoons de oude versie gebruiken.
