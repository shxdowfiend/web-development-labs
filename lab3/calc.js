// Лабораторна робота №3 — чисті функції розрахунку часу читання.
// Не працюють із DOM, тому їх можна перевірити в Node.js.

export const LIMITS = Object.freeze({
  pages: { min: 1, max: 10000, integer: true, label: 'Кількість сторінок' },
  speed: { min: 1, max: 300, integer: false, label: 'Швидкість читання' },
  daily: { min: 5, max: 1440, integer: true, label: 'Хвилин на день' },
});

export const SPEED_PRESETS = Object.freeze([
  { name: 'Повільно', speed: 20 },
  { name: 'Звичайно', speed: 40 },
  { name: 'Швидко', speed: 60 },
]);

export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Перетворює текст поля на число з перевіркою.
 * Приймає десяткову кому, відкидає порожнє, текст, від'ємні, нуль поза межами,
 * Infinity, шістнадцятковий та експоненційний запис.
 */
export function parseField(field, text, { optional = false } = {}) {
  const rule = LIMITS[field];
  const value = String(text ?? '').trim().replace(',', '.');

  if (value === '') {
    if (optional) return null;
    throw new ValidationError(field, `${rule.label}: поле не може бути порожнім.`);
  }
  if (!/^\d+(\.\d+)?$/.test(value)) {
    throw new ValidationError(field, `${rule.label}: введіть додатне число, наприклад 40 або 32,5.`);
  }
  const number = Number(value);
  if (rule.integer && !Number.isInteger(number)) {
    throw new ValidationError(field, `${rule.label}: потрібне ціле число.`);
  }
  if (number < rule.min || number > rule.max) {
    throw new ValidationError(field, `${rule.label}: значення від ${rule.min} до ${rule.max}.`);
  }
  return number;
}

/** Загальний час читання у хвилинах (округлення вгору до цілої хвилини). */
export function readingMinutes(pages, pagesPerHour) {
  return Math.ceil((pages / pagesPerHour) * 60);
}

/** 125 → «2 год 5 хв», 45 → «45 хв», 120 → «2 год». */
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} хв`;
  return rest === 0 ? `${hours} год` : `${hours} год ${rest} хв`;
}

/** Українська форма слова «день» для числа. */
export function daysWord(n) {
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'днів';
  if (last === 1) return 'день';
  if (last >= 2 && last <= 4) return 'дні';
  return 'днів';
}

/** Повний розрахунок для форми. dailyMinutes може бути null. */
export function plan({ pages, speed, daily = null, today = new Date() }) {
  const minutes = readingMinutes(pages, speed);
  const result = { pages, speed, daily, minutes, duration: formatDuration(minutes), days: null, finish: null };

  if (daily !== null) {
    result.days = Math.ceil(minutes / daily);
    const finish = new Date(today);
    finish.setDate(finish.getDate() + result.days - 1);
    result.finish = finish;
  }
  return result;
}
