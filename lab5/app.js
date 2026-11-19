// Лабораторна робота №5 — сторінка керування бібліотекою.
import { Library, Reader } from './library.js';

const library = Library.createDemo();
const readers = [new Reader('Ростислав', 2), new Reader('Олена', 3)];
let dayOffset = 0; // «машина часу» для перевірки прострочення
const DAY = 24 * 60 * 60 * 1000;
const now = () => new Date(Date.now() + dayOffset * DAY);

const $ = (id) => document.getElementById(id);
const readerSelect = $('reader');
const itemSelect = $('item');
const message = $('message');
const dateFormat = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' });

readers.forEach((reader, index) => readerSelect.add(new Option(String(reader), String(index))));
library.items.forEach((item) => itemSelect.add(new Option(`№${item.id} · ${item.title}`, String(item.id))));

function say(text, ok = true) {
  message.textContent = text;
  message.className = `rounded-lg px-3 py-2 ${ok ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-800'}`;
  message.hidden = false;
}

function render() {
  $('today').textContent = dateFormat.format(now());
  $('free-count').textContent = String(library.available().length);

  const rows = library.items.map((item) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-paper';
    const status = item.available ? 'у бібліотеці' : 'видано';
    for (const text of [`№${item.id}`, item.describe(), `${item.loanDays} дн.`, status]) {
      const td = document.createElement('td');
      td.className = 'px-2 py-2 align-top';
      td.textContent = text;
      tr.append(td);
    }
    tr.lastChild.className += item.available ? ' text-sage' : ' font-semibold text-leather';
    return tr;
  });
  $('catalog').replaceChildren(...rows);

  const loans = readers.flatMap((reader) => library.loansOf(reader));
  $('loans-empty').hidden = loans.length > 0;
  $('loans').replaceChildren(...loans.map(({ item, reader, dueAt }) => {
    const li = document.createElement('li');
    const late = Library.startOfDay(now()) > Library.startOfDay(dueAt); // та сама логіка, що й у штрафі
    li.className = `rounded-lg p-3 ${late ? 'bg-red-50' : 'bg-paper'}`;
    li.textContent = `${reader.name}: «${item.title}» — повернути до ${dateFormat.format(dueAt)}${late ? ' (прострочено!)' : ''}`;
    return li;
  }));
}

$('borrow').addEventListener('click', () => {
  const reader = readers[Number(readerSelect.value)];
  try {
    const due = library.borrow(itemSelect.value, reader, now());
    const title = itemSelect.selectedOptions[0].text.split(' · ')[1];
    say(`Читач: ${reader.name}. Видано «${title}», повернути до ${dateFormat.format(due)}.`);
  } catch (error) {
    say(error.message, false);
  }
  render();
});

$('return').addEventListener('click', () => {
  try {
    const { item, reader, daysLate, fine } = library.giveBack(itemSelect.value, now());
    say(daysLate === 0
      ? `Читач: ${reader.name}. «${item.title}» повернуто вчасно.`
      : `Читач: ${reader.name}. «${item.title}» повернуто із запізненням ${daysLate} дн. Штраф: ${fine} грн.`, daysLate === 0);
  } catch (error) {
    say(error.message, false);
  }
  render();
});

$('skip').addEventListener('click', () => {
  dayOffset += 10;
  say(`Час перемотано на 10 днів уперед.`);
  render();
});

render();
