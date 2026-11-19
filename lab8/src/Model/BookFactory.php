<?php
declare(strict_types=1);

namespace App\Model;

/**
 * Factory: єдине місце, де створюються об'єкти Book —
 * з перевірених даних форми або з рядка бази даних.
 */
final class BookFactory
{
    /** @param array{title:string,author:string,genre:string,pages:int,rating:int,review:string,email:string} $data */
    public function fromForm(array $data, ?int $id = null): Book
    {
        return new Book(
            $id,
            $data['title'],
            $data['author'],
            $data['genre'],
            $data['pages'],
            $data['rating'],
            $data['review'],
            $data['email'],
        );
    }

    public function fromRow(array $row): Book
    {
        return new Book(
            (int) $row['id'],
            $row['title'],
            $row['author'],
            $row['genre'],
            (int) $row['pages'],
            (int) $row['rating'],
            $row['review'],
            $row['email'],
            new \DateTimeImmutable($row['created_at']),
        );
    }
}
