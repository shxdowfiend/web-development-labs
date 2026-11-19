<?php
/** Спільний старт для всіх сторінок: сесія, екранування, CSRF, повідомлення. */
declare(strict_types=1);

session_start();

const GENRES = [
    'fiction'    => 'Художня література',
    'nonfiction' => 'Нон-фікшн',
    'poetry'     => 'Поезія',
    'tech'       => 'Технічна література',
    'other'      => 'Інше',
];

/** Безпечний вивід тексту в HTML. */
function e(string|int|null $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrfValid(mixed $token): bool
{
    return is_string($token) && isset($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token);
}

/** Одноразове повідомлення, що переживає перенаправлення. */
function flash(?string $message = null): ?string
{
    if ($message !== null) {
        $_SESSION['flash'] = $message;
        return null;
    }
    $saved = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $saved;
}

function redirect(string $url): never
{
    header('Location: ' . $url, true, 303);
    exit;
}

require __DIR__ . '/db.php';
require __DIR__ . '/validate.php';
require __DIR__ . '/layout.php';
