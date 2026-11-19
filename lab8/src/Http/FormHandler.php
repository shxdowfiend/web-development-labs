<?php
declare(strict_types=1);

namespace App\Http;

use App\Model\Book;
use App\Model\BookFactory;
use App\Validation\BookValidator;

/**
 * Збирає поля форми, перевіряє їх і, якщо все гаразд, створює Book через фабрику.
 * Один обробник використовується і для додавання, і для редагування.
 */
final class FormHandler
{
    public function __construct(private BookValidator $validator, private BookFactory $factory)
    {
    }

    /** @return array{book: ?Book, data: array, errors: array<string,string>} */
    public function handle(array $post, ?int $id = null): array
    {
        [$data, $errors] = $this->validator->validate($post);

        return [
            'book'   => $errors ? null : $this->factory->fromForm($data, $id),
            'data'   => $data,
            'errors' => $errors,
        ];
    }

    /** Значення полів для форми редагування існуючої книги. */
    public static function dataFrom(Book $book): array
    {
        return [
            'title' => $book->title, 'author' => $book->author, 'genre' => $book->genre,
            'pages' => $book->pages, 'rating' => $book->rating, 'review' => $book->review, 'email' => $book->email,
        ];
    }
}
