<?php
/**
 * Гра «Вгадай число» (1..100) з обмеженою кількістю спроб.
 * Запуск: php lab6/guess.php [кількість_спроб]
 */
declare(strict_types=1);

namespace Lab6\Guess;

const MIN = 1;
const MAX = 100;

/** Перетворює введений рядок на число з діапазону або повертає null. */
function parseGuess(string $input): ?int
{
    $input = trim($input);
    if (!preg_match('/^-?\d+$/', $input)) {
        return null;
    }
    $number = (int) $input;
    return ($number >= MIN && $number <= MAX) ? $number : null;
}

/**
 * Проводить одну гру.
 * $inputs — будь-яке джерело рядків (STDIN або масив у тестах),
 * $say — функція виводу повідомлень.
 * Повертає ['won' => bool, 'attempts' => int].
 */
function play(int $secret, iterable $inputs, int $maxAttempts = 7, ?callable $say = null): array
{
    $say ??= static function (string $text): void {
        echo $text, PHP_EOL;
    };
    $hint = static fn (int $guess): string => match ($guess <=> $secret) {
        -1 => 'загадане число більше.',
        1 => 'загадане число менше.',
        0 => 'вгадав!',
    };

    $say(sprintf('Я загадав число від %d до %d. У тебе %d спроб.', MIN, MAX, $maxAttempts));
    $attempts = 0;

    foreach ($inputs as $line) {
        $guess = parseGuess($line);
        if ($guess === null) {
            $say(sprintf('«%s» — не число від %d до %d, спробу не зараховано.', trim($line), MIN, MAX));
            continue;
        }
        $attempts++;
        $say(sprintf('Спроба %d: %d — %s', $attempts, $guess, $hint($guess)));

        if ($guess === $secret) {
            $say("Перемога за {$attempts} спроб(и).");
            return ['won' => true, 'attempts' => $attempts];
        }
        if ($attempts >= $maxAttempts) {
            $say("Спроби закінчились. Було загадано {$secret}.");
            return ['won' => false, 'attempts' => $attempts];
        }
    }

    $say('Введення завершено до кінця гри.');
    return ['won' => false, 'attempts' => $attempts];
}

/** Рядки з клавіатури, поки користувач не закриє введення. */
function stdinLines(string $prompt): \Generator
{
    while (true) {
        echo $prompt;
        $line = fgets(STDIN);
        if ($line === false) {
            return;
        }
        yield $line;
    }
}

if (PHP_SAPI === 'cli' && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    $max = isset($argv[1]) ? max(1, (int) $argv[1]) : 7;
    play(random_int(MIN, MAX), stdinLines('Твоє число: '), $max);
}
