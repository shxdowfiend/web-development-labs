<?php
/** Журнал прочитаних книг із сортуванням через GET-параметри. */
declare(strict_types=1);

require __DIR__ . '/app/bootstrap.php';

$sort = is_string($_GET['sort'] ?? null) ? $_GET['sort'] : 'created_at';
$dir = is_string($_GET['dir'] ?? null) ? $_GET['dir'] : 'desc';
$books = findBooks($sort, $dir);
$message = flash();

/** Посилання для сортування: повторне натискання змінює напрямок. */
$sortLink = static function (string $column, string $label) use ($sort, $dir): string {
    $active = $sort === $column;
    $next = $active && strtolower($dir) === 'desc' ? 'asc' : 'desc';
    $arrow = $active ? (strtolower($dir) === 'asc' ? ' ↑' : ' ↓') : '';
    return sprintf('<a href="?sort=%s&amp;dir=%s"%s>%s%s</a>',
        e($column), $next, $active ? ' class="active"' : '', e($label), $arrow);
};

pageHeader('Журнал', 'list');
?>
<h1>Журнал прочитаних книг</h1>
<?php if ($message !== null): ?><p class="alert alert-ok"><?= e($message) ?></p><?php endif; ?>

<p class="sort">Сортувати:
    <?= $sortLink('created_at', 'за датою') ?>
    <?= $sortLink('title', 'за назвою') ?>
    <?= $sortLink('pages', 'за обсягом') ?>
    <?= $sortLink('rating', 'за оцінкою') ?>
</p>

<?php if (!$books): ?>
    <p class="card">Журнал поки порожній. <a href="index.php">Додайте першу книгу.</a></p>
<?php endif; ?>

<?php foreach ($books as $book): ?>
    <article class="card book">
        <div class="book-head">
            <h2><?= e($book['title']) ?></h2>
            <span class="stars" title="Оцінка <?= (int) $book['rating'] ?> з 5"><?= str_repeat('★', (int) $book['rating']) . str_repeat('☆', 5 - (int) $book['rating']) ?></span>
        </div>
        <p class="meta"><?= e($book['author']) ?> · <?= e(GENRES[$book['genre']] ?? $book['genre']) ?> · <?= (int) $book['pages'] ?> с.</p>
        <p><?= nl2br(e($book['review'])) ?></p>
        <p class="meta">Додав: <?= e($book['email']) ?> · <?= e(date('d.m.Y H:i', strtotime($book['created_at']))) ?></p>
    </article>
<?php endforeach; ?>
<?php pageFooter();
