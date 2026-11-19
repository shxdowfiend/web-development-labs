<?php
/**
 * Гра «Камінь, ножиці, папір» — три раунди проти комп'ютера.
 * Хід вводиться числом (0 — камінь, 1 — ножиці, 2 — папір) або словом.
 * Запуск: php lab6/rps.php
 */
declare(strict_types=1);

namespace Lab6\Rps;

const MOVES = ['камінь', 'ножиці', 'папір'];
const ROUNDS = 3;

/** Приймає «0»/«1»/«2» або назву ходу; повертає індекс ходу чи null. */
function parseMove(string $input): ?int
{
    $input = mb_strtolower(trim($input));
    if (preg_match('/^[0-2]$/', $input)) {
        return (int) $input;
    }
    $index = array_search($input, MOVES, true);
    return $index === false ? null : $index;
}

/**
 * Хто переміг у раунді: 'user', 'computer' або 'draw'.
 * Кожен хід перемагає наступний за ним по колу:
 * камінь → ножиці → папір → камінь.
 */
function winner(int $user, int $computer): string
{
    return match (($user - $computer + 3) % 3) {
        0 => 'draw',
        2 => 'user',
        1 => 'computer',
    };
}

/**
 * Три раунди гри. $computerMove — функція, що повертає хід комп'ютера
 * (у звичайній грі випадковий, у тестах — заданий).
 */
function play(iterable $inputs, callable $computerMove, ?callable $say = null): array
{
    $say ??= static function (string $text): void {
        echo $text, PHP_EOL;
    };
    $score = ['user' => 0, 'computer' => 0, 'draw' => 0];
    $round = 0;

    $say('Камінь, ножиці, папір! Раундів: ' . ROUNDS . '. Ходи: 0 — камінь, 1 — ножиці, 2 — папір.');
    foreach ($inputs as $line) {
        $user = parseMove($line);
        if ($user === null) {
            $say("Невідомий хід «" . trim($line) . "», спробуй ще раз.");
            continue;
        }
        $round++;
        $computer = $computerMove();
        $result = winner($user, $computer);
        $score[$result]++;

        $text = ['user' => 'раунд твій', 'computer' => 'раунд комп\'ютера', 'draw' => 'нічия'][$result];
        $say(sprintf('Раунд %d: ти — %s, комп\'ютер — %s: %s.', $round, MOVES[$user], MOVES[$computer], $text));

        if ($round === ROUNDS) {
            break;
        }
    }

    $final = $score['user'] <=> $score['computer'];
    $say(sprintf('Рахунок %d:%d (нічиїх: %d). %s', $score['user'], $score['computer'], $score['draw'],
        match ($final) { 1 => 'Ти переміг!', -1 => 'Переміг комп\'ютер.', 0 => 'Загальна нічия.' }));

    return $score;
}

if (PHP_SAPI === 'cli' && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    $lines = (static function (): \Generator {
        while (true) {
            echo 'Твій хід: ';
            $line = fgets(STDIN);
            if ($line === false) {
                return;
            }
            yield $line;
        }
    })();
    play($lines, static fn (): int => random_int(0, 2));
}
