# Wassenaar Aanzien

Een kleine web-app om bij te houden hoe je aanzien in Wassenaar groeit. Je logt
wat je doet, en ziet je rang stijgen van Voorbijganger tot Ereburger.

Demo: https://hayobethlehem.nl/forge/status-tracker en
https://hayo.github.io/status-tracker/

- **Status**: je rang, de rangladder, je punten (PR), een kalender van 17 weken,
  punten per week, je eigenschappen, en per groep hoeveel activiteiten je al
  deed. Met het logboek eronder.
- **Loggen**: bijna tachtig activiteiten in negen groepen. Je zoekt, kiest de
  datum en schrijft er een notitie bij.
- **Symbolen**: grote dingen die je één keer bereikt.
- **Strategie**: waarom deze activiteiten helpen.
- **Gegevens**: bewaren als bestand, terugzetten en opnieuw beginnen.

HTML, CSS en JavaScript. Geen build, geen afhankelijkheden, niets van buiten.

## Opbouw

```
index.html                de app, en de losse pagina eromheen
index.php                 binnen een site: geeft alleen het artikel uit index.html door
app.css                   de opmaak, alleen op tokens, alles onder #aanzien
standalone.css            de tokens voor licht en donker, en een basis voor de losse pagina
app.js                    de app: rekenen, tonen, loggen, bewaren
gegevens.js               rangen, eigenschappen, activiteiten, statussymbolen en startvragen
wijzigingen/versies.js    de versies, de nieuwste bovenaan; de bovenste is de versie die draait
sw.js                     laat de losse pagina ook zonder internet werken
manifest.webmanifest      voor op het beginscherm
iconen/                   de kroon, als svg en als png
.github/                  de Action en het script die de app naar Codeberg zetten
```

## Versies

De app heeft één versienummer, zoals 2.0.1. De voettekst noemt het, met een link
naar de pagina met wijzigingen.

- Het eerste cijfer gaat omhoog bij een compleet nieuw ontwerp, zoals van 2.0.1
  naar 3.0.
- Het tweede cijfer gaat omhoog bij een groot nieuw onderdeel, zoals van 2.0.1
  naar 2.1. Het derde cijfer begint dan weer bij 0, maar dat laat je weg.
- Het derde cijfer gaat omhoog bij elke andere wijziging, zoals van 2.1 naar
  2.1.1.

Na elke wijziging zet je bovenaan `wijzigingen/versies.js` een nieuwe versie,
met de datum en in een paar korte zinnen wat er veranderd is. Meer hoeft niet:
de voettekst en de pagina met wijzigingen lezen het daar.

## Draaien

Zet de map op een webserver en open `index.html`. Een module laadt niet vanaf
`file:`, dus lokaal: `python3 -m http.server` in de map, en dan
`http://localhost:8000/`.

GitHub Pages doet hetzelfde. Zet het één keer aan onder Settings, Pages: Deploy
from a branch, `main`, map `/ (root)`.

### Binnen een site

De map kan ook in een site staan, zoals op hayobethlehem.nl. De parser van de
site sluit dan `index.php` in. Dat geeft alleen het artikel `#aanzien` uit
`index.html` door, met `app.css` en `app.js` erbij. De site zet er kop, menu en
opmaak omheen. Wordt `index.php` zelf opgevraagd, dan levert het gewoon
`index.html`. Zo is `index.html` de enige bron van de inhoud.

Binnen een site registreert de app geen service worker. Dat doet hij alleen als
losse pagina, met het manifest in de kop.

De code is in deze repo en in de site gelijk. Deze repo is de bron. Na elke
push naar `main` zet de GitHub Action `naar-codeberg.yml` de map ook in de repo
van de site op Codeberg, met `git subtree`. Het werk zelf doet
`.github/naar-codeberg.sh`, dat ook lokaal draait. Zo zet je het aan:

1. Maak op Codeberg een token met schrijfrechten op repositories, onder
   Instellingen, Applicaties. Het token van de Cisomatic kan ook.
2. Zet dat op GitHub onder Settings, Secrets and variables, Actions, als geheim
   `CODEBERG_TOKEN`.
3. Optioneel, als variabelen op dezelfde plek: `CODEBERG_REPO` (standaard
   `hayo/codeberg-hayobethlehem.nl`), `CODEBERG_PAD` (standaard
   `hb2025/content/forge/status-tracker`), `CODEBERG_TAK` (standaard de
   standaardbranch) en `CODEBERG_GEBRUIKER`, als de repo bij een organisatie
   hoort. Zonder het geheim slaat de Action zichzelf over.
