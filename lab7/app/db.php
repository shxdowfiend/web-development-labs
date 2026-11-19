<?php
/** Підключення до MySQL через PDO та запити до таблиці books. */
declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            getenv('DB_HOST') ?: '127.0.0.1',
            getenv('DB_PORT') ?: '3306',
            getenv('DB_NAME') ?: 'bookshelf'
        );
        $pdo = new PDO($dsn, getenv('DB_USER') ?: 'bookshelf', getenv('DB_PASS') ?: '', [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

/** Додає книгу; повертає id нового запису. */
function insertBook(array $book): int
{
    $sql = 'INSERT INTO books (title, author, genre, pages, rating, review, email)
            VALUES (:title, :author, :genre, :pages, :rating, :review, :email)';
    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':title'  => $book['title'],
        ':author' => $book['author'],
        ':genre'  => $book['genre'],
        ':pages'  => $book['pages'],
        ':rating' => $book['rating'],
        ':review' => $book['review'],
        ':email'  => $book['email'],
    ]);
    return (int) db()->lastInsertId();
}

/**
 * Список книг із сортуванням. Назва колонки не може прийти з запиту напряму:
 * вона береться лише з дозволеного переліку, а напрямок — лише ASC або DESC.
 */
function findBooks(string $sort, string $dir): array
{
    $columns = ['created_at' => 'created_at', 'title' => 'title', 'pages' => 'pages', 'rating' => 'rating'];
    $column = $columns[$sort] ?? 'created_at';
    $direction = strtolower($dir) === 'asc' ? 'ASC' : 'DESC';

    return db()->query("SELECT * FROM books ORDER BY {$column} {$direction}, id {$direction}")->fetchAll();
}
