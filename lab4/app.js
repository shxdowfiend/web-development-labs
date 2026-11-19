// Лабораторна робота №4 — запуск завдань і виведення результатів на сторінку.
import {
  commonTitles, createReadingTracker, describe, friendBooks, groupByGenre,
  mergeUnique, myBooks, shelfStats, sumPages, withDefaults,
} from './functions.js';

const out = (id, text) => { document.getElementById(id).textContent = text; };

// Завдання 1. IIFE — виконується одразу, власні змінні не потрапляють у глобальну область
const environment = (function () {
  const language = navigator.language ?? 'невідомо';
  const screenSize = `${window.screen?.width ?? '?'}×${window.screen?.height ?? '?'}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log('IIFE:', language, screenSize, timeZone);
  return { language, screenSize, timeZone };
})();
out('task1', `Мова браузера: ${environment.language}; екран: ${environment.screenSize}; часовий пояс: ${environment.timeZone}`);

// Завдання 2. reduce і rest-параметр
const stats = shelfStats(myBooks);
out('task2', `Книг: ${stats.count}, сторінок: ${stats.pages}, середня оцінка: ${stats.averageRating}. `
  + `sumPages(352, 328, 464) = ${sumPages(352, 328, 464)}`);

// Завдання 3. spread і Set
const merged = mergeUnique(myBooks, friendBooks);
out('task3', `Разом записів: ${merged.all}, різних книг: ${merged.unique.length}. `
  + `Спільні: ${commonTitles(myBooks, friendBooks).join(', ')}`);

// Завдання 4. Map і for...of з деструктуризацією
const lines = [];
for (const [genre, titles] of groupByGenre([...myBooks, ...friendBooks])) {
  const unique = [...new Set(titles)]; // «Інтернат» є в обох списках — рахуємо один раз
  lines.push(`${genre} (${unique.length}): ${unique.join(', ')}`);
}
out('task4', lines.join('\n'));

// Завдання 5. call, apply, bind
const book = myBooks[0];
const other = friendBooks[1];
const fromCall = describe.call(book, 'Прочитано');
const fromApply = describe.apply(other, ['Хочу прочитати', ' (рекомендація друга)']);
const describeFowler = describe.bind(myBooks[4], 'Зараз читаю');
out('task5', [fromCall, fromApply, describeFowler()].join('\n'));

// Логічні оператори присвоєння та optional chaining
const settings = withDefaults({ pagesPerDay: 0, theme: null });
out('task5b', `withDefaults → тема: ${settings.theme}, сторінок на день: ${settings.pagesPerDay}; `
  + `автор першої книги друга: ${friendBooks[0]?.author ?? '—'}; рік видання: ${friendBooks[0]?.year?.toString() ?? 'не вказано'}`);

// Завдання 6. Замикання — два незалежні трекери
const trackers = {
  fowler: createReadingTracker(448),
  poetry: createReadingTracker(160),
};
const form = document.getElementById('tracker-form');
const error = document.getElementById('tracker-error');

function renderTrackers() {
  for (const [key, tracker] of Object.entries(trackers)) {
    const { read, goal, percent, done } = tracker.progress();
    out(`${key}-text`, `${read} з ${goal} с. (${percent}%)${done ? ' — прочитано! 🎉' : ''}`);
    document.getElementById(`${key}-bar`).style.width = `${percent}%`;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const which = form.elements.book.value;
  const pages = Number(form.elements.pages.value.trim());
  try {
    trackers[which].add(pages);
    error.hidden = true;
    form.elements.pages.value = '';
  } catch (e) {
    error.textContent = e.message;
    error.hidden = false;
  }
  renderTrackers();
});

renderTrackers();
