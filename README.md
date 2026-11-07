# Wassenaar Aanzien

Een kleine game: je levelt je karakter op in de Wassenaarse samenleving. Je logt
wat je doet, verdient prestigepunten (PR) en XP, en stijgt van Voorbijganger tot
Ereburger.

Demo: https://hayobethlehem.nl/forge/status-tracker en
https://hayo.github.io/status-tracker/

De startpagina (`index.html`) legt uit hoe het spel werkt. De knop "Open de
tool" opent de tool zelf (`app.html`).

- **Status**: je karakter met rang en niveau, de XP-balk naar de volgende rang,
  de rangladder, je skills met elk een eigen niveau, je statussymbolen als
  trofeeën, recente activiteiten, een kalender van 17 weken, punten per week en
  de terreinen die je al verkend hebt.
- **Log activiteit**: bijna tachtig activiteiten in negen terreinen. Je zoekt,
  kiest de datum en geeft extra context. Ernaast claim je statussymbolen.
- **Erelijst**: je pad, je titels, alle prestaties, je jaaroverzicht en New
  Game+.
- **Strategie**: het strategieboek, waarom deze activiteiten helpen.
- **Gegevens**: je savegame bewaren, laden, of een nieuw spel beginnen.

HTML, CSS en JavaScript, en één PHP-bestand voor de opslag op de server. Geen
build, geen afhankelijkheden, niets van buiten: de letters en iconen staan in de
repo.

## Opbouw

```
index.html                de landingspagina: wat het is en hoe het werkt, met een knop naar de tool
landing.css               de opmaak van de landingspagina, bovenop app.css
app.html                  de tool, en de losse pagina eromheen
index.php                 binnen een site: geeft alleen het artikel uit app.html door
app.css                   de opmaak, alles onder #aanzien
standalone.css            de achtergrond en de groene balk van de losse pagina
app.js                    de app: tonen, loggen, bewaren
spel.js                   de spelregels: rang, bonussen, prestaties, missies, verval, jaaroverzicht, samenvoegen
opslag.js                 de opslag op de server: synccode, versleutelen, lezen en schrijven
opslag.php                de server: bewaart versleutelde voortgang per speler
bewaard/                  de standaardmap voor opslag.php, buiten git
gegevens.js               rangen, eigenschappen, activiteiten, statussymbolen en startvragen
wijzigingen/versies.js    de versies, de nieuwste bovenaan; de bovenste is de versie die draait
sw.js                     laat de losse pagina ook zonder internet werken
manifest.webmanifest      voor op het beginscherm
iconen/                   de kroon, als svg en als png
letters/                  Inter en Playfair Display, met hun licentie
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

Zet de map op een webserver en open `index.html`, of meteen `app.html`. Een
module laadt niet vanaf `file:`, dus lokaal: `python3 -m http.server` in de map,
en dan `http://localhost:8000/`.

GitHub Pages doet hetzelfde. Zet het één keer aan onder Settings, Pages: Deploy
from a branch, `main`, map `/ (root)`.

### Binnen een site

De map kan ook in een site staan, zoals op hayobethlehem.nl. De parser van de
site sluit dan `index.php` in. Dat geeft de tool door: alleen het artikel
`#aanzien` uit `app.html`, met `app.css` en `app.js` erbij. De site zet er kop en
menu omheen. Wordt `index.php` zelf opgevraagd, dan levert het de
landingspagina, `index.html`. Zo is `app.html` de enige bron van de tool.

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
| `RANGEN` | `min` (punten vanaf), `dagen` (tijd in het spel), `ritueel` (`tekst` en `voorwaarde`), `naam`, `uitleg`, `icoon` |
| `EIGENSCHAPPEN` | sleutel => `naam` en `icoon`. `EIGENSCHAP_MAX` is het aantal punten waarbij de balk vol is |
| `CATEGORIEEN` | `id`, `naam`, `icoon`, `kleur`, en `activiteiten` als `[id, naam, punten, eigenschap, kenmerken?]` |
| `SYMBOLEN` | `id`, `punten`, `naam`, `icoon`, `stijl?` (`opzichtig` of `ingetogen`), `eigenschap` |
| `ROLLEN` | de rollen voor het netwerk |
| `NATIONALE_DAGEN` | `[land, MM-DD]` |
| `QUIZ` | `id`, `vraag`, `antwoorden`, `goed` (index), `uitleg` |
| `PLEKKEN` | `id`, `naam`, `icoon`: de dorpskaart |
| `BUURTEN` | de buurten die je bij het loggen kiest |
| `DOSSIERS` | `id`, `naam`, `icoon`; met `DOSSIER_STAPPEN` en `DOSSIER_BELONING` |
| `STARTVRAGEN` | `id`, `vraag`, `eigenschap`, `deel` (welk deel van de punten naar de eigenschap gaat), en `antwoorden` als `[tekst, punten]` |

