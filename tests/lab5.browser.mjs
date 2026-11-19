// Браузерна перевірка лабораторної №5 у Google Chrome. Запуск: node tests/lab5.browser.mjs
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';

const URL = process.env.LAB_URL ?? 'http://127.0.0.1:8088/lab5/index.html';
const SHOTS = process.env.SHOT_DIR;
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const text = (sel) => page.$eval(sel, (el) => el.textContent.trim());
let passed = 0;
const ok = (name) => console.log(`ok ${++passed} ${name}`);
const act = async (reader, item, button) => {
  await page.select('#reader', reader);
  await page.select('#item', item);
  await page.click(`#${button}`);
};

await page.setViewport({ width: 1280, height: 950 });
await page.goto(URL, { waitUntil: 'networkidle0' });
assert.equal(await page.$$eval('#catalog tr', (r) => r.length), 5);
assert.equal(await text('#free-count'), '5');
ok('каталог із 5 примірників, усі вільні');

await act('0', '1', 'borrow');
assert.match(await text('#message'), /^Читач: Ростислав\. Видано «Тигролови», повернути до/);
await act('0', '4', 'borrow');
await act('1', '5', 'borrow');
assert.equal(await text('#free-count'), '2');
assert.equal(await page.$$eval('#loans li', (l) => l.length), 3);
ok('видано 3 примірники двом читачам');

await act('0', '2', 'borrow');
assert.match(await text('#message'), /Ростислав вже має 2 прим\./);
await act('1', '1', 'borrow');
assert.match(await text('#message'), /«Тигролови» вже видано\./);
assert.equal(await text('#free-count'), '2');
ok('ліміт читача та повторна видача відхилені');

await page.click('#skip');
const overdue = await page.$$eval('#loans li.bg-red-50', (l) => l.map((li) => li.textContent));
assert.equal(overdue.length, 1, 'прострочено лише журнал (7 дн.); аудіокнигу (10 дн.) можна повернути сьогодні');
assert.match(overdue[0], /«Країна знань».*прострочено/);
await page.mouse.move(0, 0);
if (SHOTS) await page.screenshot({ path: `${SHOTS}/fig1-overdue.png`, fullPage: true });
await act('0', '4', 'return');
assert.match(await text('#message'), /із запізненням 3 дн\. Штраф: 9 грн\./);
await page.mouse.move(0, 0);
if (SHOTS) await page.screenshot({ path: `${SHOTS}/fig2-fine.png`, fullPage: true });
await act('1', '5', 'return');
assert.match(await text('#message'), /^Читач: Олена\. «Лісова пісня» повернуто вчасно\.$/);
assert.equal(await text('#free-count'), '4');
ok('прострочення через 10 днів і штраф 3 грн/день');

await act('0', '3', 'return');
assert.match(await text('#message'), /«Чистий код» ніхто не брав\./);
ok('повернення невиданого примірника відхилене');

for (const width of [375, 1440]) {
  await page.setViewport({ width, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `переповнення на ${width}px`);
}
assert.deepEqual(errors, []);
ok('375 і 1440 px без прокрутки вбік, помилок у консолі немає');

await browser.close();
console.log(`${passed} passed`);
