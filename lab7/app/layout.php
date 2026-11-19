<?php
/** Спільна шапка та підвал сторінок. */
declare(strict_types=1);

function pageHeader(string $title, string $active): void
{
    $link = static fn (string $href, string $name, string $key): string =>
        sprintf('<a href="%s"%s>%s</a>', $href, $key === $active ? ' class="active"' : '', $name);
    ?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($title) ?> — Книжкова полиця</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<header class="top">
    <a class="logo" href="list.php">📚 Книжкова полиця</a>
    <nav>
        <?= $link('index.php', 'Додати книгу', 'add') ?>
        <?= $link('list.php', 'Журнал', 'list') ?>
    </nav>
</header>
<main>
    <?php
}

function pageFooter(): void
{
    ?>
</main>
<footer class="bottom">Рябий Ростислав, ІПЗм-41 · <a href="https://github.com/shxdowfiend">GitHub</a></footer>
</body>
</html>
    <?php
}