De kenmerken van een activiteit: `uitnodiging` (je werd uitgenodigd), `tegen` (je
nodigde zelf uit), `bedank` (vraagt om een bedankje) en `nationaal` (extra XP rond
een nationale dag), `plek` (een id uit `PLEKKEN`), `dossierstap` (1 tot 4) en
`stil` (nooit een bonus, zoals bij de Dodenherdenking).

Een nieuwe activiteit krijgt een nieuw id, zoals `a24`. Een nieuwe plek op de
dorpskaart: zet hem in `PLEKKEN` en geef een of meer activiteiten die `plek`.
Verhoog dan ook het aantal bij de prestatie Kenner van het dorp (`p_kenner`). Verander nooit een
bestaand id: het logboek verwijst ernaar. Een nieuw terrein verschijnt vanzelf,
ook op de statuspagina. Een activiteit van 100 PR of meer krijgt een gekleurde
rand.

Een `icoon` is de naam van een icoon uit Font Awesome Free (solid), zoals
`mug-hot`. Het moet in de sprite boven in `app.html` staan, als
`<symbol id="az-i-mug-hot">`. Een nieuw icoon neem je over uit
`svgs/solid/<naam>.svg` van het npm-pakket `@fortawesome/fontawesome-free`: de
`viewBox` en het pad. Een `kleur` is een van `teal`, `blauw`, `rood`, `navy`,
`paars`, `groen`, `oranje`, `amber`, `goud` of `zilver`.

Een skill telt tot `EIGENSCHAP_MAX` punten: dat is 100 / 100. Elke 10 is een
niveau. De rang van je karakter is ook zijn niveau: Voorbijganger is niveau 1.

### De landingspagina

De landingspagina is gewone HTML, zonder script. Ze noemt een paar aantallen
(123 activiteiten, 7 rangen, 34 prestaties, elf terreinen, 21 plekken) en de rangen en terreinen. Verander
je die in `gegevens.js`, pas dan ook `index.html` aan. De iconen staan in een
eigen sprite boven in `index.html`.

## Spelregels

De regels staan in `spel.js`, de getallen en teksten in `gegevens.js`.

- **Rang en niveau.** Een rang vraagt drie dingen: genoeg PR (`min`), genoeg
  dagen sinds het begin van deze ronde (`dagen`), en een `ritueel`, zoals lid
  worden van een club. Zo werkt het ook in een dorp: je koopt je niet in
  (Elias en Scotson), en je stapt over via een overgangsmoment (Van Gennep).
  De statuspagina toont wat er nog moet. Voorbijganger is niveau 1, Ereburger
  niveau 7.
- **Skills.** Elke activiteit telt mee voor één skill. `EIGENSCHAP_MAX` punten is
  100 / 100; elke tiende daarvan is een niveau.
