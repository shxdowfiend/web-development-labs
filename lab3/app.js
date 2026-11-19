// Лабораторна робота №3 — керування сторінкою калькулятора через DOM і події.
import { SPEED_PRESETS, ValidationError, daysWord, parseField, plan } from './calc.js';

const form = document.getElementById('reading-form');
const fields = {
  pages: document.getElementById('pages'),
  speed: document.getElementById('speed'),
  daily: document.getElementById('daily'),
};
const presetBox = document.getElementById('presets');
const errorBox = document.getElementById('form-error');
const resultBox = document.getElementById('result');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const historyCount = document.getElementById('history-count');
const historyStatus = document.getElementById('history-status');
const clearButton = document.getElementById('clear-history');

const history = [];
const dateFormat = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' });
const numberFormat = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 });

// Кнопки швидкості створюються з масиву, а не пишуться вручну в HTML
for (const preset of SPEED_PRESETS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-ghost px-3 py-1 text-sm';
  button.textContent = `${preset.name} · ${preset.speed} с/год`;
  button.dataset.speed = String(preset.speed);
  presetBox.append(button);
}

// Делегування подій: один обробник на контейнер для всіх кнопок швидкості
presetBox.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-speed]');
  if (!button) return;
  fields.speed.value = button.dataset.speed;
  resetResult();
  fields.speed.focus();
});

// Будь-яка зміна даних робить попередній результат застарілим
for (const input of Object.values(fields)) {
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    resetResult();
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();

  let data;
  try {
    data = {
      pages: parseField('pages', fields.pages.value),
      speed: parseField('speed', fields.speed.value),
      daily: parseField('daily', fields.daily.value, { optional: true }),
    };
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    showError(error);
    return;
  }

  const result = plan(data);
  showResult(result);
  addToHistory(result);
});

clearButton.addEventListener('click', () => {
  history.length = 0;
  historyList.replaceChildren();
  updateHistoryState();
  historyStatus.textContent = 'Історію розрахунків очищено.';
});

function showResult(result) {
  const lines = [`На ${result.pages} с. при ${numberFormat.format(result.speed)} с/год знадобиться ${result.duration}.`];
  if (result.days !== null) {
    lines.push(`По ${result.daily} хв на день — це ${result.days} ${daysWord(result.days)}, фініш приблизно ${dateFormat.format(result.finish)}.`);
  }
  resultBox.replaceChildren(...lines.map((text, index) => {
    const p = document.createElement('p');
    p.textContent = text;
    if (index === 0) p.className = 'text-lg font-semibold text-leather-dark';
    return p;
  }));
  resultBox.hidden = false;
}

function addToHistory(result) {
  history.push(result);

  const item = document.createElement('li');
  item.className = 'rounded-lg border border-leather-light/30 bg-paper p-3';
  const title = document.createElement('p');
  title.className = 'font-semibold';
  title.textContent = `${result.pages} с. · ${numberFormat.format(result.speed)} с/год → ${result.duration}`;
  const details = document.createElement('p');
  details.className = 'text-sm text-ink/70';
  details.textContent = result.days === null
    ? 'Без щоденного ліміту'
    : `${result.daily} хв/день → ${result.days} ${daysWord(result.days)}`;
  item.append(title, details);

  historyList.prepend(item); // найновіший розрахунок — зверху
  historyStatus.textContent = '';
  updateHistoryState();
}

function updateHistoryState() {
  const empty = history.length === 0;
  historyEmpty.hidden = !empty;
  historyCount.textContent = String(history.length);
  clearButton.disabled = empty;
}

function showError(error) {
  const input = fields[error.field];
  input.setAttribute('aria-invalid', 'true');
  errorBox.textContent = error.message;
  errorBox.hidden = false;
  resetResult();
  input.focus();
}

function clearErrors() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  for (const input of Object.values(fields)) input.removeAttribute('aria-invalid');
}

function resetResult() {
  resultBox.hidden = true;
  resultBox.replaceChildren();
}

updateHistoryState();
