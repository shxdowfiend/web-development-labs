<?php
declare(strict_types=1);

namespace App\Database;

use PDO;

/**
 * Singleton: один об'єкт PDO на весь HTTP-запит.
 * Конструктор приватний, тому створити екземпляр можна лише через getInstance().
 */
final class Connection
{
    private static ?Connection $instance = null;
    private PDO $pdo;

    private function __construct()
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            getenv('DB_HOST') ?: '127.0.0.1',
            getenv('DB_PORT') ?: '3306',
            getenv('DB_NAME') ?: 'bookshelf'
        );
        $this->pdo = new PDO($dsn, getenv('DB_USER') ?: 'bookshelf', getenv('DB_PASS') ?: '', [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    private function __clone()
    {
    }

    public function __wakeup(): void
    {
        throw new \LogicException('Singleton не можна відновлювати з серіалізованого вигляду.');
    }

    public static function getInstance(): self
    {
        return self::$instance ??= new self();
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }
}
