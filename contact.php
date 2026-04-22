<?php

declare(strict_types=1);

$recipient = 'info@infektionsdynamiken.de';
$fallbackRedirect = '/';

function contact_limit(string $text, int $maxLength): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength);
    }

    return substr($text, 0, $maxLength);
}

function contact_redirect(string $targetPath, string $status): never
{
    $path = trim($targetPath);
    if ($path === '' || $path[0] !== '/') {
        $path = '/';
    }

    $separator = str_contains($path, '?') ? '&' : '?';
    header('Location: ' . $path . $separator . 'contact=' . rawurlencode($status), true, 303);
    exit;
}

function contact_clean_line(?string $value, int $maxLength = 200): string
{
    $text = trim((string) $value);
    $text = preg_replace('/\s+/u', ' ', $text) ?? '';
    $text = str_replace(["\r", "\n"], ' ', $text);

    return contact_limit($text, $maxLength);
}

function contact_clean_block(?string $value, int $maxLength = 5000): string
{
    $text = trim((string) $value);
    $text = preg_replace("/\r\n?/", "\n", $text) ?? '';
    $text = preg_replace("/\n{3,}/", "\n\n", $text) ?? '';

    return contact_limit($text, $maxLength);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    contact_redirect($fallbackRedirect, 'error');
}

$redirectTarget = contact_clean_line($_POST['_redirect'] ?? $fallbackRedirect, 512);
$language = contact_clean_line($_POST['_language'] ?? 'de', 8);
$honeypot = trim((string) ($_POST['company'] ?? ''));

if ($honeypot !== '') {
    contact_redirect($redirectTarget, 'success');
}

$name = contact_clean_line($_POST['name'] ?? '', 160);
$email = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$institution = contact_clean_line($_POST['institution'] ?? '', 200);
$topic = contact_clean_line($_POST['topic'] ?? '', 120);
$subject = contact_clean_line($_POST['subject'] ?? '', 200);
$defaultSubject = contact_clean_line($_POST['_subject'] ?? 'Kontaktanfrage', 200);
$message = contact_clean_block($_POST['message'] ?? '', 6000);
$consent = $_POST['consent'] ?? null;
$track = contact_clean_line($_POST['track'] ?? '', 80);
$coach = contact_clean_line($_POST['coach'] ?? '', 80);

if ($name === '' || $email === false || $topic === '' || $message === '' || $consent === null) {
    contact_redirect($redirectTarget, 'error');
}

$mailSubject = $subject !== '' ? $subject : $defaultSubject;
$encodedSubject = function_exists('mb_encode_mimeheader')
    ? mb_encode_mimeheader($mailSubject, 'UTF-8')
    : $mailSubject;

$bodyLines = [
    'Neue Kontaktanfrage ueber infektionsdynamiken.de',
    '',
    'Name: ' . $name,
    'E-Mail: ' . $email,
    'Institution/Kontext: ' . ($institution !== '' ? $institution : '-'),
    'Thema: ' . $topic,
    'Betreff: ' . ($subject !== '' ? $subject : '-'),
    'Track: ' . ($track !== '' ? $track : '-'),
    'Coach: ' . ($coach !== '' ? $coach : '-'),
    'Sprache: ' . ($language !== '' ? $language : '-'),
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '-'),
    '',
    'Nachricht:',
    $message
];

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Infektionsdynamiken Kontakt <' . $recipient . '>',
    'Reply-To: ' . $email,
    'X-Contact-Track: ' . ($track !== '' ? $track : 'unknown')
];

$sent = mail(
    $recipient,
    $encodedSubject,
    implode("\n", $bodyLines),
    implode("\r\n", $headers)
);

contact_redirect($redirectTarget, $sent ? 'success' : 'error');