- **Bonussen.** Op een activiteit, niet op een statussymbool. Ze vermenigvuldigen:
  - reeks: `REEKS_STAP` per week op rij actief vóór de week van de activiteit,
    tot `REEKS_MAX`;
  - event: de `factor` van een event in `EVENTS`, op de datum van de activiteit;
  - pad: `1 + PAD_BONUS` op de terreinen van je pad;
  - nationale dag: `NATIONAAL_BONUS` op een activiteit met `nationaal`, tot
    `NATIONAAL_MARGE` dagen van een dag in `NATIONALE_DAGEN`;
  - wederkerigheid: `WEDERKERIG_BONUS` op een activiteit met `tegen`, als er een
    uitnodiging open staat van minder dan `WEDERKERIG_WEKEN` weken;
  - op tijd bedankt: `BEDANK_BONUS` op een bedankje binnen `BEDANK_DAGEN` dagen;
  - nieuwe brug: `NIEUWE_BRUG` als je iemand noemt in een rol die nog niet in je
    netwerk zat;
  - verzadigd: `VERZADIGD_FACTOR` als je dezelfde activiteit die week al
    `VERZADIGD_NA` keer deed.

  Op een statussymbool telt alleen de stijl: opzichtig levert `OPZICHTIG.factor`
  op met minder dan `OPZICHTIG.onder` sociale discretie, ingetogen
  `INGETOGEN.factor` vanaf `INGETOGEN.vanaf`.

  De regel in het logboek bewaart de punten mét bonus, de `basis` en de
  `bonussen` als tekst. Later van pad wisselen verandert dus niets aan wat je al
  logde.
- **Pad.** Vanaf rang `PAD_VANAF` kies je een pad uit `PADEN`. Wisselen mag.
- **Prestaties en titels.** `PRESTATIES` en `TITELS` hebben een `voorwaarde`. Welke
  soorten er zijn, staat boven `PRESTATIES` in `gegevens.js`. Ze worden steeds
  uit het logboek berekend, dus niet bewaard. Haal je een activiteit weg, dan kan
  een prestatie weer dichtgaan. Een prestatie met `geheim: true` toont zijn naam
  pas als je hem hebt.
- **Weekmissies.** Elke week drie uit `MISSIES`, gekozen uit het weeknummer. Zo
  zijn ze de hele week gelijk. Een voltooide missie geeft één keer een regel
  "Weekmissie" in het logboek, met de `beloning`. "Doe iets in een terrein waar je
  nog niets deed" valt weg als je alle terreinen al verkend had.
- **Beloningen.** Na elke actie vergelijkt de app wat je had met wat je nu hebt:
  rang, skill-niveaus, prestaties, titels en missies. Is er iets bij, dan toont
  hij het beloningsvenster.
- **Uitrusting.** Je acht duurste statussymbolen hangen rond je avatar.
- **Netwerk.** Bij het loggen vul je optioneel in met wie je was: initialen of een
  bijnaam, en een rol uit `ROLLEN`. Nooit een volledige naam. De Erelijst toont
  je mensen, je rollen en je hechte banden (`HECHT_VANAF` keer gezien), tegen
  het getal van Dunbar (`DUNBAR`).
- **Sociale verplichtingen.** Elke uitnodiging staat open tot een
  tegenuitnodiging (de oudste eerst). Na een activiteit met `bedank` vraagt het
  spel om een bedankje; de knop "Gedaan" logt het, gekoppeld via `voor`.
- **Roddel.** Bij je eerste actie van een week oordeelt het dorp één keer over je
  vorige week (`RODDEL`): blaam als een uitnodiging net te laat is, als je
  pronkte met een opzichtig symbool zonder discretie, of als je twee bedankjes
  vergat; lof bij drie activiteiten in twee terreinen. Het wordt een regel in het
  logboek, met `roddel` en de PR.
- **Kapitaal.** Naar Bourdieu: economisch (financiële slagkracht), cultureel,
  sociaal (maatschappelijke invloed plus discretie) en symbolisch (de PR van je
  statussymbolen).
- **Dorpskaart.** Een activiteit met een `plek` die je nog nooit logde, geeft
  `ONTDEKKING_BONUS`. De Erelijst toont welke plekken je ontdekte.
