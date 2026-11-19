<?php
declare(strict_types=1);

namespace App\Http;

/** Відображає PHP-шаблони з каталогу views у спільному макеті. */
final class View
{
    public function __construct(private string $dir)
    {
    }

    public function render(string $template, array $vars = [], int $status = 200): void
    {
        http_response_code($status);
        $e = static fn (mixed $value): string => htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        extract($vars, EXTR_SKIP);
        require $this->dir . '/header.php';
        require $this->dir . '/' . $template . '.php';
        require $this->dir . '/footer.php';
    }
}
