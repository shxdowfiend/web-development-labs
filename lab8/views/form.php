<?php
/**
 * Спільний шаблон для додавання та редагування.
 * @var callable $e
 * @var string $pageTitle
 * @var array $data
 * @var array<string,string> $errors
 * @var ?int $id
 * @var string $csrf
 * @var array<string,string> $genres
 */
$err = static fn (string $field): string => isset($errors[$field]) ? '<p class="error">' . $e($errors[$field]) . '</p>' : '';
$action = $id === null ? 'index.php?action=create' : 'index.php?action=edit&amp;id=' . $id;
?>
<h1><?= $e($pageTitle) ?></h1>
<?php if ($errors): ?><p class="alert alert-error">Форму не збережено — виправте позначені поля.</p><?php endif; ?>

<form method="post" action="<?= $action ?>" class="card form" novalidate>
    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
    <?php if ($id !== null): ?><input type="hidden" name="id" value="<?= $id ?>"><?php endif; ?>

    <label>Назва книги
        <input type="text" name="title" maxlength="150" value="<?= $e($data['title']) ?>" required>
    </label>
    <?= $err('title') ?>

    <label>Автор
        <input type="text" name="author" maxlength="100" value="<?= $e($data['author']) ?>" required>
    </label>
    <?= $err('author') ?>

    <div class="row">
        <label>Жанр
            <select name="genre" required>
                <option value="">— оберіть —</option>
                <?php foreach ($genres as $value => $name): ?>
                    <option value="<?= $e($value) ?>"<?= $data['genre'] === $value ? ' selected' : '' ?>><?= $e($name) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label>Сторінок
            <input type="number" name="pages" min="1" max="5000" value="<?= $e($data['pages']) ?>" required>
        </label>
        <label>Оцінка
            <select name="rating">
                <?php for ($i = 5; $i >= 1; $i--): ?>
                    <option value="<?= $i ?>"<?= (string) $data['rating'] === (string) $i ? ' selected' : '' ?>><?= str_repeat('★', $i) ?></option>
                <?php endfor; ?>
            </select>
        </label>
    </div>
    <?= $err('genre') . $err('pages') . $err('rating') ?>

    <label>Враження від книги
        <textarea name="review" rows="4" maxlength="2000" required><?= $e($data['review']) ?></textarea>
    </label>
    <?= $err('review') ?>

    <label>Ваш email
        <input type="email" name="email" maxlength="254" value="<?= $e($data['email']) ?>" required>
    </label>
    <?= $err('email') ?>

    <button type="submit"><?= $id === null ? 'Зберегти в журнал' : 'Зберегти зміни' ?></button>
    <a class="btn-link" href="index.php">Скасувати</a>
</form>
