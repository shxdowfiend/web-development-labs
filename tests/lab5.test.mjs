// Модульні тести лабораторної №5. Запуск: node --test tests/lab5.test.mjs
import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { AudioBook, Book, Library, LibraryItem, Magazine, Reader } from '../lab5/library.js';

const DAY = 24 * 60 * 60 * 1000;
const start = new Date(2026, 10, 1, 12, 0);
const after = (days) => new Date(start.getTime() + days * DAY);
let library;
let rostyslav;

beforeEach(() => {
  LibraryItem.resetIds();
  library = Library.createDemo();
  rostyslav = new Reader('Ростислав', 2);
});

test('наслідування, перевизначення та ланцюжок прототипів', () => {
  const [book, , , magazine, audio] = library.items;
  assert.ok(audio instanceof AudioBook && audio instanceof Book && audio instanceof LibraryItem);
  assert.equal(Object.getPrototypeOf(AudioBook.prototype), Book.prototype);
  assert.deepEqual([book.loanDays, magazine.loanDays, audio.loanDays], [21, 7, 10]);
  assert.equal(book.describe(), 'Книга «Тигролови», Іван Багряний, 352 с.');
  assert.equal(magazine.describe(), 'Журнал «Країна знань», випуск 2026/10');
  assert.equal(audio.describe(), 'Аудіокнига «Лісова пісня», Леся Українка, 2 год 55 хв');
  assert.throws(() => new LibraryItem('X'), TypeError, 'абстрактний клас');
});

test('функція-конструктор Reader і прототип', () => {
  assert.equal(String(rostyslav), 'Ростислав (до 2 прим.)');
  assert.equal(Object.hasOwn(rostyslav, 'toString'), false, 'метод у прототипі, а не в об’єкті');
  assert.throws(() => Reader('Без new'), TypeError);
});

test('приватні поля недоступні ззовні', () => {
  const book = library.items[0];
  assert.equal(book.available, true);
  // у модулі діє strict mode: властивість має лише getter, тому присвоєння кидає TypeError
  assert.throws(() => { book.available = false; }, TypeError);
  assert.equal(book.available, true);
  assert.equal(Object.keys(library).length, 0, 'каталог і видачі приховані');
});

test('видача та строки повернення', () => {
  assert.deepEqual(library.borrow(1, rostyslav, start), after(21));
  assert.deepEqual(library.borrow(4, rostyslav, start), after(7));
  assert.equal(library.available().length, 3);
  assert.equal(library.loansOf(rostyslav).length, 2);
});

test('номер примірника рядком (як із <select>) працює так само', () => {
  library.borrow('3', rostyslav, start);
  const [loan] = library.loansOf(rostyslav);
  assert.equal(loan.item.title, 'Чистий код');
  assert.equal(library.giveBack('3', after(1)).daysLate, 0);
  assert.equal(library.loansOf(rostyslav).length, 0);
});

test('помилки: вже видано, ліміт читача, невідомий номер, повернення без видачі', () => {
  const olena = new Reader('Олена', 3);
  library.borrow(1, rostyslav, start);
  assert.throws(() => library.borrow(1, olena, start), /вже видано/);
  library.borrow(2, rostyslav, start);
  assert.throws(() => library.borrow(3, rostyslav, start), /вже має 2 прим/);
  assert.throws(() => library.borrow(99, olena, start), /немає в каталозі/);
  assert.throws(() => library.giveBack(5), /ніхто не брав/);
  assert.equal(library.available().length, 3, 'невдалі операції нічого не змінили');
});

test('повернення вчасно та штраф за прострочення (статичне поле)', () => {
  library.borrow(1, rostyslav, start);
  assert.deepEqual(
    (({ daysLate, fine }) => ({ daysLate, fine }))(library.giveBack(1, after(20))),
    { daysLate: 0, fine: 0 },
  );
  library.borrow(4, rostyslav, start); // журнал, 7 днів
  const result = library.giveBack(4, after(12));
  assert.equal(result.daysLate, 5);
  assert.equal(result.fine, 5 * Library.FINE_PER_DAY);
  assert.equal(library.available().length, 5);
  // кілька хвилин після строку того ж дня — ще вчасно; наступного дня — 1 день
  library.borrow(4, rostyslav, start);
  assert.equal(library.giveBack(4, new Date(after(7).getTime() + 5 * 60 * 1000)).daysLate, 0);
  library.borrow(4, rostyslav, start);
  assert.equal(library.giveBack(4, new Date(after(10).getTime() + 2000)).daysLate, 3);
});
