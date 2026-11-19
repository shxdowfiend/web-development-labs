// Браузерна перевірка лабораторної №4 у Google Chrome. Запуск: node tests/lab4.browser.mjs
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';

const URL = process.env.LAB_URL ?? 'http://127.0.0.1:8088/lab4/index.html';
const SHOTS = process.env.SHOT_DIR;
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
const errors = [];
const logs = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => (m.type() === 'error' ? errors.push(m.text()) : logs.push(m.text())));
const text = (sel) => page.$eval(sel, (el) => el.textContent.trim());
let passed = 0;
const ok = (name) => console.log(`ok ${++passed} ${name}`);

await page.setViewport({ width: 1280, height: 1000 });
await page.goto(URL, { waitUntil: 'networkidle0' });

assert.ok(logs.some((l) => l.startsWith('IIFE:')), 'IIFE вивела дані в консоль');
assert.match(await text('#task1'), /Мова браузера: \S+; екран: \d+×\d+/);
ok('IIFE виконалась під час завантаження');

assert.match(await text('#task2'), /Книг: 5, сторінок: 1892, середня оцінка: 4\.6/);
assert.match(await text('#task3'), /Разом записів: 9, різних книг: 7\. Спільні: Інтернат, Чистий код/);
assert.equal(await text('#task4'), 'Проза (3): Тигролови, Інтернат, Місто\nТехнічна (2): Чистий код, Рефакторинг\nПоезія (2): Кобзар, Лісова пісня');
assert.match(await text('#task5'), /Прочитано: «Тигролови» — Іван Багряний/);
ok('результати завдань 2–5 на сторінці');

await page.select('#tracker-form select', 'fowler');
await page.type('#tracker-form input', '100');
await page.click('#tracker-form button');
await page.type('#tracker-form input', '50');
await page.click('#tracker-form button');
await page.select('#tracker-form select', 'poetry');
await page.type('#tracker-form input', '200');
await page.click('#tracker-form button');
assert.equal(await text('#fowler-text'), '150 з 448 с. (33%)');
assert.match(await text('#poetry-text'), /^160 з 160 с\. \(100%\) — прочитано!/);
ok('два незалежні трекери-замикання');

await page.type('#tracker-form input', '-5');
await page.click('#tracker-form button');
assert.equal(await page.$eval('#tracker-error', (el) => el.hidden), false);
assert.equal(await text('#fowler-text'), '150 з 448 с. (33%)');
ok('некоректна кількість сторінок відхилена');
await new Promise((resolve) => setTimeout(resolve, 800)); // дочекатися CSS-анімації смуг прогресу
assert.equal(await page.$eval('#poetry-bar', (el) => el.getBoundingClientRect().width === el.parentElement.getBoundingClientRect().width), true);
if (SHOTS) await page.screenshot({ path: `${SHOTS}/fig1-page.png`, fullPage: true });

for (const width of [375, 1440]) {
  await page.setViewport({ width, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `переповнення на ${width}px`);
}
assert.deepEqual(errors, []);
ok('375 і 1440 px без прокрутки вбік, помилок у консолі немає');

await browser.close();
console.log(`${passed} passed`);
