/**
 * Модуль плавных перелетов камеры
 * Использует Tween.js для анимации позиции и цели камеры
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Tween, Group, Easing } from "@tweenjs/tween.js";
import { type CameraPoint } from "../types";

// --- Состояние анимации ---
let isAnimating = false; // Флаг: идет ли анимация
let activeTweens: Tween[] = []; // Список активных анимаций
const tweenGroup = new Group(); // Группа для управления всеми анимациями

// Колбэк, который вызывается после завершения перелета
let onFlyComplete: (() => void) | null = null;

/**
 * Настраивает колбэк для вызова после перелета
 * @param callback - Функция, вызываемая после завершения
 */
export function setFlyCompleteCallback(callback: () => void): void {
  onFlyComplete = callback;
}

/**
 * Выполняет плавный перелет камеры к точке
 * @param point - Точка обзора (позиция + цель)
 * @param camera - Камера
 * @param controls - Контролы камеры
 * @param duration - Длительность анимации в мс
 */
export function flyToPoint(
  point: CameraPoint,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  duration: number = 1200,
): void {
  console.log(`📍 Перелет к: ${point.name}`);

  // --- Останавливаем предыдущую анимацию если есть ---
  if (isAnimating) {
    activeTweens.forEach((t) => t.stop());
    activeTweens = [];
    isAnimating = false;
  }

  // --- Отключаем управление от пользователя на время анимации ---
  controls.enabled = false;

  // --- Запоминаем начальные позиции ---
  const startPos = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  const startTarget = {
    x: controls.target.x,
    y: controls.target.y,
    z: controls.target.z,
  };

  // --- Анимация позиции камеры ---
  // Плавно меняем позицию камеры от начальной до целевой
  const posTween = new Tween(startPos, tweenGroup)
    .to(point.position, duration) // Конечная позиция
    .easing(Easing.Cubic.InOut) // Тип плавности (медленно-быстро-медленно)
    .onUpdate(() => {
      camera.position.set(startPos.x, startPos.y, startPos.z);
    });

  // --- Анимация цели (куда смотрит камера) ---
  // Плавно меняем точку фокуса камеры
  const targetTween = new Tween(startTarget, tweenGroup)
    .to(point.target, duration)
    .easing(Easing.Cubic.InOut)
    .onUpdate(() => {
      controls.target.set(startTarget.x, startTarget.y, startTarget.z);
    })
    .onComplete(() => {
      // По окончании анимации включаем управление обратно
      controls.enabled = true;
      isAnimating = false;

      // Вызываем колбэк если есть
      if (onFlyComplete) {
        onFlyComplete();
      }
    });

  // --- Запускаем анимации ---
  activeTweens = [posTween, targetTween];
  posTween.start();
  targetTween.start();
  isAnimating = true;
}

/**
 * Обновляет все активные анимации (вызывается в цикле)
 * @param time - Текущее время (опционально)
 */
export function updateAnimations(time?: number): void {
  tweenGroup.update(time);
}

/**
 * Получить группу анимаций (для внешнего использования)
 */
export function getTweenGroup(): Group {
  return tweenGroup;
}

/**
 * Проверить, идет ли сейчас анимация
 */
export function isAnimationRunning(): boolean {
  return isAnimating;
}
