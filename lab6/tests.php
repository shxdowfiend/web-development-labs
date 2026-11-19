<?php
/**
 * Автоматична перевірка трьох програм лабораторної №6.
 * Запуск: php lab6/tests.php
 */
declare(strict_types=1);

require __DIR__ . '/guess.php';
require __DIR__ . '/rps.php';
require __DIR__ . '/calculator.php';

use function Lab6\Calculator\evaluate;

$passed = 0;
$failed = 0;
function check(string $name, mixed $actual, mixed $expected): void
{
    global $passed, $failed;
    if ($actual === $expected) {
        $passed++;
        echo "  OK   {$name}", PHP_EOL;
    } else {
        $failed++;
        echo "  FAIL {$name}: очікувалось " . var_export($expected, true) . ', отримано ' . var_export($actual, true), PHP_EOL;
    }
}
$silent = static function (string $text): void {};

echo 'Вгадай число', PHP_EOL;
check('коректне число', Lab6\Guess\parseGuess(' 42 '), 42);
check('поза діапазоном', Lab6\Guess\parseGuess('150'), null);
check('дробове число', Lab6\Guess\parseGuess('3.5'), null);
check('текст', Lab6\Guess\parseGuess('abc'), null);
check('перемога з 3-ї спроби', Lab6\Guess\play(37, ['50', '25', '37'], 7, $silent), ['won' => true, 'attempts' => 3]);
check('помилкове введення не рахується', Lab6\Guess\play(10, ['x', '', '10'], 7, $silent), ['won' => true, 'attempts' => 1]);
check('вичерпано спроби', Lab6\Guess\play(99, ['1', '2', '3'], 3, $silent), ['won' => false, 'attempts' => 3]);

echo 'Камінь, ножиці, папір', PHP_EOL;
check('хід словом', Lab6\Rps\parseMove('Папір'), 2);
check('хід числом', Lab6\Rps\parseMove('1'), 1);
check('невідомий хід', Lab6\Rps\parseMove('ящірка'), null);
$expected = [
    [0, 0, 'draw'], [0, 1, 'user'], [0, 2, 'computer'],
    [1, 0, 'computer'], [1, 1, 'draw'], [1, 2, 'user'],
    [2, 0, 'user'], [2, 1, 'computer'], [2, 2, 'draw'],
];
foreach ($expected as [$u, $c, $w]) {
    check(Lab6\Rps\MOVES[$u] . ' проти ' . Lab6\Rps\MOVES[$c], Lab6\Rps\winner($u, $c), $w);
}
$moves = [1, 0, 1]; // камінь↔ножиці (ти), камінь↔камінь (нічия), папір↔ножиці (комп'ютер)
$i = 0;
check('гра з трьох раундів', Lab6\Rps\play(['0', 'бла', '0', '2'], static function () use (&$i, $moves) { return $moves[$i++]; }, $silent),
    ['user' => 1, 'computer' => 1, 'draw' => 1]);

echo 'Калькулятор', PHP_EOL;
check('12 + 30', evaluate('12 + 30'), '42');
check('7 - 10', evaluate('7 - 10'), '-3');
check('2,5 * 4', evaluate('2,5 * 4'), '10');
check('9 / 4', evaluate('9 / 4'), '2.25');
check('17 % 5', evaluate('17 % 5'), '2');
check('3 ** 4', evaluate('3 ** 4'), '81');
check('ділення на нуль', evaluate('5 / 0'), 'Помилка: Ділити на нуль не можна.');
check('остача від дробу', evaluate('5.5 % 2'), 'Помилка: Остача від ділення рахується лише для цілих чисел.');
check('неправильний вираз', str_starts_with(evaluate('два плюс два'), 'Помилка: Не вдалося'), true);
check('переповнення', evaluate('10.0 ** 400'), 'Помилка: Результат занадто великий.');

echo PHP_EOL, "Пройдено: {$passed}, з помилками: {$failed}", PHP_EOL;
exit($failed === 0 ? 0 : 1);
