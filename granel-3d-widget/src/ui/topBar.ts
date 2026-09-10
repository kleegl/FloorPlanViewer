/**
 * Модуль управления верхней панелью (кнопки видов и глаз)
 */

import { VIEWS } from "../camera-points";
import {
  getAllPoints,
  setPointsVisible,
  getPointsVisible,
} from "../navigation/points";

// Колбэки
let onViewChange: ((pointId: string) => void) | null = null;
let onTogglePoints: ((visible: boolean) => void) | null = null;

/**
 * Инициализирует верхнюю панель
 * @param viewButtons - Кнопки видов
 * @param toggleButton - Кнопка "глаз"
 */
export function initTopBar(
  viewButtons: NodeListOf<Element>,
  toggleButton: HTMLElement,
): void {
  // --- Кнопки видов ---
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (!view) return;

      // Обновляем активную кнопку
      viewButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Вызываем колбэк
      const pointId = VIEWS[view as keyof typeof VIEWS];
      if (onViewChange) {
        onViewChange(pointId);
      }
    });
  });

  // --- Кнопка показа точек ---
  toggleButton.addEventListener("click", () => {
    const visible = !getPointsVisible();
    toggleButton.classList.toggle("active");
    setPointsVisible(visible);

    if (onTogglePoints) {
      onTogglePoints(visible);
    }
  });
}

/**
 * Устанавливает колбэк для смены вида
 */
export function setViewChangeCallback(
  callback: (pointId: string) => void,
): void {
  onViewChange = callback;
}

/**
 * Устанавливает колбэк для переключения точек
 */
export function setTogglePointsCallback(
  callback: (visible: boolean) => void,
): void {
  onTogglePoints = callback;
}

/**
 * Устанавливает активную кнопку вида
 */
export function setActiveView(view: string): void {
  const buttons = document.querySelectorAll(".view-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === view);
  });
}
