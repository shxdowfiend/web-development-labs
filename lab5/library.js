// Лабораторна робота №5 — ООП-модель шкільної бібліотеки.
// Класи, наслідування, приватні поля, статичні методи та функція-конструктор.

const DAY = 24 * 60 * 60 * 1000;

/** Базовий клас для всього, що можна взяти в бібліотеці. */
export class LibraryItem {
  static #nextId = 1;
  #available = true;

  constructor(title) {
    if (new.target === LibraryItem) throw new TypeError('LibraryItem — абстрактний клас, створюйте Book, Magazine або AudioBook.');
    if (typeof title !== 'string' || title.trim() === '') throw new TypeError('Назва не може бути порожньою.');
    this.id = LibraryItem.#nextId++;
    this.title = title.trim();
  }

  get available() { return this.#available; }

  /** Скільки днів можна тримати примірник. Перевизначається в нащадках. */
  get loanDays() { return 14; }

  get kind() { return 'Примірник'; }

  describe() { return `${this.kind} «${this.title}»`; }

  // Змінювати доступність може лише бібліотека через ці методи
  checkOut() {
    if (!this.#available) throw new Error(`«${this.title}» вже видано.`);
    this.#available = false;
  }

  checkIn() {
    if (this.#available) throw new Error(`«${this.title}» і так є в бібліотеці.`);
    this.#available = true;
  }

  static resetIds() { LibraryItem.#nextId = 1; }
}

export class Book extends LibraryItem {
  constructor(title, author, pages) {
    super(title);
    this.author = author;
    this.pages = pages;
  }
  get kind() { return 'Книга'; }
  get loanDays() { return 21; }
  describe() { return `${super.describe()}, ${this.author}, ${this.pages} с.`; }
}

export class Magazine extends LibraryItem {
  constructor(title, issue) {
    super(title);
    this.issue = issue;
  }
  get kind() { return 'Журнал'; }
  get loanDays() { return 7; }
  describe() { return `${super.describe()}, випуск ${this.issue}`; }
}

export class AudioBook extends Book {
  constructor(title, author, minutes) {
    super(title, author, 0);
    this.minutes = minutes;
  }
  get kind() { return 'Аудіокнига'; }
  get loanDays() { return 10; }
  describe() {
    const h = Math.floor(this.minutes / 60);
    return `${this.kind} «${this.title}», ${this.author}, ${h} год ${this.minutes % 60} хв`;
  }
}

/**
 * Читач — оголошений функцією-конструктором (старий стиль до класів),
 * методи додаються в прототип і спільні для всіх читачів.
 */
export function Reader(name, limit = 2) {
  if (!new.target) throw new TypeError('Reader потрібно створювати через new.');
  this.name = name;
  this.limit = limit;
}
Reader.prototype.toString = function () {
  return `${this.name} (до ${this.limit} прим.)`;
};

/** Бібліотека: каталог, видача, повернення, штрафи. */
export class Library {
  static FINE_PER_DAY = 3; // гривні за кожен день прострочення
  #items = new Map();  // id → LibraryItem
  #loans = new Map();  // id → { reader, takenAt, dueAt }

  /** Статичний фабричний метод — демонстраційна бібліотека. */
  static createDemo() {
    const library = new Library();
    library.add(new Book('Тигролови', 'Іван Багряний', 352));
    library.add(new Book('Інтернат', 'Сергій Жадан', 328));
    library.add(new Book('Чистий код', 'Роберт Мартін', 464));
    library.add(new Magazine('Країна знань', '2026/10'));
    library.add(new AudioBook('Лісова пісня', 'Леся Українка', 175));
    return library;
  }

  static daysBetween(from, to) {
    return Math.round((to - from) / DAY); // round — щоб перехід на літній час не «з’їв» день
  }

  static startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  add(item) {
    if (!(item instanceof LibraryItem)) throw new TypeError('Додавати можна лише примірники бібліотеки.');
    this.#items.set(item.id, item);
    return item;
  }

  get items() { return [...this.#items.values()]; }

  available() { return this.items.filter((item) => item.available); }

  loansOf(reader) {
    return [...this.#loans].filter(([, loan]) => loan.reader === reader).map(([id, loan]) => ({ item: this.#items.get(id), ...loan }));
  }

  borrow(id, reader, now = new Date()) {
    const item = this.#find(id);
    if (!(reader instanceof Reader)) throw new TypeError('Потрібен зареєстрований читач.');
    if (this.loansOf(reader).length >= reader.limit) {
      throw new Error(`${reader.name} вже має ${reader.limit} прим. — спочатку поверніть щось.`);
    }
    item.checkOut(); // кине помилку, якщо примірник уже видано
    const dueAt = new Date(now.getTime() + item.loanDays * DAY);
    this.#loans.set(item.id, { reader, takenAt: now, dueAt }); // ключ — число, навіть якщо id прийшов рядком із форми
    return dueAt;
  }

  giveBack(id, now = new Date()) {
    const item = this.#find(id);
    const loan = this.#loans.get(item.id);
    if (!loan) throw new Error(`«${item.title}» ніхто не брав.`);
    item.checkIn();
    this.#loans.delete(item.id);
    // Рахуємо календарні дні: повернення в день строку — вчасно, наступного дня — 1 день запізнення
    const daysLate = Math.max(0, Library.daysBetween(Library.startOfDay(loan.dueAt), Library.startOfDay(now)));
    return { item, reader: loan.reader, daysLate, fine: daysLate * Library.FINE_PER_DAY };
  }

  #find(id) {
    const item = this.#items.get(Number(id));
    if (!item) throw new Error(`Примірника з номером ${id} немає в каталозі.`);
    return item;
  }
}
