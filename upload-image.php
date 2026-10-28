<?php
// Stores email images on this server and returns a public URL, so emails link to
// images instead of embedding them. Embedded (data:) images make Gmail paste the
// layout twice, get stripped for recipients, and push the email past 102 KB.
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'POST only']); exit; }

$in = json_decode(file_get_contents('php://input'), true);
$d = isset($in['data']) ? $in['data'] : '';
if (!preg_match('#^data:image/(png|jpeg|gif|webp);base64,(.+)$#s', $d, $m)) { http_response_code(400); echo json_encode(['error' => 'Unsupported image']); exit; }

$ext = $m[1] === 'jpeg' ? 'jpg' : $m[1];
$bin = base64_decode($m[2], true);
if ($bin === false || strlen($bin) > 20 * 1024 * 1024) { http_response_code(400); echo json_encode(['error' => 'Invalid or too large']); exit; }
if (!@getimagesizefromstring($bin)) { http_response_code(400); echo json_encode(['error' => 'Not an image']); exit; }

$dir = dirname(__DIR__) . '/media';
if (!is_dir($dir) && !@mkdir($dir, 0755, true)) { http_response_code(500); echo json_encode(['error' => 'media folder not writable']); exit; }
$name = sha1($bin) . '.' . $ext;
$path = $dir . '/' . $name;
if (!file_exists($path) && @file_put_contents($path, $bin) === false) { http_response_code(500); echo json_encode(['error' => 'Write failed']); exit; }

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$base = rtrim(str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME']))), '/');
echo json_encode(['url' => ($https ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $base . '/media/' . $name]);
