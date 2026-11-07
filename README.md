# Wassenaar Aanzien

Een kleine game: je levelt je karakter op in de Wassenaarse samenleving. Je logt
wat je doet, verdient prestigepunten (PR) en XP, en stijgt van Voorbijganger tot
Ereburger.

Demo: https://hayobethlehem.nl/forge/status-tracker en
https://hayo.github.io/status-tracker/

- **Status**: je karakter met rang en niveau, de XP-balk naar de volgende rang,
  de rangladder, je skills met elk een eigen niveau, je statussymbolen als
  trofeeën, recente activiteiten, een kalender van 17 weken, punten per week en
  de terreinen die je al verkend hebt.
- **Log activiteit**: bijna tachtig activiteiten in negen terreinen. Je zoekt,
  kiest de datum en geeft extra context. Ernaast claim je statussymbolen.
- **Strategie**: het strategieboek, waarom deze activiteiten helpen.
- **Gegevens**: je savegame bewaren, laden, of een nieuw spel beginnen.

HTML, CSS en JavaScript. Geen build, geen afhankelijkheden, niets van buiten:
de letters en iconen staan in de repo.

## Opbouw

```
index.html                de app, en de losse pagina eromheen
index.php                 binnen een site: geeft alleen het artikel uit index.html door
app.css                   de opmaak, alles onder #aanzien
standalone.css            de achtergrond en de groene balk van de losse pagina
app.js                    de app: rekenen, tonen, loggen, bewaren
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
| `RANGEN` | `min` (punten vanaf), `naam`, `uitleg`, `icoon` |
| `EIGENSCHAPPEN` | sleutel => `naam` en `icoon`. `EIGENSCHAP_MAX` is het aantal punten waarbij de balk vol is |
| `CATEGORIEEN` | `id`, `naam`, `icoon`, `kleur`, en `activiteiten` als `[id, naam, punten, eigenschap]` |
| `SYMBOLEN` | `id`, `punten`, `naam`, `icoon`, `eigenschap` |
| `STARTVRAGEN` | `id`, `vraag`, `eigenschap`, `deel` (welk deel van de punten naar de eigenschap gaat), en `antwoorden` als `[tekst, punten]` |

Een nieuwe activiteit krijgt een nieuw id, zoals `a12`. Verander nooit een
bestaand id: het logboek verwijst ernaar. Een nieuw terrein verschijnt vanzelf,
ook op de statuspagina. Een activiteit van 100 PR of meer krijgt een gekleurde
rand.

Een `icoon` is de naam van een icoon uit Font Awesome Free (solid), zoals
`mug-hot`. Het moet in de sprite boven in `index.html` staan, als
`<symbol id="az-i-mug-hot">`. Een nieuw icoon neem je over uit
`svgs/solid/<naam>.svg` van het npm-pakket `@fortawesome/fontawesome-free`: de
`viewBox` en het pad. Een `kleur` is een van `teal`, `blauw`, `rood`, `navy`,
`paars`, `groen`, `oranje`, `amber` of `goud`.

Een skill telt tot `EIGENSCHAP_MAX` punten: dat is 100 / 100. Elke 10 is een
niveau. De rang van je karakter is ook zijn niveau: Voorbijganger is niveau 1.

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
