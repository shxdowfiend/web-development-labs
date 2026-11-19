// Модульні тести лабораторної №4. Запуск: node --test tests/lab4.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  commonTitles, createReadingTracker, describe, friendBooks, groupByGenre,
  mergeUnique, myBooks, shelfStats, sumPages, withDefaults,
} from '../lab4/functions.js';

test('reduce: статистика полиці та rest-параметр', () => {
  assert.deepEqual(shelfStats(myBooks), { count: 5, pages: 1892, averageRating: 4.6 });
  assert.deepEqual(shelfStats([]), { count: 0, pages: 0, averageRating: 0 });
  assert.throws(() => shelfStats([{ pages: 'багато', rating: 5 }]), TypeError);
  assert.equal(sumPages(352, 328, 464), 1144);
  assert.equal(sumPages(), 0);
});

test('spread і Set: об’єднання без повторів та перетин', () => {
  const merged = mergeUnique(myBooks, friendBooks);
  assert.equal(merged.all, 9);
  assert.equal(merged.unique.length, 7);
  assert.deepEqual(commonTitles(myBooks, friendBooks), ['Інтернат', 'Чистий код']);
});

test('Map: групування за жанрами зберігає порядок', () => {
  const groups = groupByGenre(myBooks);
  assert.deepEqual([...groups.keys()], ['Проза', 'Технічна', 'Поезія']);
  assert.deepEqual(groups.get('Технічна'), ['Чистий код', 'Рефакторинг']);
});

test('call, apply, bind змінюють this', () => {
  assert.equal(describe.call(myBooks[0], 'Прочитано'), 'Прочитано: «Тигролови» — Іван Багряний');
  assert.equal(describe.apply(friendBooks[1], ['Хочу', '!']), 'Хочу: «Лісова пісня» — Леся Українка!');
  const bound = describe.bind(myBooks[4], 'Зараз читаю');
  assert.equal(bound.call(myBooks[0]), 'Зараз читаю: «Рефакторинг» — Мартін Фаулер', 'bind не перевизначається call');
});

test('замикання: незалежні трекери та перевірка аргументів', () => {
  const a = createReadingTracker(448);
  const b = createReadingTracker(160);
  a.add(100); a.add(50); b.add(200);
  assert.deepEqual(a.progress(), { read: 150, goal: 448, percent: 33, done: false });
  assert.deepEqual(b.progress(), { read: 160, goal: 160, percent: 100, done: true });
  assert.equal('read' in a, false, 'лічильник прихований');
  assert.throws(() => a.add(-5), RangeError);
  assert.throws(() => a.add(2.5), RangeError);
  assert.throws(() => createReadingTracker(0), RangeError);
});

test('логічні оператори присвоєння', () => {
  assert.deepEqual(withDefaults({ pagesPerDay: 0, theme: null }), { pagesPerDay: 20, theme: 'light' });
  assert.deepEqual(withDefaults({ theme: 'dark', pagesPerDay: 35, notify: 'yes' }), { theme: 'dark', pagesPerDay: 35, notify: false });
});
