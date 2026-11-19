<?php
/** Форма додавання книги та обробка POST-запиту. */
declare(strict_types=1);

require __DIR__ . '/app/bootstrap.php';

$data = ['title' => '', 'author' => '', 'genre' => '', 'pages' => '', 'rating' => '5', 'review' => '', 'email' => ''];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrfValid($_POST['csrf'] ?? null)) {
        http_response_code(403);
        $errors['form'] = 'Сторінка застаріла, оновіть її та надішліть форму ще раз.';
    } else {
        [$data, $errors] = validateBook($_POST);
        if (!$errors) {
            insertBook($data);
            flash('Книгу «' . $data['title'] . '» додано до журналу.');
            redirect('list.php');
        }
        http_response_code(422);
    }
}

$err = static fn (string $field): string =>
    isset($errors[$field]) ? '<p class="error">' . e($errors[$field]) . '</p>' : '';

pageHeader('Додати книгу', 'add');
?>
<h1>Нова книга в журналі</h1>
<?php if (isset($errors['form'])): ?><p class="alert alert-error"><?= e($errors['form']) ?></p><?php endif; ?>
<?php if ($errors && !isset($errors['form'])): ?><p class="alert alert-error">Форму не збережено — виправте позначені поля.</p><?php endif; ?>

<form method="post" action="index.php" class="card form" novalidate>
    <input type="hidden" name="csrf" value="<?= e(csrfToken()) ?>">

    <label>Назва книги
        <input type="text" name="title" maxlength="150" value="<?= e($data['title']) ?>" required>
    </label>
    <?= $err('title') ?>

    <label>Автор
        <input type="text" name="author" maxlength="100" value="<?= e($data['author']) ?>" required>
    </label>
    <?= $err('author') ?>

    <div class="row">
        <label>Жанр
            <select name="genre" required>
                <option value="">— оберіть —</option>
                <?php foreach (GENRES as $value => $name): ?>
                    <option value="<?= e($value) ?>"<?= $data['genre'] === $value ? ' selected' : '' ?>><?= e($name) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label>Сторінок
            <input type="number" name="pages" min="1" max="5000" value="<?= e($data['pages']) ?>" required>
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
        <textarea name="review" rows="4" maxlength="2000" required><?= e($data['review']) ?></textarea>
    </label>
    <?= $err('review') ?>

    <label>Ваш email
        <input type="email" name="email" maxlength="254" value="<?= e($data['email']) ?>" required>
    </label>
    <?= $err('email') ?>

    <button type="submit">Зберегти в журнал</button>
</form>
<?php pageFooter();
