# Wassenaar Aanzien

## Geen verwijzingen naar Claude

Zet nergens een verwijzing naar Claude, Claude Code of Anthropic. Dat geldt voor
code, commentaar, documentatie, commitberichten en pull requests.

- Geen `Co-Authored-By`, geen `Claude-Session` en geen "Generated with Claude
  Code" in een commit of pull request.
- Claude is nooit de auteur of committer van een commit. Commit als
  `Hayo Bethlehem <mail@hayobethlehem.nl>`.

## Versie bijwerken

Zet na elke wijziging een nieuwe versie bovenaan `wijzigingen/versies.js`, in
dezelfde commit. Gaat de wijziging over Veldrang, dan bovenaan
`veldrang/versies.js`. Een wijziging aan de motor komt in beide. Een compleet nieuw ontwerp is een nieuwe hoofdversie (2.x naar
3.0). Een groot nieuw onderdeel is een .x-release (2.0 naar 2.1). Al het andere
is een .x.x-release (2.1 naar 2.1.1). Meer staat in README.md onder Versies.
Schrijf de wijzigingen kort, in B1-Nederlands, voor wie de app gebruikt.
