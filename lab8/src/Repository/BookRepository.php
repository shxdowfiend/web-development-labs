<?php
declare(strict_types=1);

namespace App\Repository;

use App\Model\Book;
use App\Model\BookFactory;
use PDO;

/** Repository: увесь SQL для таблиці books зібрано тут (CRUD). */
final class BookRepository
{
    private const SORTABLE = ['created_at', 'title', 'pages', 'rating'];

    public function __construct(private PDO $pdo, private BookFactory $factory)
    {
    }

    /** @return Book[] */
    public function all(string $sort = 'created_at', string $dir = 'desc'): array
    {
        $column = in_array($sort, self::SORTABLE, true) ? $sort : 'created_at';
        $direction = strtolower($dir) === 'asc' ? 'ASC' : 'DESC';
        $rows = $this->pdo->query("SELECT * FROM books ORDER BY {$column} {$direction}, id {$direction}")->fetchAll();

        return array_map([$this->factory, 'fromRow'], $rows);
    }

    public function find(int $id): ?Book
    {
        $stmt = $this->pdo->prepare('SELECT * FROM books WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ? $this->factory->fromRow($row) : null;
    }

    public function add(Book $book): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO books (title, author, genre, pages, rating, review, email)
             VALUES (:title, :author, :genre, :pages, :rating, :review, :email)'
        );
        $stmt->execute($this->params($book));

        return (int) $this->pdo->lastInsertId();
    }

    public function update(Book $book): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE books SET title = :title, author = :author, genre = :genre, pages = :pages,
                    rating = :rating, review = :review, email = :email
             WHERE id = :id'
        );
        $stmt->execute($this->params($book) + [':id' => $book->id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM books WHERE id = :id');
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() === 1;
    }

    private function params(Book $book): array
    {
        return [
            ':title'  => $book->title,
            ':author' => $book->author,
            ':genre'  => $book->genre,
            ':pages'  => $book->pages,
            ':rating' => $book->rating,
            ':review' => $book->review,
            ':email'  => $book->email,
        ];
    }
}
