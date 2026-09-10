/**
 * Модуль отображения прогресса загрузки
 */

// DOM-элементы
let loaderElement: HTMLElement;
let progressBar: HTMLDivElement;
let progressPercent: HTMLDivElement;
let progressText: HTMLDivElement;

/**
 * Инициализирует лоадер
 */
export function initLoader(
  loaderEl: HTMLElement,
  bar: HTMLDivElement,
  percent: HTMLDivElement,
  text: HTMLDivElement,
): void {
  loaderElement = loaderEl;
  progressBar = bar;
  progressPercent = percent;
  progressText = text;
}

/**
 * Показывает или скрывает лоадер
 * @param show - true = показать
 */
export function showLoader(show: boolean): void {
  loaderElement.style.display = show ? "flex" : "none";
}

/**
 * Обновляет прогресс загрузки
 * @param percent - Процент загрузки (0-100)
 */
export function updateProgress(percent: number): void {
  const clamped = Math.min(100, Math.max(0, percent));
  progressBar.style.width = `${clamped}%`;
  progressPercent.textContent = `${Math.round(clamped)}%`;
}

/**
 * Обновляет текст лоадера
 * @param text - Новый текст
 */
export function updateLoaderText(text: string): void {
  progressText.textContent = text;
}
