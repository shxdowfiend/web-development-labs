<?php
/**
 * Лабораторна робота №8 — єдина точка входу (front controller).
 * Тут створюються всі залежності, і запит передається контролеру.
 */
declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    if (str_starts_with($class, 'App\\')) {
        $file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (is_file($file)) {
            require $file;
        }
    }
});

use App\Controller\BookController;
use App\Database\Connection;
use App\Http\FormHandler;
use App\Http\Session;
use App\Http\View;
use App\Model\BookFactory;
use App\Repository\BookRepository;
use App\Validation\BookValidator;

$factory = new BookFactory();
$controller = new BookController(
    new BookRepository(Connection::getInstance()->pdo(), $factory),
    new FormHandler(new BookValidator(), $factory),
    new Session(),
    new View(__DIR__ . '/views'),
);

$action = is_string($_GET['action'] ?? null) ? $_GET['action'] : 'list';
$controller->dispatch($action, $_SERVER['REQUEST_METHOD']);
