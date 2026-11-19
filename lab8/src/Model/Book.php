<?php
declare(strict_types=1);

namespace App\Model;

/** Сутність «книга в журналі». Після створення не змінюється. */
final class Book
{
    public const GENRES = [
        'fiction'    => 'Художня література',
        'nonfiction' => 'Нон-фікшн',
        'poetry'     => 'Поезія',
        'tech'       => 'Технічна література',
        'other'      => 'Інше',
    ];

    public function __construct(
        public readonly ?int $id,
        public readonly string $title,
        public readonly string $author,
        public readonly string $genre,
        public readonly int $pages,
        public readonly int $rating,
        public readonly string $review,
        public readonly string $email,
        public readonly ?\DateTimeImmutable $createdAt = null,
    ) {
    }

    public function genreName(): string
    {
        return self::GENRES[$this->genre] ?? $this->genre;
    }

    public function stars(): string
    {
        return str_repeat('★', $this->rating) . str_repeat('☆', 5 - $this->rating);
    }
}
