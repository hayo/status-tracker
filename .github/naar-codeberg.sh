#!/usr/bin/env bash
#
# Zet Wassenaar Aanzien in de repo van de site, met git subtree. Deze repo is de
# bron; de site krijgt de map in PAD. De workflow naar-codeberg.yml draait dit
# na elke push naar main, maar het werkt ook lokaal.
#
# - SITE_URL: de repo van de site, met een token om te mogen pushen
# - BRON_URL: deze repo
# - PAD: de map van de app in de site
# - TAK: de branch van de site; leeg is de standaardbranch
# - EERSTE_KEER: true vervangt de map één keer door een subtree. Wat in die map
#   alleen op de site stond, valt dan weg.

set -euo pipefail

: "${SITE_URL:?Geef SITE_URL mee.}"
: "${BRON_URL:?Geef BRON_URL mee.}"
PAD="${PAD:-hb2025/content/forge/status-tracker}"
TAK="${TAK:-}"
BRON_TAK="${BRON_TAK:-main}"
EERSTE_KEER="${EERSTE_KEER:-false}"

werkmap="$(mktemp -d)"
trap 'rm -rf "$werkmap"' EXIT

if ! git clone -q ${TAK:+--branch "$TAK"} "$SITE_URL" "$werkmap/site"; then
    echo "De site is niet op te halen. Klopt het token, en mag het lezen en schrijven in repositories?" >&2
    exit 1
fi
cd "$werkmap/site"
TAK="$(git symbolic-ref --short HEAD)"
git config user.name "Hayo Bethlehem"
git config user.email "mail@hayobethlehem.nl"

bericht="Wassenaar Aanzien bijgewerkt vanaf GitHub"

if git log -1 --format=%H --grep="^git-subtree-dir: $PAD/*\$" | grep -q .; then
    git subtree pull -q --prefix="$PAD" "$BRON_URL" "$BRON_TAK" --squash -m "$bericht"
elif [ "$EERSTE_KEER" = "true" ]; then
    if [ -e "$PAD" ]; then
        git rm -r -q "$PAD"
        git commit -q -m "Wassenaar Aanzien komt voortaan van GitHub"
    fi
    git subtree add -q --prefix="$PAD" "$BRON_URL" "$BRON_TAK" --squash -m "$bericht"
else
    # Geen fout: na een push naar main is dit de eerste keer nog niet gedaan.
    echo "In $PAD staat nog geen subtree, dus er gebeurt niets. Start de workflow één keer met 'eerste keer' aan." >&2
    exit 0
fi

if [ "$(git rev-parse HEAD)" = "$(git rev-parse "origin/$TAK")" ]; then
    echo "De site is al bij."
    exit 0
fi

git push -q origin "HEAD:$TAK"
echo "De site is bijgewerkt: $(git log -1 --format='%h %s')"
