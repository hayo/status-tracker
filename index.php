<?php

/**
 * Wassenaar Aanzien binnen een site, zoals op hayobethlehem.nl/forge.
 *
 * Los opgevraagd levert dit gewoon index.html. Binnen een site, via de parser, alleen het artikel
 * #aanzien, met de opmaak en het script erbij. De site zet er kop, menu en de tokens van
 * standalone.css omheen. Zo is index.html de enige bron van de inhoud.
 */

declare(strict_types=1);

(static function (): void {
    $html = (string) file_get_contents(__DIR__ . '/index.html');
    $script = realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? ''));

    if ($script !== false && dirname($script) === realpath(__DIR__)) {
        echo $html;
        return;
    }

    // De URL van deze map, afgeleid van de documentroot, met de wijzigingsdatum tegen een oude cache.
    $slash = static fn (string $p): string => str_replace('\\', '/', $p);
    $root = rtrim($slash((string) realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''))), '/');
    $map = $slash((string) realpath(__DIR__));
    if ($root === '' || !str_starts_with($map . '/', $root . '/')) {
        throw new RuntimeException('De map van Wassenaar Aanzien staat niet onder de documentroot.');
    }
    $url = static fn (string $pad): string => htmlspecialchars(
        substr($map, strlen($root)) . '/' . $pad . '?v=' . filemtime(__DIR__ . '/' . $pad),
        ENT_QUOTES
    );

    if (!preg_match('~<!-- begin inhoud[^>]*-->(.*)<!-- einde inhoud -->~s', $html, $deel)) {
        throw new RuntimeException('In index.html staat geen inhoud tussen de markeringen.');
    }

    echo '<link rel="stylesheet" href="', $url('app.css'), '">', "\n",
        trim($deel[1]), "\n",
        '<script type="module" src="', $url('app.js'), '"></script>', "\n";
})();
