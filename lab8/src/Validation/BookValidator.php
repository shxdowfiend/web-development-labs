<?php
declare(strict_types=1);

namespace App\Validation;

use App\Model\Book;

/** Правила перевірки полів книги. Нічого не знає про HTTP чи базу даних. */
final class BookValidator
{
    /** @return array{0: array, 1: array<string,string>} [очищені дані, помилки] */
    public function validate(array $input): array
    {
        $text = static fn (string $key): string => is_string($input[$key] ?? null) ? trim($input[$key]) : '';
        $data = [];
        foreach (['title', 'author', 'genre', 'pages', 'rating', 'review', 'email'] as $field) {
            $data[$field] = $text($field);
        }
        $errors = [];

        $this->length($errors, 'title', $data['title'], 1, 150, 'Назва — від 1 до 150 символів.');
        $this->length($errors, 'author', $data['author'], 1, 100, 'Автор — від 1 до 100 символів.');
        $this->length($errors, 'review', $data['review'], 10, 2000, 'Враження — від 10 до 2000 символів.');

        if (!array_key_exists($data['genre'], Book::GENRES)) {
            $errors['genre'] = 'Оберіть жанр зі списку.';
        }

        $data['pages'] = $this->integer($errors, 'pages', $data['pages'], 1, 5000, 'Кількість сторінок — ціле число від 1 до 5000.');
        $data['rating'] = $this->integer($errors, 'rating', $data['rating'], 1, 5, 'Оцінка — від 1 до 5.');

        if (filter_var($data['email'], FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'Вкажіть коректну електронну адресу.';
        }

        return [$data, $errors];
    }

    private function length(array &$errors, string $field, string $value, int $min, int $max, string $message): void
    {
        $length = mb_strlen($value);
        if ($length < $min || $length > $max) {
            $errors[$field] = $message;
        }
    }

    private function integer(array &$errors, string $field, string $value, int $min, int $max, string $message): int|string
    {
        $number = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => $min, 'max_range' => $max]]);
        if ($number === false) {
            $errors[$field] = $message;
            return $value;
        }
        return $number;
    }
}
