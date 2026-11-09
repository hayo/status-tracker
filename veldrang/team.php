<?php

/**
 * Een openbare teampagina op naam: /veldrang/team/delta-wolves (zie .htaccess), of team.php?naam=delta-wolves.
 *
 * Geeft team.html, met in de kop de titel, een omschrijving en de badge voor het voorbeeld in WhatsApp en
 * andere apps, en het id en de leessleutel voor teampagina.js. De rest doet de pagina zelf, net als bij
 * een link met #. Met ?badge geeft dit de badge van het team als plaatje. Zie ../openbaar.php.
 */

declare(strict_types=1);

require dirname(__DIR__) . '/openbaar.php';

(static function (): void {
    $slug = azSlug((string) ($_GET['naam'] ?? ''));
    $team = $slug === '' ? null : azOpenbaarTeam($slug);

    if (isset($_GET['badge'])) {
        $badge = $team['badge'] ?? null;
        $type = (string) ($badge['type'] ?? '');
        $bytes = is_string($badge['data'] ?? null) ? base64_decode($badge['data'], true) : false;
        if ($bytes === false || !preg_match('~^image/(png|jpeg|webp)$~', $type)) {
            http_response_code(404);
            return;
        }
        header('Content-Type: ' . $type);
        header('Cache-Control: public, max-age=3600');
        header('X-Content-Type-Options: nosniff');
        echo $bytes;
        return;
    }

    $e = static fn (string $t): string => htmlspecialchars($t, ENT_QUOTES | ENT_SUBSTITUTE);
    $html = (string) file_get_contents(__DIR__ . '/team.html');

    // De map van deze pagina, zodat ../app.css en de andere bestanden ook onder /team/<naam> kloppen.
    $map = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/veldrang/team.php'))), '/') . '/';
    $https = ($_SERVER['HTTPS'] ?? '') !== '' && ($_SERVER['HTTPS'] ?? '') !== 'off';
    $host = preg_match('/^[a-z0-9.-]+(:\d+)?$/i', (string) ($_SERVER['HTTP_HOST'] ?? '')) ? (string) $_SERVER['HTTP_HOST'] : 'hayobethlehem.nl';
    $site = ($https ? 'https' : 'http') . '://' . $host;

    $kop = ['<base href="' . $e($map) . '">'];
    if ($team === null) {
        http_response_code(404);
        $kop[] = '<meta name="az-team" content="">';
    } else {
        $titel = 'Team ' . $team['naam'] . ' · Veldrang';
        $omschrijving = trim((string) ($team['info']['omschrijving'] ?? ''));
        $waar = implode(', ', array_filter([trim((string) ($team['info']['thuisveld'] ?? '')), trim((string) ($team['info']['regio'] ?? ''))]));
        $tekst = $omschrijving !== '' ? $omschrijving
            : 'Het airsoftteam ' . $team['naam'] . ($waar !== '' ? ' uit ' . $waar : '') . ' op Veldrang: ranglijst, rangen, skills en kit.';
        $tekst = mb_substr((string) preg_replace('/\s+/', ' ', $tekst), 0, 200);
        $url = $site . $map . 'team/' . $slug;
        $html = str_replace('<title>Teampagina · Veldrang</title>', '<title>' . $e($titel) . '</title>', $html);
        $html = (string) preg_replace('~<meta name="description" content="[^"]*">~', '<meta name="description" content="' . $e($tekst) . '">', $html, 1);
        $kop = [...$kop,
            '<meta name="az-team" content="' . $e($team['id'] . '.' . $team['kijk']) . '">',
            '<link rel="canonical" href="' . $e($url) . '">',
            '<meta property="og:type" content="website">',
            '<meta property="og:site_name" content="Veldrang">',
            '<meta property="og:title" content="' . $e('Team ' . $team['naam']) . '">',
            '<meta property="og:description" content="' . $e($tekst) . '">',
            '<meta property="og:url" content="' . $e($url) . '">',
            '<meta property="og:image" content="' . $e($team['badge'] !== null
                ? $site . $map . 'team.php?naam=' . rawurlencode($slug) . '&badge=1'
                : $site . $map . 'iconen/icoon-512.png') . '">',
            '<meta name="twitter:card" content="summary">',
        ];
    }

    // Door <base> wijst href="#…" naar de map. Zet er het adres van deze pagina voor (zie icoon in ui.js).
    $hier = $e(strtok((string) ($_SERVER['REQUEST_URI'] ?? ''), '#') ?: $map . 'team.php');
    $html = str_replace('href="#', 'href="' . $hier . '#', $html);

    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache');
    echo str_replace('<meta charset="utf-8">', "<meta charset=\"utf-8\">\n  " . implode("\n  ", $kop), $html);
})();
