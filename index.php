<?php

/**
 * De keuzepagina binnen een site, zoals op hayobethlehem.nl/content/forge/status-tracker.
 *
 * Los opgevraagd levert dit index.html. Binnen een site, via de parser, alleen het deel tussen de
 * markeringen in index.html, met keuze.css erbij. Wassenaar Aanzien staat in wassenaar/, Veldrang
 * in veldrang/; elk heeft een eigen index.php.
 */

declare(strict_types=1);

(static function (): void {
    $script = realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? ''));

    if ($script !== false && dirname($script) === realpath(__DIR__)) {
        readfile(__DIR__ . '/index.html');
        return;
    }

    $html = (string) file_get_contents(__DIR__ . '/index.html');

    $slash = static fn (string $p): string => str_replace('\\', '/', $p);
    $root = rtrim($slash((string) realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''))), '/');
    $bestand = $slash((string) realpath(__DIR__ . '/keuze.css'));
    if ($root === '' || $bestand === '' || !str_starts_with($bestand, $root . '/')) {
        throw new RuntimeException('De keuzepagina staat niet onder de documentroot.');
    }
    $css = htmlspecialchars(substr($bestand, strlen($root)) . '?v=' . filemtime($bestand), ENT_QUOTES);

    if (!preg_match('~<!-- begin inhoud[^>]*-->(.*)<!-- einde inhoud -->~s', $html, $deel)) {
        throw new RuntimeException('In index.html staat geen inhoud tussen de markeringen.');
    }

    echo '<link rel="stylesheet" href="', $css, '">', "\n", trim($deel[1]), "\n";
})();
