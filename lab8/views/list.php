<?php
/**
 * @var callable $e
 * @var \App\Model\Book[] $books
 * @var string $sort
 * @var string $dir
 * @var ?string $message
 * @var string $csrf
 */
$sortLink = static function (string $column, string $label) use ($sort, $dir, $e): string {
    $active = $sort === $column;
    $next = $active && $dir === 'desc' ? 'asc' : 'desc';
    $arrow = $active ? ($dir === 'asc' ? ' ↑' : ' ↓') : '';
    return sprintf('<a href="index.php?sort=%s&amp;dir=%s"%s>%s%s</a>', $e($column), $next, $active ? ' class="active"' : '', $e($label), $arrow);
};
?>
<h1>Журнал прочитаних книг</h1>
<?php if ($message !== null): ?><p class="alert alert-ok"><?= $e($message) ?></p><?php endif; ?>

<p class="sort">Сортувати:
    <?= $sortLink('created_at', 'за датою') ?>
    <?= $sortLink('title', 'за назвою') ?>
    <?= $sortLink('pages', 'за обсягом') ?>
    <?= $sortLink('rating', 'за оцінкою') ?>
</p>

<?php if (!$books): ?>
    <p class="card">Журнал поки порожній. <a href="index.php?action=create">Додайте першу книгу.</a></p>
<?php endif; ?>

<?php foreach ($books as $book): ?>
    <article class="card book">
        <div class="book-head">
            <h2><?= $e($book->title) ?></h2>
            <span class="stars" title="Оцінка <?= $book->rating ?> з 5"><?= $book->stars() ?></span>
        </div>
        <p class="meta"><?= $e($book->author) ?> · <?= $e($book->genreName()) ?> · <?= $book->pages ?> с.</p>
        <p><?= nl2br($e($book->review)) ?></p>
        <div class="book-foot">
            <p class="meta">Додав: <?= $e($book->email) ?> · <?= $book->createdAt?->format('d.m.Y H:i') ?></p>
            <div class="actions">
                <a class="btn-link" href="index.php?action=edit&amp;id=<?= $book->id ?>">Редагувати</a>
                <form method="post" action="index.php?action=delete" onsubmit="return confirm('Видалити цю книгу з журналу?')">
                    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                    <input type="hidden" name="id" value="<?= $book->id ?>">
                    <button type="submit" class="btn-danger">Видалити</button>
                </form>
            </div>
        </div>
    </article>
<?php endforeach; ?>
