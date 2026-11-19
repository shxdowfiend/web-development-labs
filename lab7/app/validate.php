<?php
/** Серверна перевірка полів форми. */
declare(strict_types=1);

/**
 * Перевіряє дані з $_POST.
 * Повертає [очищені_дані, помилки]; помилки — масив «поле => текст».
 */
function validateBook(array $input): array
{
    $text = static fn (string $key): string => is_string($input[$key] ?? null) ? trim($input[$key]) : '';
    $data = [
        'title'  => $text('title'),
        'author' => $text('author'),
        'genre'  => $text('genre'),
        'pages'  => $text('pages'),
        'rating' => $text('rating'),
        'review' => $text('review'),
        'email'  => $text('email'),
    ];
    $errors = [];

    if ($data['title'] === '') {
        $errors['title'] = 'Вкажіть назву книги.';
    } elseif (mb_strlen($data['title']) > 150) {
        $errors['title'] = 'Назва — не довше 150 символів.';
    }

    if ($data['author'] === '') {
        $errors['author'] = 'Вкажіть автора.';
    } elseif (mb_strlen($data['author']) > 100) {
        $errors['author'] = 'Автор — не довше 100 символів.';
    }

    if (!array_key_exists($data['genre'], GENRES)) {
        $errors['genre'] = 'Оберіть жанр зі списку.';
    }

    $pages = filter_var($data['pages'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 5000]]);
    if ($pages === false) {
        $errors['pages'] = 'Кількість сторінок — ціле число від 1 до 5000.';
    } else {
        $data['pages'] = $pages;
    }

    $rating = filter_var($data['rating'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 5]]);
    if ($rating === false) {
        $errors['rating'] = 'Оцінка — від 1 до 5.';
    } else {
        $data['rating'] = $rating;
    }

    if (mb_strlen($data['review']) < 10) {
        $errors['review'] = 'Напишіть враження хоча б кількома словами (від 10 символів).';
    } elseif (mb_strlen($data['review']) > 2000) {
        $errors['review'] = 'Враження — не довше 2000 символів.';
    }

    if (filter_var($data['email'], FILTER_VALIDATE_EMAIL) === false) {
        $errors['email'] = 'Вкажіть коректну електронну адресу.';
    }

    return [$data, $errors];
}
