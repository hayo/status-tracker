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
 * Teams: één bestand per team, met per lid een eigen versleuteld profiel. De sleutel komt uit de
 * teamcode, die alleen de leden kennen. Elk lid heeft een geheim token; de server bewaart alleen de
 * hash ervan (lid), zodat niemand het profiel van een ander kan overschrijven of weghalen.
 * Schrijven vraagt ook een schrijfbewijs, dat de app uit de teamcode afleidt. De server bewaart alleen
 * de hash ervan. Een kijklink heeft het id en de sleutel om te lezen, maar niet de code: wie alleen de
 * link heeft, kan het team zien maar niet aansluiten.
 * - team-lees: geeft { leden: [{ lid, data, bijgewerkt }], badge }. Zonder team is de lijst leeg.
 * - team-schrijf: met token, schrijf en data. Bewaart het profiel van dit lid; een nieuw team ontstaat zo.
 * - team-badge: met token, schrijf en data. Bewaart de (versleutelde) badge van het team; alleen voor leden.
 * - team-verlaat: met token. Haalt dit lid weg; een leeg team verdwijnt, met zijn badge.
 *
 * Instellingen via de omgeving van de webserver:
 * - AANZIEN_OPSLAG: de map voor de bestanden. Zet die buiten de map die bij een update wordt
 *   overschreven. Standaard: bewaard/ naast dit bestand.
 * - AANZIEN_HERKOMST: welke andere sites de opslag mogen gebruiken, gescheiden door komma's.
 */

declare(strict_types=1);

const AZ_MAX_DATA = 700_000;      // tekens base64, ruim genoeg voor jaren loggen
const AZ_MAX_SPELERS = 2_000;     // tegen misbruik als gratis opslag
const AZ_MAX_PROFIEL = 60_000;   // tekens base64 per lid
const AZ_MAX_LEDEN = 40;
const AZ_MAX_BADGE = 200_000;     // tekens base64 voor de badge van een team
const AZ_MAX_TEAMS = 1_000;
const AZ_LID_VERLOOPT = 365 * 86_400; // een lid dat een jaar niets stuurde, valt weg
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
    if (!is_array($verzoek) || !in_array($actie, ['lees', 'schrijf', 'wis', 'team-lees', 'team-schrijf', 'team-verlaat', 'team-badge'], true) || !is_string($id) || !preg_match('/^[0-9a-f]{64}$/', $id)) {
        $antwoord(400, ['fout' => 'Ongeldig verzoek.']);
        return;
    }
    $team = substr($actie, 0, 5) === 'team-';

    $map = rtrim((string) (getenv('AANZIEN_OPSLAG') ?: __DIR__ . '/bewaard'), '/') . ($team ? '/teams' : '');
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
        if ($team) {
            $opruimen = azTeam($actie, $verzoek, $pad, $map, $antwoord);
            return;
        }

        $nu = is_file($pad) ? json_decode((string) file_get_contents($pad), true) : null;
        $huidig = is_array($nu) ? (int) ($nu['revisie'] ?? 0) : 0;

        if ($actie === 'lees') {
            if ($huidig === 0) {
                $opruimen = !is_file($pad); // geen leeg slot laten staan voor een code zonder voortgang
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

/**
 * De teamacties. Geeft true als het team weg is, zodat het slot ook weg kan.
 */
function azTeam(string $actie, array $verzoek, string $pad, string $map, callable $antwoord): bool
{
    $nu = is_file($pad) ? json_decode((string) file_get_contents($pad), true) : null;
    $leden = is_array($nu) && is_array($nu['leden'] ?? null) ? $nu['leden'] : [];
    $grens = gmdate('c', time() - AZ_LID_VERLOOPT);
    $leden = array_filter($leden, static fn ($l): bool => is_array($l) && (string) ($l['bijgewerkt'] ?? '') >= $grens);

    $schrijfHash = is_array($nu) && is_string($nu['schrijf'] ?? null) ? $nu['schrijf'] : null;
    $badge = is_array($nu) && is_array($nu['badge'] ?? null) ? $nu['badge'] : null;

    if ($actie === 'team-lees') {
        $lijst = [];
        foreach ($leden as $lid => $l) {
            $lijst[] = ['lid' => (string) $lid, 'data' => $l['data'], 'bijgewerkt' => $l['bijgewerkt']];
        }
        $antwoord(200, ['leden' => $lijst, 'badge' => $leden === [] ? null : ($badge['data'] ?? null)]);
        return !is_file($pad);
    }

    $token = $verzoek['token'] ?? null;
    if (!is_string($token) || !preg_match('/^[0-9a-f]{64}$/', $token)) {
        $antwoord(400, ['fout' => 'Ongeldig verzoek.']);
        return false;
    }
    $lid = hash('sha256', $token);

    if ($actie !== 'team-verlaat') {
        $schrijf = $verzoek['schrijf'] ?? null;
        if (!is_string($schrijf) || !preg_match('/^[0-9a-f]{64}$/', $schrijf)) {
            $antwoord(400, ['fout' => 'Ongeldig verzoek.']);
            return false;
        }
        if ($leden !== [] && $schrijfHash !== null && !hash_equals($schrijfHash, hash('sha256', $schrijf))) {
            $antwoord(403, ['fout' => 'Met deze link kun je kijken, niet aansluiten.']);
            return false;
        }
        $schrijfHash = hash('sha256', $schrijf);
    }

    if ($actie === 'team-verlaat') {
        unset($leden[$lid]);
    } elseif ($actie === 'team-badge') {
        $data = $verzoek['data'] ?? null;
        if (!isset($leden[$lid])) {
            $antwoord(403, ['fout' => 'Alleen leden kunnen de badge zetten.']);
            return false;
        }
        if ($data === null) {
            $badge = null;
        } elseif (!is_string($data) || strlen($data) > AZ_MAX_BADGE || !preg_match('/^[A-Za-z0-9+\/]+=*$/', $data)) {
            $antwoord(400, ['fout' => 'De badge is te groot of ongeldig.']);
            return false;
        } else {
            $badge = ['data' => $data, 'bijgewerkt' => gmdate('c')];
        }
    } else {
        $data = $verzoek['data'] ?? null;
        if (!is_string($data) || strlen($data) > AZ_MAX_PROFIEL || !preg_match('/^[A-Za-z0-9+\/]+=*$/', $data)) {
            $antwoord(400, ['fout' => 'Ongeldige gegevens.']);
            return false;
        }
        if ($leden === [] && !is_file($pad) && count(glob($map . '/*.json') ?: []) >= AZ_MAX_TEAMS) {
            $antwoord(507, ['fout' => 'Er kunnen geen teams meer bij.']);
            return false;
        }
        if (!isset($leden[$lid]) && count($leden) >= AZ_MAX_LEDEN) {
            $antwoord(507, ['fout' => 'Het team is vol.']);
            return false;
        }
        $leden[$lid] = ['data' => $data, 'bijgewerkt' => gmdate('c')];
    }

    if ($leden === []) {
        if (is_file($pad)) {
            unlink($pad);
        }
        $antwoord(200, ['leden' => 0]);
        return true;
    }
    $tijdelijk = $pad . '.nieuw';
    $inhoud = ['leden' => $leden, 'schrijf' => $schrijfHash, 'badge' => $badge];
    if (file_put_contents($tijdelijk, json_encode($inhoud)) === false || !rename($tijdelijk, $pad)) {
        $antwoord(500, ['fout' => 'Opslaan lukte niet.']);
        return false;
    }
    $antwoord(200, ['lid' => $lid, 'leden' => count($leden)]);
    return false;
}
