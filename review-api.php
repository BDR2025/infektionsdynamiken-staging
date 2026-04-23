<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$storagePath = __DIR__ . '/.review-state.json';
$allowedStatuses = ['open', 'in_review', 'approved', 'hold'];

function review_respond(int $statusCode, array $payload): never
{
    http_response_code($statusCode);

    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        echo '{"ok":false,"message":"JSON encoding failed."}';
    } else {
        echo $json;
    }

    exit;
}

function review_clean_id(mixed $value): string
{
    $text = trim((string) $value);
    $text = preg_replace('/[^a-zA-Z0-9_-]+/', '-', $text) ?? '';

    return substr($text, 0, 160);
}

function review_clean_block(mixed $value, int $maxLength = 12000): string
{
    $text = trim((string) $value);
    $text = preg_replace("/\r\n?/", "\n", $text) ?? '';
    $text = preg_replace("/\n{3,}/", "\n\n", $text) ?? '';

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength);
    }

    return substr($text, 0, $maxLength);
}

function review_clean_status(mixed $value, array $allowedStatuses): string
{
    $status = trim((string) $value);

    return in_array($status, $allowedStatuses, true) ? $status : 'open';
}

function review_actor_id(mixed $value): string
{
    $actor = strtolower(trim((string) $value));
    $actor = preg_replace('/[^a-z0-9_-]+/', '_', $actor) ?? '';
    $actor = trim($actor, '_');

    return match ($actor) {
        'heinz', 'andreas_heinz' => 'andreas_heinz',
        'nic', 'nic_rausch' => 'nic_rausch',
        default => substr($actor, 0, 80)
    };
}

function review_actor_label(string $actorId): string
{
    return match ($actorId) {
        'andreas_heinz' => 'Andreas Heinz',
        'nic_rausch' => 'Nic Rausch',
        '' => '',
        default => ucwords(str_replace(['_', '-'], ' ', $actorId))
    };
}

function review_resolve_actor(): array
{
    $rawActor = $_SERVER['PHP_AUTH_USER'] ?? $_SERVER['REMOTE_USER'] ?? '';
    $actorId = review_actor_id($rawActor);

    return [
        'id' => $actorId,
        'label' => review_actor_label($actorId)
    ];
}

function review_normalize_entry(mixed $value, array $allowedStatuses): array
{
    $entry = is_array($value) ? $value : [];

    return [
        'status' => review_clean_status($entry['status'] ?? 'open', $allowedStatuses),
        'reviewNote' => review_clean_block($entry['reviewNote'] ?? ($entry['heinzNote'] ?? ''), 12000),
        'reviewNoteBy' => review_clean_block($entry['reviewNoteBy'] ?? '', 160),
        'reviewNoteById' => review_actor_id($entry['reviewNoteById'] ?? ''),
        'teamNote' => review_clean_block($entry['teamNote'] ?? '', 12000),
        'teamNoteBy' => review_clean_block($entry['teamNoteBy'] ?? '', 160),
        'teamNoteById' => review_actor_id($entry['teamNoteById'] ?? ''),
        'updatedAt' => is_string($entry['updatedAt'] ?? null) ? trim($entry['updatedAt']) : ''
        ,
        'updatedBy' => review_clean_block($entry['updatedBy'] ?? '', 160),
        'updatedById' => review_actor_id($entry['updatedById'] ?? '')
    ];
}

function review_normalize_state(mixed $value, array $allowedStatuses): array
{
    if (!is_array($value)) {
        return [];
    }

    $normalized = [];

    foreach ($value as $itemId => $entry) {
        $cleanId = review_clean_id($itemId);
        if ($cleanId === '') {
            continue;
        }

        $normalized[$cleanId] = review_normalize_entry($entry, $allowedStatuses);
    }

    return $normalized;
}

function review_entry_is_empty(array $entry): bool
{
    return $entry['status'] === 'open'
        && trim((string) $entry['reviewNote']) === ''
        && trim((string) $entry['teamNote']) === '';
}

function review_load_state(string $storagePath, array $allowedStatuses): array
{
    $handle = fopen($storagePath, 'c+');
    if ($handle === false) {
        review_respond(500, ['ok' => false, 'message' => 'Review state file could not be opened.']);
    }

    try {
        if (!flock($handle, LOCK_SH)) {
            review_respond(500, ['ok' => false, 'message' => 'Review state file could not be locked.']);
        }

        rewind($handle);
        $raw = stream_get_contents($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }

    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);

    return review_normalize_state($decoded, $allowedStatuses);
}

