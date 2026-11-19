<?php
/**
 * Консольний калькулятор: вирази виду «число оператор число».
 * Оператори: +  -  *  /  %  **
 * Запуск: php lab6/calculator.php   (вихід — порожній рядок або «exit»)
 */
declare(strict_types=1);

namespace Lab6\Calculator;

const NUMBER = '-?\d+(?:[.,]\d+)?';

/** Розбирає вираз на [ліве число, оператор, праве число] або кидає виняток. */
function parse(string $expression): array
{
    $pattern = '/^\s*(' . NUMBER . ')\s*(\*\*|[-+*\/%])\s*(' . NUMBER . ')\s*$/u';
    if (!preg_match($pattern, $expression, $m)) {
        throw new \InvalidArgumentException('Не вдалося розібрати вираз. Приклад: 12.5 * 4');
    }
    $toNumber = static fn (string $s): int|float =>
        str_contains($s, '.') || str_contains($s, ',') ? (float) str_replace(',', '.', $s) : (int) $s;

    return [$toNumber($m[1]), $m[2], $toNumber($m[3])];
}

/** Обчислює результат однієї операції. */
function calculate(int|float $a, string $operator, int|float $b): int|float
{
    $operations = [
        '+' => static fn ($x, $y) => $x + $y,
        '-' => static fn ($x, $y) => $x - $y,
        '*' => static fn ($x, $y) => $x * $y,
        '/' => static function ($x, $y) {
            if ($y == 0) {
                throw new \DivisionByZeroError('Ділити на нуль не можна.');
            }
            return $x / $y;
        },
        '%' => static function ($x, $y) {
            if (!is_int($x) || !is_int($y)) {
                throw new \InvalidArgumentException('Остача від ділення рахується лише для цілих чисел.');
            }
            if ($y === 0) {
                throw new \DivisionByZeroError('Ділити на нуль не можна.');
            }
            return $x % $y;
        },
        '**' => static fn ($x, $y) => $x ** $y,
    ];

    $result = $operations[$operator]($a, $b);
    if (is_float($result) && !is_finite($result)) {
        throw new \RangeException('Результат занадто великий.');
    }
    return $result;
}

/** Повертає готовий до виводу рядок: результат або текст помилки. */
function evaluate(string $expression): string
{
    try {
        $result = calculate(...parse($expression));
        return is_float($result) ? rtrim(rtrim(sprintf('%.10F', $result), '0'), '.') : (string) $result;
    } catch (\Throwable $e) {
        return 'Помилка: ' . $e->getMessage();
    }
}

if (PHP_SAPI === 'cli' && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    echo 'Калькулятор. Оператори: + - * / % **. Порожній рядок або exit — вихід.', PHP_EOL;
    while (true) {
        echo '> ';
        $line = fgets(STDIN);
        if ($line === false || trim($line) === '' || trim($line) === 'exit') {
            break;
        }
        echo '= ', evaluate($line), PHP_EOL;
    }
}
