// Лабораторна робота №4 — функції, масиви, Set/Map, контекст і замикання.
// Усі функції чисті (крім IIFE), тому їх перевіряють модульні тести.

/** Навчальні дані: мій список прочитаного та список друга. */
export const myBooks = [
  { title: 'Тигролови', author: 'Іван Багряний', genre: 'Проза', pages: 352, rating: 5 },
  { title: 'Інтернат', author: 'Сергій Жадан', genre: 'Проза', pages: 328, rating: 5 },
  { title: 'Чистий код', author: 'Роберт Мартін', genre: 'Технічна', pages: 464, rating: 4 },
  { title: 'Кобзар', author: 'Тарас Шевченко', genre: 'Поезія', pages: 300, rating: 5 },
  { title: 'Рефакторинг', author: 'Мартін Фаулер', genre: 'Технічна', pages: 448, rating: 4 },
];
export const friendBooks = [
  { title: 'Інтернат', author: 'Сергій Жадан', genre: 'Проза', pages: 328, rating: 4 },
  { title: 'Лісова пісня', author: 'Леся Українка', genre: 'Поезія', pages: 160, rating: 5 },
  { title: 'Чистий код', author: 'Роберт Мартін', genre: 'Технічна', pages: 464, rating: 5 },
  { title: 'Місто', author: 'Валер’ян Підмогильний', genre: 'Проза', pages: 288, rating: 4 },
];

function assertBooks(books) {
  if (!Array.isArray(books) || !books.every((b) => b && Number.isFinite(b.pages) && Number.isFinite(b.rating))) {
    throw new TypeError('Очікується масив книг із числовими pages і rating.');
  }
}

/** Завдання 2. reduce: загальна кількість сторінок і середня оцінка. */
export function shelfStats(books) {
  assertBooks(books);
  const totals = books.reduce(
    (acc, book) => ({ pages: acc.pages + book.pages, rating: acc.rating + book.rating }),
    { pages: 0, rating: 0 },
  );
  return {
    count: books.length,
    pages: totals.pages,
    averageRating: books.length === 0 ? 0 : Math.round((totals.rating / books.length) * 10) / 10,
  };
}

/** Rest-параметр: сума будь-якої кількості чисел. */
export function sumPages(...numbers) {
  return numbers.reduce((sum, n) => sum + n, 0);
}

/** Завдання 3. Spread + Set: об'єднання двох списків без повторів назв. */
export function mergeUnique(first, second) {
  const all = [...first, ...second];
  const titles = new Set(all.map((book) => book.title));
  return { all: all.length, unique: [...titles] };
}

/** Спільні книги двох списків (перетин множин). */
export function commonTitles(first, second) {
  const mine = new Set(first.map((b) => b.title));
  return [...new Set(second.map((b) => b.title))].filter((title) => mine.has(title));
}

/** Завдання 4. Map: жанр → список назв, у порядку першої появи жанру. */
export function groupByGenre(books) {
  const groups = new Map();
  for (const { genre, title } of books) {
    if (!groups.has(genre)) groups.set(genre, []);
    groups.get(genre).push(title);
  }
  return groups;
}

/** Завдання 5. Функція, що читає дані з this — для call / apply / bind. */
export function describe(prefix = 'Книга', suffix = '') {
  return `${prefix}: «${this.title}» — ${this.author}${suffix}`;
}

/**
 * Завдання 6. Замикання: трекер читання з ціллю.
 * Лічильник прочитаних сторінок недоступний ззовні — лише через методи.
 */
export function createReadingTracker(goal) {
  if (!Number.isInteger(goal) || goal <= 0) throw new RangeError('Ціль — додатне ціле число сторінок.');
  let read = 0;
  return {
    add(pages) {
      if (!Number.isInteger(pages) || pages <= 0) throw new RangeError('Кількість сторінок — додатне ціле число.');
      read = Math.min(goal, read + pages);
      return read;
    },
    progress() {
      return { read, goal, percent: Math.round((read / goal) * 100), done: read >= goal };
    },
  };
}

/** Логічні оператори присвоєння: заповнює відсутні налаштування. */
export function withDefaults(settings = {}) {
  const result = { ...settings };
  result.theme ??= 'light';      // лише якщо null або undefined
  result.pagesPerDay ||= 20;     // якщо хибне значення (0, '', undefined)
  result.notify &&= result.notify === true; // нормалізує лише вже істинне значення
  return result;
}