function review_store_entry(string $storagePath, string $itemId, array $entry, array $allowedStatuses, array $actor): array
{
    $handle = fopen($storagePath, 'c+');
    if ($handle === false) {
        review_respond(500, ['ok' => false, 'message' => 'Review state file could not be opened for writing.']);
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            review_respond(500, ['ok' => false, 'message' => 'Review state file could not be locked for writing.']);
        }

        rewind($handle);
        $raw = stream_get_contents($handle);
        $decoded = trim((string) $raw) === '' ? [] : json_decode((string) $raw, true);
        $state = review_normalize_state($decoded, $allowedStatuses);
        $previousEntry = $state[$itemId] ?? review_normalize_entry([], $allowedStatuses);

        $nextEntry = review_normalize_entry($entry, $allowedStatuses);
        if (review_entry_is_empty($nextEntry)) {
            unset($state[$itemId]);
            $nextEntry = review_normalize_entry([], $allowedStatuses);
        } else {
            $hasReviewNoteChange = $nextEntry['reviewNote'] !== $previousEntry['reviewNote'];
            $hasTeamNoteChange = $nextEntry['teamNote'] !== $previousEntry['teamNote'];
            $hasStatusChange = $nextEntry['status'] !== $previousEntry['status'];

            $nextEntry['reviewNoteBy'] = $nextEntry['reviewNote'] === ''
                ? ''
                : ($hasReviewNoteChange ? $actor['label'] : $previousEntry['reviewNoteBy']);
            $nextEntry['reviewNoteById'] = $nextEntry['reviewNote'] === ''
                ? ''
                : ($hasReviewNoteChange ? $actor['id'] : $previousEntry['reviewNoteById']);

            $nextEntry['teamNoteBy'] = $nextEntry['teamNote'] === ''
                ? ''
                : ($hasTeamNoteChange ? $actor['label'] : $previousEntry['teamNoteBy']);
            $nextEntry['teamNoteById'] = $nextEntry['teamNote'] === ''
                ? ''
                : ($hasTeamNoteChange ? $actor['id'] : $previousEntry['teamNoteById']);

            if ($hasReviewNoteChange || $hasTeamNoteChange || $hasStatusChange) {
                $nextEntry['updatedAt'] = gmdate('c');
                $nextEntry['updatedBy'] = $actor['label'];
                $nextEntry['updatedById'] = $actor['id'];
            } else {
                $nextEntry['updatedAt'] = $previousEntry['updatedAt'];
                $nextEntry['updatedBy'] = $previousEntry['updatedBy'];
                $nextEntry['updatedById'] = $previousEntry['updatedById'];
            }

            $state[$itemId] = $nextEntry;
        }

        $encoded = json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($encoded === false) {
            review_respond(500, ['ok' => false, 'message' => 'Review state could not be encoded.']);
        }

        rewind($handle);
        if (!ftruncate($handle, 0)) {
            review_respond(500, ['ok' => false, 'message' => 'Review state file could not be truncated.']);
        }

        if (fwrite($handle, $encoded) === false) {
            review_respond(500, ['ok' => false, 'message' => 'Review state file could not be written.']);
        }

        fflush($handle);
        flock($handle, LOCK_UN);

        return $nextEntry;
    } finally {
        fclose($handle);
    }
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    review_respond(200, [
        'ok' => true,
        'state' => review_load_state($storagePath, $allowedStatuses)
    ]);
}

if ($method !== 'POST') {
    review_respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$payload = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($payload)) {
    review_respond(400, ['ok' => false, 'message' => 'Invalid JSON payload.']);
}

$itemId = review_clean_id($payload['itemId'] ?? '');
if ($itemId === '') {
    review_respond(422, ['ok' => false, 'message' => 'Missing itemId.']);
}

$entryPayload = $payload['entry'] ?? null;
if (!is_array($entryPayload)) {
    review_respond(422, ['ok' => false, 'message' => 'Missing entry payload.']);
}

$storedEntry = review_store_entry($storagePath, $itemId, $entryPayload, $allowedStatuses, review_resolve_actor());

review_respond(200, [
    'ok' => true,
    'itemId' => $itemId,
    'entry' => $storedEntry
]);
