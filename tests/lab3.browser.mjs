// Браузерна перевірка лабораторної №3 у Google Chrome через puppeteer-core.
// Запуск: node tests/lab3.browser.mjs  (сервер: npm start; SHOT_DIR — куди зберегти скриншоти)
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';

const URL = process.env.LAB_URL ?? 'http://127.0.0.1:8088/lab3/index.html';
const SHOTS = process.env.SHOT_DIR;
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log(`ok ${passed} ${name}`);
}
const text = (sel) => page.$eval(sel, (el) => el.textContent.trim());
const hidden = (sel) => page.$eval(sel, (el) => el.hidden);
async function fill(values) {
  for (const [id, value] of Object.entries(values)) {
    await page.$eval(`#${id}`, (el) => { el.value = ''; });
    if (value !== '') await page.type(`#${id}`, value);
  }
}

await page.setViewport({ width: 1280, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle0' });

await check('початковий стан: 3 кнопки швидкості, порожня історія', async () => {
  assert.equal((await page.$$('#presets button')).length, 3);
  assert.equal(await text('#history-count'), '0');
  assert.equal(await hidden('#history-empty'), false);
  assert.equal(await page.$eval('#clear-history', (b) => b.disabled), true);
});

await check('кнопка швидкості, щоденний ліміт і результат', async () => {
  await fill({ pages: '448', speed: '', daily: '45' });
  await page.click('#presets button[data-speed="40"]');
  assert.equal(await page.$eval('#speed', (el) => el.value), '40');
  await page.keyboard.press('Enter');
  const result = await text('#result');
  assert.match(result, /11 год 12 хв/);
  assert.match(result, /15 днів/);
  assert.equal(await text('#history-count'), '1');
});

await check('десяткова кома без ліміту та третій розрахунок', async () => {
  await fill({ pages: '320', speed: '32,5', daily: '' });
  await page.click('#reading-form button[type="submit"]');
  assert.match(await text('#result'), /9 год 51 хв/);
  await fill({ pages: '120', speed: '60', daily: '30' });
  await page.click('#reading-form button[type="submit"]');
  assert.match(await text('#result'), /2 год/);
  assert.match(await text('#result'), /4 дні/);
  assert.equal(await text('#history-count'), '3');
  const first = await page.$eval('#history-list li', (li) => li.textContent);
  assert.match(first, /120 с\./, 'найновіший запис зверху');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/fig1-result.png`, fullPage: true });
});

await check('некоректне значення не додає запис і очищує результат', async () => {
  await fill({ pages: 'abc', speed: '40', daily: '' });
  await page.click('#reading-form button[type="submit"]');
  assert.equal(await hidden('#form-error'), false);
  assert.match(await text('#form-error'), /Кількість сторінок/);
  assert.equal(await page.$eval('#pages', (el) => el.getAttribute('aria-invalid')), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'pages');
  assert.equal(await hidden('#result'), true);
  assert.equal(await text('#history-count'), '3');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/fig2-error.png`, fullPage: true });
});

await check('очищення історії', async () => {
  await page.click('#clear-history');
  assert.equal(await text('#history-count'), '0');
  assert.equal(await hidden('#history-empty'), false);
  assert.equal(await page.$$eval('#history-list li', (l) => l.length), 0);
  assert.equal(await text('#history-status'), 'Історію розрахунків очищено.');
  assert.equal(await page.$eval('#clear-history', (b) => b.disabled), true);
});

await check('адаптивність 375 / 768 / 1440 px без прокрутки вбік', async () => {
  for (const width of [375, 768, 1440]) {
    await page.setViewport({ width, height: 900 });
    await page.goto(URL, { waitUntil: 'networkidle0' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `горизонтальне переповнення на ${width}px`);
  }
  if (SHOTS) {
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await fill({ pages: '448', speed: '40', daily: '45' });
    await page.click('#reading-form button[type="submit"]');
    await page.screenshot({ path: `${SHOTS}/fig3-mobile.png`, fullPage: false });
  }
  assert.deepEqual(errors, []);
});

await browser.close();
console.log(`${passed} passed`);
