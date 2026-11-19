// Модульні тести розрахунків лабораторної №3. Запуск: node --test tests/lab3.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ValidationError, daysWord, formatDuration, parseField, plan, readingMinutes } from '../lab3/calc.js';

test('розбір полів: кома, пробіли, необов’язкове поле', () => {
  assert.equal(parseField('pages', ' 448 '), 448);
  assert.equal(parseField('speed', '32,5'), 32.5);
  assert.equal(parseField('daily', '', { optional: true }), null);
});

test('некоректні значення відхиляються з назвою поля', () => {
  for (const bad of ['', 'abc', '-5', '0', '12.5', '1e3', '0x10', 'Infinity', '20000']) {
    assert.throws(() => parseField('pages', bad), (e) => e instanceof ValidationError && e.field === 'pages', bad);
  }
  assert.throws(() => parseField('speed', '301'), ValidationError);
  assert.throws(() => parseField('daily', '3'), ValidationError);
});

test('час читання та форматування', () => {
  assert.equal(readingMinutes(320, 40), 480);
  assert.equal(readingMinutes(100, 30), 200);
  assert.equal(readingMinutes(1, 300), 1); // округлення вгору
  assert.equal(formatDuration(480), '8 год');
  assert.equal(formatDuration(200), '3 год 20 хв');
  assert.equal(formatDuration(45), '45 хв');
});

test('форма слова «день»', () => {
  const expected = { 1: 'день', 2: 'дні', 4: 'дні', 5: 'днів', 11: 'днів', 14: 'днів', 21: 'день', 22: 'дні', 111: 'днів' };
  for (const [n, word] of Object.entries(expected)) assert.equal(daysWord(Number(n)), word, n);
});

test('план із щоденним лімітом і датою завершення', () => {
  const result = plan({ pages: 448, speed: 40, daily: 45, today: new Date(2026, 10, 19) });
  assert.equal(result.minutes, 672);
  assert.equal(result.duration, '11 год 12 хв');
  assert.equal(result.days, 15);
  assert.equal(result.finish.toDateString(), new Date(2026, 11, 3).toDateString());
  assert.equal(plan({ pages: 120, speed: 60 }).days, null);
});
