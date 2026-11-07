# Wassenaar Aanzien — afspraken en learnings

Lees dit aan het begin van elke sessie. Voeg nieuwe learnings onderaan toe.

## Afspraken

- Geen vermelding van AI-hulp, nergens: geen `Co-Authored-By`, geen sessielinks, geen "generated with" in commits, PR's, code of documentatie.
- Commits op naam van `Hayo Bethlehem <mail@hayobethlehem.nl>` (zet `git config user.name/user.email` in de clone).
- Ook dit bestand niet bij naam noemen in code, README of commitberichten. Controleer voor elke push: `git grep -niE 'claude|anthropic' -- . ':!CLAUDE.md'` moet leeg zijn, en lees het commitbericht na.
- Teksten in app en README: Nederlands, taalniveau B1.
- Na elke wijziging een nieuwe versie bovenaan `VERSIES` in `gegevens.js`, in dezelfde commit, en hetzelfde nummer in `VERSIE` in `sw.js`. Nieuw ontwerp = hoofdversie (2.0 → 3.0). Groot nieuw onderdeel = .x (2.0 → 2.1). Al het andere = .x.x (2.1 → 2.1.1). Wijzigingen kort, in B1, voor de gebruiker.
- Code compact houden: geen herhaling, korte helpers, alleen commentaar dat iets uitlegt wat de code niet zegt. Achtergrond en learnings horen in dit bestand.
- HTML, CSS en JavaScript volgen de standaarden en zijn semantisch correct. Elke wijziging moet zonder fouten door: W3C Nu HTML Checker (`vnu`, ook met `--css` en `--also-check-svg`), `html-validate` (recommended), `stylelint-config-standard`, ESLint (recommended, `eqeqeq`) en axe-core (WCAG 2.2 AA + best practices).
- Geen externe bronnen: geen CDN, geen Google Fonts. De CSP staat op `'self'`. Iconen zijn een SVG-sprite in `index.html`.
- CSS-klassen in kebab-case (geen BEM `--`). Iconen krijgen een eigen klasse; geen selectors op `svg`. Geen inline styles, ook niet via JS: balken zijn `<meter>`/`<progress>`, grafieken SVG met attributen.
- Tikvlakken minimaal 44 px. Werkt op telefoon (menu onderaan onder 46rem) en desktop.
- De repo is public. Daarom `robots: noindex`. Er staan geen persoonlijke gegevens in de repo; het logboek staat alleen in localStorage.

## Huisstijl

- Kroon als logo (`#i-kroon` in de sprite, `iconen/kroon.svg`, PNG's 180/192/512 daaruit gemaakt).
- Groen `#2a4d3e` (kop, staven, knoppen), goud `#d4af37` alleen decoratief (kroon, rang-accent, voortgangsbalk). Goud als tekst is `#7d6011` (contrast). Achtergrond crème `#f9f6f0`, witte kaarten (radius 16 px, zachte schaduw). Kleuren als custom properties in `:root` van `app.css`.
- Koppen in een systeem-serif (Iowan/Palatino/Georgia), de rest `system-ui`. Grote cijfers in de sans.
- Kalender: één groene reeks in 5 stappen (`--stap-0` t/m `--stap-4`), grenzen in `KALENDER_STAPPEN` in `app.js`.

## Opzet

- GitHub Pages vanaf `main`, map `/ (root)`, `.nojekyll` aanwezig. Geen buildstap.
- Bestanden: `index.html`, `app.css`, `app.js` (module), `gegevens.js` (alleen data), `sw.js`, `manifest.webmanifest`, `iconen/`.
- Routing via de hash (`#status`, `#loggen`, `#symbolen`, `#strategie`, `#gegevens`, `#wijzigingen`). Zonder gegevens altijd `#start`.
- Opslag: localStorage-sleutel `wassenaar_renown` (zo heette hij in versie 1). Formaat `{ versie: 2, logboek: [...] }`. Elke regel: `id`, `datum` (JJJJ-MM-DD, lokale tijd), `tijd`, `naam`, `punten`, `eigenschappen` ({ sleutel: punten }), en `activiteit` of `symbolen`, optioneel `notitie` en `start`.
- Punten, eigenschappen en behaalde symbolen worden altijd uit het logboek berekend. Daardoor werkt weghalen uit het logboek vanzelf.
- Regels met `start: true` (startvragen, overgenomen stand) tellen niet mee in kalender, weken, reeks en "Activiteiten gelogd".
- `leesIn` zet ook het formaat van versie 1 om (`points`, `history`, `milestones`, `skills`). Versie 1 bewaarde maar 50 regels; het verschil in punten, de eigenschappen en de symbolen komen in één regel "Eerdere stand overgenomen".
- Een id van een activiteit of symbool nooit veranderen: het logboek verwijst ernaar. Ids van symbolen uit versie 1 (`m_news` enz.) zijn behouden.
- De service worker is cache-first. Nieuwe bestanden komen pas binnen als `VERSIE` in `sw.js` omhoog gaat.

## Learnings

- Tekst uit het logboek (notities, namen uit een teruggezet bestand) altijd via `textContent`, nooit via `innerHTML`. `maak()` doet dat.
- Een gekozen naam met een apostrof brak in versie 1 de inline `onclick`. Daarom geen inline handlers meer.
- Het `close`-event van `<dialog>` komt asynchroon. Wacht in tests even na een klik op Opslaan.
- `vnu` op `file:` geeft CSP-meldingen (info) voor `app.css` en `app.js`. Dat is een bijeffect van `file:`; negeer ze.
- `vnu` en `html-validate` ook op de gerenderde DOM draaien. `outerHTML` schrijft booleans als `required=""`; zet daarvoor `attribute-boolean-style` en `attribute-empty-style` uit. Maak de DOM-kopie in een schone pagina zonder axe: axe laat `style=""` achter.
- axe-core injecteren in Playwright botst met de CSP. Gebruik `bypassCSP: true` in de testcontext.
- `no-descending-specificity` in stylelint: geef elementen liever een eigen klasse (`.pijler`) dan een nieuwe nakomeling-selector.
- In een smalle rangladder breken lange namen ("Geïntroduceerde") midden in het woord. Daarom op mobiel `auto-fill` met kolommen van minimaal 6.5rem.

## Testen

- Validatie: alle vijf de controles hierboven zonder fouten (bron én gerenderde DOM).
- Getest in Chromium met Playwright (desktop en iPhone 13): startvragen, rang omhoog met venster, zoeken, loggen met notitie en datum, statussymbool, weghalen, bewaren als bestand, terugzetten, omzetten van versie 1-gegevens, geen horizontaal scrollen op mobiel, geen fouten in de console.
- Nog niet getest op een echte iPhone: op beginscherm zetten en offline starten.
