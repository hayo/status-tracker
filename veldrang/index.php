<?php

/**
 * Veldrang binnen een site, zoals op hayobethlehem.nl/forge.
 *
 * Los opgevraagd levert dit de landingspagina, index.html. Binnen een site, via de parser, de tool
 * zelf: alleen het artikel #aanzien uit app.html, met de opmaak en het script erbij. De opmaak van de
 * motor staat een map hoger (../app.css); thema.css legt de stijl van Veldrang eroverheen.
 */

declare(strict_types=1);

(static function (): void {
    $script = realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? ''));

    if ($script !== false && dirname($script) === realpath(__DIR__)) {
        readfile(__DIR__ . '/index.html');
        return;
    }

    $html = (string) file_get_contents(__DIR__ . '/app.html');

    // De URL van een bestand, afgeleid van de documentroot, met de wijzigingsdatum tegen een oude cache.
    $slash = static fn (string $p): string => str_replace('\\', '/', $p);
    $root = rtrim($slash((string) realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''))), '/');
    $url = static function (string $pad) use ($slash, $root): string {
        $bestand = $slash((string) realpath(__DIR__ . '/' . $pad));
        if ($root === '' || $bestand === '' || !str_starts_with($bestand, $root . '/')) {
            throw new RuntimeException('Veldrang staat niet onder de documentroot.');
        }
        return htmlspecialchars(substr($bestand, strlen($root)) . '?v=' . filemtime($bestand), ENT_QUOTES);
    };

    if (!preg_match('~<!-- begin inhoud[^>]*-->(.*)<!-- einde inhoud -->~s', $html, $deel)) {
        throw new RuntimeException('In app.html staat geen inhoud tussen de markeringen.');
    }

    echo '<link rel="stylesheet" href="', $url('../app.css'), '">', "\n",
        '<link rel="stylesheet" href="', $url('thema.css'), '">', "\n",
        trim($deel[1]), "\n",
        '<script type="module" src="', $url('app.js'), '"></script>', "\n";
})();
