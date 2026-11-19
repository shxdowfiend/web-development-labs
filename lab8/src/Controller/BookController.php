<?php
declare(strict_types=1);

namespace App\Controller;

use App\Http\FormHandler;
use App\Http\Session;
use App\Http\View;
use App\Model\Book;
use App\Repository\BookRepository;

/** Controller: обирає дію за маршрутом, повертає потрібний HTTP-код і шаблон. */
final class BookController
{
    private const EMPTY_FORM = ['title' => '', 'author' => '', 'genre' => '', 'pages' => '', 'rating' => 5, 'review' => '', 'email' => ''];

    public function __construct(
        private BookRepository $books,
        private FormHandler $forms,
        private Session $session,
        private View $view,
    ) {
    }

    public function dispatch(string $action, string $method): void
    {
        match ($action) {
            'list'   => $this->list(),
            'create' => $this->create($method),
            'edit'   => $this->edit($method),
            'delete' => $this->delete($method),
            default  => $this->error(404, 'Сторінку не знайдено.'),
        };
    }

    private function list(): void
    {
        $sort = is_string($_GET['sort'] ?? null) ? $_GET['sort'] : 'created_at';
        $dir = is_string($_GET['dir'] ?? null) ? $_GET['dir'] : 'desc';

        $this->view->render('list', [
            'books'   => $this->books->all($sort, $dir),
            'sort'    => $sort,
            'dir'     => strtolower($dir) === 'asc' ? 'asc' : 'desc',
            'message' => $this->session->takeFlash(),
            'csrf'    => $this->session->csrfToken(),
        ]);
    }

    private function create(string $method): void
    {
        if ($method !== 'POST') {
            $this->form('Нова книга в журналі', self::EMPTY_FORM, [], null);
            return;
        }
        if (!$this->session->csrfValid($_POST['csrf'] ?? null)) {
            $this->error(403, 'Недійсний CSRF-токен. Оновіть сторінку та спробуйте ще раз.');
            return;
        }
        $result = $this->forms->handle($_POST);
        if ($result['book'] === null) {
            $this->form('Нова книга в журналі', $result['data'], $result['errors'], null, 422);
            return;
        }
        $this->books->add($result['book']);
        $this->redirectWith('Книгу «' . $result['book']->title . '» додано до журналу.');
    }

    private function edit(string $method): void
    {
        $book = $this->findRequested();
        if ($book === null) {
            return;
        }
        if ($method !== 'POST') {
            $this->form('Редагування книги', FormHandler::dataFrom($book), [], $book->id);
            return;
        }
        if (!$this->session->csrfValid($_POST['csrf'] ?? null)) {
            $this->error(403, 'Недійсний CSRF-токен. Оновіть сторінку та спробуйте ще раз.');
            return;
        }
        $result = $this->forms->handle($_POST, $book->id);
        if ($result['book'] === null) {
            $this->form('Редагування книги', $result['data'], $result['errors'], $book->id, 422);
            return;
        }
        $this->books->update($result['book']);
        $this->redirectWith('Зміни до книги «' . $result['book']->title . '» збережено.');
    }

    private function delete(string $method): void
    {
        if ($method !== 'POST') {
            header('Allow: POST');
            $this->error(405, 'Видалення виконується лише кнопкою на сторінці журналу (метод POST).');
            return;
        }
        if (!$this->session->csrfValid($_POST['csrf'] ?? null)) {
            $this->error(403, 'Недійсний CSRF-токен. Оновіть сторінку та спробуйте ще раз.');
            return;
        }
        $book = $this->findRequested();
        if ($book === null) {
            return;
        }
        $this->books->delete($book->id);
        $this->redirectWith('Книгу «' . $book->title . '» видалено з журналу.');
    }

    /** Шукає книгу за id з GET або POST; якщо її немає — показує 404. */
    private function findRequested(): ?Book
    {
        $raw = $_POST['id'] ?? $_GET['id'] ?? null;
        $id = is_string($raw) ? filter_var($raw, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) : false;
        $book = $id === false ? null : $this->books->find($id);
        if ($book === null) {
            $this->error(404, 'Книгу не знайдено.');
        }
        return $book;
    }

    private function form(string $title, array $data, array $errors, ?int $id, int $status = 200): void
    {
        $this->view->render('form', [
            'pageTitle' => $title,
            'data'      => $data,
            'errors'    => $errors,
            'id'        => $id,
            'csrf'      => $this->session->csrfToken(),
            'genres'    => Book::GENRES,
        ], $status);
    }

    private function error(int $status, string $message): void
    {
        $this->view->render('error', ['status' => $status, 'message' => $message], $status);
    }

    private function redirectWith(string $message): void
    {
        $this->session->flash($message);
        header('Location: index.php', true, 303);
    }
}