4. Start de Action één keer met de hand, onder Actions, met "eerste keer" aan.
   Die zet de map op de site neer als subtree. Wat al in die map stond, valt
   weg.

Daarna gaat het vanzelf. Pas je op de site toch iets aan in de map, stuur het
dan terug met `git subtree push --prefix=<map> <deze repo> <branch>`, en maak
een pull request. Anders botst de volgende update.

## Activiteiten en symbolen

Alles staat in `gegevens.js`. Alleen gegevens, geen code.

| Wat | Velden |
| --- | --- |
| `RANGEN` | `min` (punten vanaf), `naam`, `uitleg` |
| `EIGENSCHAPPEN` | sleutel => naam. `EIGENSCHAP_MAX` is het aantal punten waarbij de balk vol is |
| `CATEGORIEEN` | `id`, `naam`, en `activiteiten` als `[id, naam, punten, eigenschap]` |
| `SYMBOLEN` | `id`, `punten`, `naam`, `eigenschap` |
| `STARTVRAGEN` | `id`, `vraag`, `eigenschap`, `deel` (welk deel van de punten naar de eigenschap gaat), en `antwoorden` als `[tekst, punten]` |

Een nieuwe activiteit krijgt een nieuw id, zoals `a12`. Verander nooit een
bestaand id: het logboek verwijst ernaar. Een nieuwe groep verschijnt vanzelf,
ook op de statuspagina.

## Je gegevens

Alles staat in `localStorage` van de browser, onder `wassenaar_renown`, als
`{ versie: 2, logboek: [...] }`. Er gaat niets naar een server.

Punten, eigenschappen en behaalde symbolen rekent de app steeds uit het
logboek. Haal je een regel weg, dan klopt alles meteen weer. Regels met
`start: true`, zoals de startvragen, tellen niet mee in de kalender, de weken
en de reeks.

"Bewaar als bestand" geeft het logboek als JSON. "Zet een bestand terug" leest
dat weer in, en ook de gegevens van versie 1 (`points`, `history`,
`milestones`, `skills`). Versie 1 bewaarde maar 50 regels. Wat daar niet in
past, komt in één regel "Eerdere stand overgenomen".

Notities en namen komen altijd als tekst op de pagina, nooit als HTML.

## Opmaak

`app.css` gebruikt alleen tokens, met dezelfde namen als de Cisomatic: `--ink`,
`--ink-hover`, `--on-ink`, `--pill-bg`, `--pill-bg-hover`, `--pill-ink`,
`--line`, `--line-soft`, `--panel`, `--page`, `--text`, `--muted`,
`--muted-soft`, `--link`, `--radius`, `--font-ui` en `--ui-lg`, `--ui-md`,
`--ui-sm`. Daarbij `--font-kop` voor de koppen; zonder die token erven ze de
letter van de site. Los definieert `standalone.css` ze, voor licht en donker, in
de kleuren van Wassenaar: groen, goud en crème. Binnen een site doet de site
dat.

Het goud, het rood en de stappen van de kalender mengt `app.css` met
`color-mix()` uit die tokens. Zo kloppen ze in licht en donker, en met elke
site.

Alles hangt onder `#aanzien`, en elk id begint met `az-`. Binnen een site botst
dan niets. De iconen zijn een lijn van gelijke dikte met ronde uiteinden en één
kleur, in een sprite boven in het artikel. Alleen de kroon is gevuld.

De pagina heeft een Content Security Policy die geen inline script of stijl
toestaat. Daarom staat er geen `onclick` of `style` in de opmaak, ook niet vanuit
het script: balken zijn `<meter>` en `<progress>`, grafieken SVG.

## Toegankelijkheid

Keuzegroepen zijn een `fieldset` met `legend`, velden hebben een `label` met
`for`. Het menu zegt met `aria-current` waar je bent; bij een andere pagina
krijgt de kop de focus. Meldingen zijn een `role="status"`. De kalender en de
weken zijn een `role="img"` met een titel, en staan ook als tabel onder "Toon
als tabel". Vensters zijn een `<dialog>`.

## Controleren

Elke wijziging gaat zonder fouten door de W3C Nu HTML Checker (`vnu`, ook met
`--css`), `html-validate` (recommended), `stylelint-config-standard`, ESLint
(recommended, met `eqeqeq`) en axe-core (WCAG 2.2 AA, in licht en donker). `vnu`
op `file:` geeft meldingen over de CSP; die horen bij `file:`.
