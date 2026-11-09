<?php

/**
 * Openbare teampagina's: gedeeld door opslag.php en veldrang/team.php.
 *
 * Een team is versleuteld; de server kan het niet lezen. Zet een lid de teampagina openbaar, dan krijgt
 * de server de leessleutel (kijk) van dat ene team, met een naam voor in de link (slug). Dan kan
 * team.php de pagina geven op /veldrang/team/<slug>, met een voorbeeld voor WhatsApp en andere apps.
 * Zet een lid het weer uit, dan gooit de server de sleutel en de naam weg.
 *
 * Los opgevraagd doet dit bestand niets.
 */

declare(strict_types=1);

if (!function_exists('azSlug')) {
    // De map met de teams, dezelfde als in opslag.php.
    function azTeamsMap(): string
    {
        return rtrim((string) (getenv('AANZIEN_OPSLAG') ?: __DIR__ . '/bewaard'), '/') . '/teams';
    }

    // Een naam voor in de link: 'Delta Wolves' wordt 'delta-wolves'. Leeg als er niets overblijft.
    function azSlug(string $naam): string
    {
        $tekst = class_exists('Normalizer') ? (string) Normalizer::normalize($naam, Normalizer::FORM_KD) : $naam;
        $tekst = strtolower((string) preg_replace('/[\x{0300}-\x{036f}]/u', '', $tekst));
        $tekst = trim((string) preg_replace('/[^a-z0-9]+/', '-', $tekst), '-');
        return rtrim(substr($tekst, 0, 40), '-');
    }

    // Ontsleutelt een blok van de app (base64 van iv, tekst en tag; AES-GCM) met de leessleutel.
    function azOntsleutel(string $kijk, string $data): mixed
    {
        $sleutel = base64_decode(strtr($kijk, '-_', '+/') . '=', true);
        $alles = base64_decode($data, true);
        if ($sleutel === false || strlen($sleutel) !== 32 || $alles === false || strlen($alles) < 29) {
            return null;
        }
        $tekst = openssl_decrypt(substr($alles, 12, -16), 'aes-256-gcm', $sleutel, OPENSSL_RAW_DATA, substr($alles, 0, 12), substr($alles, -16));
        return $tekst === false ? null : json_decode($tekst, true);
    }

    // De lijst met namen: { slug: id }.
    function azNamen(): array
    {
        $pad = azTeamsMap() . '/namen.json';
        $namen = is_file($pad) ? json_decode((string) file_get_contents($pad), true) : null;
        return is_array($namen) ? $namen : [];
    }

    /**
     * Zet een naam voor een team, of haalt hem weg ($wens null). Is de naam al van een ander team, dan
     * komt er een cijfer achter. Geeft de naam die het werd, of null.
     */
    function azZetNaam(string $id, ?string $oud, ?string $wens): ?string
    {
        $map = azTeamsMap();
        $slot = fopen($map . '/namen.json.slot', 'c');
        if ($slot === false || !flock($slot, LOCK_EX)) {
            throw new RuntimeException('De opslag is niet beschikbaar.');
        }
        try {
            $namen = azNamen();
            if ($oud !== null && ($namen[$oud] ?? null) === $id) {
                unset($namen[$oud]);
            }
            $naam = null;
            if ($wens !== null) {
                $basis = azSlug($wens) ?: 'team';
                $naam = $basis;
                for ($i = 2; isset($namen[$naam]) && $namen[$naam] !== $id; $i++) {
                    $naam = substr($basis, 0, 36) . '-' . $i;
                }
                $namen[$naam] = $id;
            }
            $tijdelijk = $map . '/namen.json.nieuw';
            if (file_put_contents($tijdelijk, json_encode($namen)) === false || !rename($tijdelijk, $map . '/namen.json')) {
                throw new RuntimeException('Opslaan lukte niet.');
            }
            return $naam;
        } finally {
            flock($slot, LOCK_UN);
            fclose($slot);
        }
    }

    /**
     * Het openbare team bij een naam: { id, kijk, naam, info, badge }, of null. naam is de naam die de
     * meeste leden noemen, zoals teamNaam in schermen/team.js. info en badge zijn ontsleuteld.
     */
    function azOpenbaarTeam(string $slug): ?array
    {
        $id = azNamen()[$slug] ?? null;
        if (!is_string($id) || !preg_match('/^[0-9a-f]{64}$/', $id)) {
            return null;
        }
        $pad = azTeamsMap() . '/' . $id . '.json';
        $team = is_file($pad) ? json_decode((string) file_get_contents($pad), true) : null;
        $kijk = $team['openbaar']['kijk'] ?? null;
        if (!is_array($team) || !is_string($kijk) || ($team['openbaar']['slug'] ?? null) !== $slug || !is_array($team['leden'] ?? null) || $team['leden'] === []) {
            return null;
        }
        $tel = [];
        foreach ($team['leden'] as $lid) {
            $profiel = is_string($lid['data'] ?? null) ? azOntsleutel($kijk, $lid['data']) : null;
            $naam = is_array($profiel) ? trim(mb_substr((string) ($profiel['teamnaam'] ?? ''), 0, 40)) : '';
            if ($naam !== '') {
                $tel[$naam] = ($tel[$naam] ?? 0) + 1;
            }
        }
        arsort($tel);
        $info = is_string($team['info']['data'] ?? null) ? azOntsleutel($kijk, $team['info']['data']) : null;
        $badge = is_string($team['badge']['data'] ?? null) ? azOntsleutel($kijk, $team['badge']['data']) : null;
        return [
            'id' => $id,
            'kijk' => $kijk,
            'naam' => (string) (array_key_first($tel) ?? 'zonder naam'),
            'info' => is_array($info) ? $info : [],
            'badge' => is_array($badge) ? $badge : null,
            'leden' => count($team['leden']),
        ];
    }
}