- **Buurten.** Bij het loggen kies je optioneel een buurt uit `BUURTEN`. De
  Erelijst telt per buurt.
- **Dossiers.** De vier activiteiten met `dossierstap` vragen welk dossier. Heb
  je in een dossier alle vier de stappen gedaan, dan komt er één keer een regel
  "Dossier afgerond" met `DOSSIER_BELONING`, met `dossierAf`.
- **Stil.** Een activiteit met `stil` krijgt nooit een bonus: een herdenking is
  geen wedstrijd.
- **Etiquettequiz.** Onder Strategie. Elk goed antwoord geeft één keer
  `QUIZ_PUNTEN`, als een regel met `quiz`.
- **Vergeten worden.** Staat uit, tenzij je het aanzet onder Gegevens. Na
  `VERGETEN_NA` weken zonder iets te loggen zakt je PR met `VERGETEN_PER_WEEK` per
  week, tot `VERGETEN_MAX`. Het wordt niet bewaard, maar steeds berekend: log je
  weer iets, dan is het verval weg.
- **New Game+.** Als Ereburger begin je opnieuw. `ronde` gaat omhoog; je PR telt
  alleen de regels van de huidige ronde. Skills, prestaties, titels en het
  logboek blijven. Elke ronde geeft een ster op je avatar.
- **Jaaroverzicht.** Per jaar uit het logboek: PR, activiteiten, beste maand,
  favorieten, langste reeks en hoe ver je rang steeg.

De data van de events zijn bij benadering. Pas ze aan in `EVENTS`. Controleer ook
de buurtnamen in `BUURTEN`; Zuid en Maaldrift zijn niet bevestigd.

## Je gegevens

Alles staat in `localStorage` van de browser, onder `wassenaar_renown`, als
`{ versie: 3, logboek: [...], ronde, titel, pad, vergeten, generatie, bijgewerkt,
verwijderd }`. Gegevens van versie 1 en 2 zet de app vanzelf om. Wie wil, bewaart
het ook op de server; zie Opslag op de server.

Punten, eigenschappen en behaalde symbolen rekent de app steeds uit het
logboek. Haal je een regel weg, dan klopt alles meteen weer. Regels met
`start: true`, zoals de startvragen en het begin van een New Game+, tellen niet
mee in de kalender, de weken, de reeks en het jaaroverzicht.

"Bewaar als bestand" geeft het logboek als JSON. "Zet een bestand terug" leest
dat weer in, en ook de gegevens van versie 1 (`points`, `history`,
`milestones`, `skills`). Versie 1 bewaarde maar 50 regels. Wat daar niet in
past, komt in één regel "Eerdere stand overgenomen".

Notities en namen komen altijd als tekst op de pagina, nooit als HTML.

## Opslag op de server

Wie op meer apparaten speelt, zet onder Gegevens "Bewaar op de server" aan. Dat
staat standaard uit.

- **Synccode.** De app maakt een code van 26 tekens (130 bits, zonder O, 0, I en
  1). Op een ander apparaat vul je die in, onder Gegevens of meteen op het
  startscherm. De code staat apart in `localStorage`, onder
  `wassenaar_renown_sync`, en dus niet in een savegame.
- **Versleuteld.** `opslag.js` maakt uit de code een id (SHA-256) en een sleutel
  (HKDF). De voortgang gaat met AES-GCM versleuteld naar de server, onder dat id.
  De server ziet de code en de voortgang nooit. Kwijt is dus ook echt kwijt.
- **Bijwerken.** Na elke wijziging stuurt de app na anderhalve seconde de nieuwe
  stand, met de revisie waarop hij voortbouwt. Had een ander apparaat intussen
  iets bewaard, dan antwoordt de server met 409 en wat er nu staat. De app voegt
  dan samen (`samenvoegen` in `spel.js`) en probeert het opnieuw. Bij openen, bij
  terugkomen in de app en als het netwerk terug is, haalt de app op.
