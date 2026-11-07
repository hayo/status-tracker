<?php

/**
 * Opslag op de server voor Wassenaar Aanzien.
 *
 * De app versleutelt de voortgang zelf, met de synccode van de speler (AES-GCM). Hier komt alleen
 * een onleesbaar blok binnen, onder een id dat een hash van die code is. De server kent de code
 * niet en kan de voortgang dus niet lezen.
 *
 * Eén verzoek: POST met JSON { actie, id, revisie?, data? }.
 * - lees: geeft { revisie, data }, of 404 als er niets is.
 * - schrijf: bewaart data als revisie de huidige is. Anders 409 met wat er nu staat.
 * - wis: haalt alles van dit id weg.
 *
 * Instellingen via de omgeving van de webserver:
 * - AANZIEN_OPSLAG: de map voor de bestanden. Zet die buiten de map die bij een update wordt
 *   overschreven. Standaard: bewaard/ naast dit bestand.
 * - AANZIEN_HERKOMST: welke andere sites de opslag mogen gebruiken, gescheiden door komma's.
 */

declare(strict_types=1);

const AZ_MAX_DATA = 700_000;      // tekens base64, ruim genoeg voor jaren loggen
const AZ_MAX_SPELERS = 2_000;     // tegen misbruik als gratis opslag
const AZ_HERKOMST = 'https://hayo.github.io,https://hayobethlehem.nl';

(static function (): void {
    $antwoord = static function (int $status, ?array $inhoud = null): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        if ($inhoud !== null) {
            echo json_encode($inhoud, JSON_UNESCAPED_SLASHES);
        }
    };

    $herkomst = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    $toegestaan = array_map('trim', explode(',', (string) (getenv('AANZIEN_HERKOMST') ?: AZ_HERKOMST)));
    if ($herkomst !== '' && in_array($herkomst, $toegestaan, true)) {
        header('Access-Control-Allow-Origin: ' . $herkomst);
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 86400');
        header('Vary: Origin');
    }

    $methode = $_SERVER['REQUEST_METHOD'] ?? '';
    if ($methode === 'OPTIONS') {
        http_response_code(204);
        return;
    }
    if ($methode !== 'POST') {
        $antwoord(405, ['fout' => 'Alleen POST.']);
        return;
    }

    $verzoek = json_decode((string) file_get_contents('php://input', false, null, 0, AZ_MAX_DATA + 1_000), true);
    $actie = $verzoek['actie'] ?? null;
    $id = $verzoek['id'] ?? null;
    if (!is_array($verzoek) || !in_array($actie, ['lees', 'schrijf', 'wis'], true) || !is_string($id) || !preg_match('/^[0-9a-f]{64}$/', $id)) {
        $antwoord(400, ['fout' => 'Ongeldig verzoek.']);
        return;
    }

    $map = rtrim((string) (getenv('AANZIEN_OPSLAG') ?: __DIR__ . '/bewaard'), '/');
    if (!is_dir($map) && !mkdir($map, 0750, true) && !is_dir($map)) {
        $antwoord(500, ['fout' => 'De opslag is niet beschikbaar.']);
        return;
    }
    $pad = $map . '/' . $id . '.json';

    // Eén slot per speler, zodat twee apparaten tegelijk elkaar niet overschrijven.
    $slot = fopen($pad . '.slot', 'c');
    if ($slot === false || !flock($slot, LOCK_EX)) {
        $antwoord(500, ['fout' => 'De opslag is niet beschikbaar.']);
        return;
    }

    $opruimen = false;
    try {
        $nu = is_file($pad) ? json_decode((string) file_get_contents($pad), true) : null;
        $huidig = is_array($nu) ? (int) ($nu['revisie'] ?? 0) : 0;

        if ($actie === 'lees') {
            if ($huidig === 0) {
                $antwoord(404, ['fout' => 'Niets gevonden bij deze code.']);
            } else {
                $antwoord(200, ['revisie' => $huidig, 'data' => $nu['data']]);
            }
            return;
        }

        if ($actie === 'wis') {
            if (is_file($pad)) {
                unlink($pad);
            }
            $opruimen = true;
            $antwoord(200, ['revisie' => 0]);
            return;
        }

        $data = $verzoek['data'] ?? null;
        $basis = $verzoek['revisie'] ?? null;
        if (!is_string($data) || strlen($data) > AZ_MAX_DATA || !preg_match('/^[A-Za-z0-9+\/]+=*$/', $data) || !is_int($basis)) {
            $antwoord(400, ['fout' => 'Ongeldige gegevens.']);
            return;
        }
        if ($huidig === 0 && count(glob($map . '/*.json') ?: []) >= AZ_MAX_SPELERS) {
            $antwoord(507, ['fout' => 'De opslag is vol.']);
            return;
        }
        if ($basis !== $huidig) {
            $antwoord(409, ['revisie' => $huidig, 'data' => $nu['data'] ?? null]);
            return;
        }

        $nieuw = $huidig + 1;
        $tijdelijk = $pad . '.nieuw';
        $inhoud = json_encode(['revisie' => $nieuw, 'data' => $data, 'bijgewerkt' => gmdate('c')]);
        if (file_put_contents($tijdelijk, $inhoud) === false || !rename($tijdelijk, $pad)) {
            $antwoord(500, ['fout' => 'Opslaan lukte niet.']);
            return;
        }
        $antwoord(200, ['revisie' => $nieuw]);
    } finally {
        flock($slot, LOCK_UN);
        fclose($slot);
        if ($opruimen) {
            unlink($pad . '.slot');
        }
    }
})();
