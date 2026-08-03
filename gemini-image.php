<?php
/**
 * Gemini image generation proxy.
 * -----------------------------------------------------------------------
 * The browser posts { prompt, aspect } here; this script calls the Gemini
 * API server-side and returns { dataUrl }. The API key never leaves the
 * server.
 *
 * SETUP
 *   1. Put the key in the server environment (preferred):
 *        Apache:  SetEnv GEMINI_API_KEY "AIza..."
 *        Nginx+PHP-FPM: env[GEMINI_API_KEY] = AIza...   (in the pool config)
 *      ...or, if that is not possible, drop a file next to this one named
 *      `gemini-key.php` containing:  <?php return 'AIza...';
 *      and make sure it is not web-readable.
 *   2. Requires PHP 7.4+ with the cURL extension.
 *   3. Serve over HTTPS.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

// Same-origin only. Uncomment and set if the generator is served from a
// different host than this endpoint.
// header('Access-Control-Allow-Origin: https://tools.orangehrm.com');

const GEMINI_MODEL = 'gemini-2.5-flash-image';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/';
const REQUEST_TIMEOUT = 90;
const MAX_PROMPT_LEN = 2000;

function fail(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

function resolveApiKey(): string {
    $key = getenv('GEMINI_API_KEY');
    if (is_string($key) && $key !== '') {
        return $key;
    }
    $file = __DIR__ . '/gemini-key.php';
    if (is_readable($file)) {
        $fromFile = include $file;
        if (is_string($fromFile) && $fromFile !== '') {
            return $fromFile;
        }
    }
    fail(500, 'Server is missing GEMINI_API_KEY. See api/gemini-image.php for setup.');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'POST only.');
}

$raw = file_get_contents('php://input') ?: '';
$body = json_decode($raw, true);
if (!is_array($body)) {
    fail(400, 'Expected a JSON body.');
}

$prompt = trim((string)($body['prompt'] ?? ''));
if ($prompt === '') {
    fail(400, 'Prompt is required.');
}
if (strlen($prompt) > MAX_PROMPT_LEN) {
    fail(400, 'Prompt is too long.');
}

// Aspect hint is folded into the prompt — the image model has no explicit
// aspect parameter, but it reliably honours a stated ratio.
$aspect = (string)($body['aspect'] ?? '');
$allowedAspects = ['16:9', '4:3', '1:1', '3:2', '21:9'];
if ($aspect !== '' && in_array($aspect, $allowedAspects, true)) {
    $prompt .= "\n\nCompose the image with a {$aspect} aspect ratio.";
}

$apiKey = resolveApiKey();
$url = GEMINI_ENDPOINT . GEMINI_MODEL . ':generateContent';

$payload = json_encode([
    'contents' => [[
        'parts' => [['text' => $prompt]],
    ]],
], JSON_UNESCAPED_SLASHES);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => REQUEST_TIMEOUT,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $apiKey,
    ],
]);
$response = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    fail(502, 'Could not reach the Gemini API: ' . $curlError);
}

$decoded = json_decode($response, true);
if (!is_array($decoded)) {
    fail(502, 'Unreadable response from the Gemini API.');
}

if ($status >= 400) {
    $msg = $decoded['error']['message'] ?? ('Gemini API returned HTTP ' . $status);
    fail(502, $msg);
}

$parts = $decoded['candidates'][0]['content']['parts'] ?? [];
foreach ($parts as $part) {
    if (isset($part['inlineData']['data'])) {
        $mime = $part['inlineData']['mimeType'] ?? 'image/png';
        echo json_encode(['dataUrl' => 'data:' . $mime . ';base64,' . $part['inlineData']['data']]);
        exit;
    }
}

// No image came back — surface any text the model returned instead, which is
// usually a safety refusal explaining why.
foreach ($parts as $part) {
    if (!empty($part['text'])) {
        fail(422, 'Gemini did not return an image: ' . $part['text']);
    }
}
fail(422, 'Gemini did not return an image.');