- **Samenvoegen.** De logboeken komen samen. Wat ergens is weggehaald, staat in
  `verwijderd` en blijft weg. Een weekmissie telt één keer. Na "Wis alles" of het
  laden van een savegame heeft het spel een nieuwe `generatie`; dan wint de
  nieuwste versie helemaal.
- **Wissen.** "Wis van de server" haalt het bestand weg. "Wis alles" doet dat ook.

### opslag.php

Eén POST met JSON: `{ actie: "lees" | "schrijf" | "wis", id, revisie?, data? }`.
Het bestand staat naast de app en komt via de Action ook op de site.

- **Waar.** In de map uit de omgevingsvariabele `AANZIEN_OPSLAG`, anders in
  `bewaard/` naast `opslag.php`. Zet `AANZIEN_OPSLAG` op een map buiten de map
  die bij een update van de site wordt overschreven, en buiten de documentroot.
  `bewaard/` heeft een `.htaccess` die alles weigert (Apache), en een
  `.gitignore`, zodat de bestanden nooit in git komen.
- **Wie.** De app op GitHub Pages praat met
  `https://hayobethlehem.nl/forge/status-tracker/opslag.php` (bovenaan
  `opslag.js`). Daarvoor staat CORS open voor de sites in `AANZIEN_HERKOMST`,
  standaard `https://hayo.github.io` en `https://hayobethlehem.nl`. De CSP van
  `app.html` staat `connect-src` naar hayobethlehem.nl toe.
- **Grenzen.** Hoogstens 700.000 tekens per speler en 2.000 spelers, tegen
  misbruik als gratis opslag. Een slot per speler voorkomt dat twee apparaten
  tegelijk schrijven.
- **Privacy.** De server bewaart alleen versleutelde data, een revisie en een
  tijdstip. Zoals elke webserver logt hij wel IP-adressen. De beheerder is Hayo
  Bethlehem; dat staat ook in de app, onder Gegevens.

## Opmaak

Een karakterblad in de kleuren van Wassenaar: groen `#2a4d3e`, goud `#d4af37`,
navy `#1b263b` en crème `#f9f6f0`. Koppen in Playfair Display, de rest in
Inter. De kleuren staan als custom properties op `#aanzien` in `app.css`. Elk
terrein heeft een kleur (`cat-teal` en zo) en elke skill ook (`skill-civic` en
zo); die zetten `--cat` en `--cat-licht`.

Alles hangt onder `#aanzien`, en elk id begint met `az-`. Binnen een site botst
dan niets. De app neemt zijn eigen kleuren en letters mee, ook binnen een site.
`standalone.css` geeft alleen de losse pagina een achtergrond, en zet de groene
balk over de hele breedte bovenaan vast.

De pagina heeft een Content Security Policy die geen inline script of stijl
toestaat. Daarom staat er geen `onclick` of `style` in de opmaak, ook niet vanuit
het script: balken zijn `<meter>` en `<progress>`, grafieken SVG.

Animaties (de glans op de XP-balk, het niveauvenster) staan uit bij
`prefers-reduced-motion`.

### Licenties

- Iconen: [Font Awesome Free](https://fontawesome.com) 7.3.1, CC BY 4.0.
- Letters: Inter en Playfair Display, SIL Open Font License 1.1. De licenties
  staan in `letters/`.

## Toegankelijkheid

Keuzegroepen zijn een `fieldset` met `legend`, velden hebben een `label` met
`for`. Het menu zegt met `aria-current` waar je bent; bij een andere pagina
krijgt de kop de focus. Meldingen zijn een `role="status"`. De kalender en de
weken zijn een `role="img"` met een titel, en staan ook als tabel onder "Toon
als tabel". Vensters zijn een `<dialog>`.

## Controleren

Elke wijziging gaat zonder fouten door de W3C Nu HTML Checker (`vnu`, ook met
`--css`), `html-validate` (recommended), `stylelint-config-standard`, ESLint
(recommended, met `eqeqeq`) en axe-core (WCAG 2.2 AA). `vnu`
op `file:` geeft meldingen over de CSP; die horen bij `file:`.
