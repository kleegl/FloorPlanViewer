/**
 * Модуль управления камерой (OrbitControls)
 * Позволяет пользователю вращать сцену, приближать и отдалять
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Создает и настраивает OrbitControls
 * @param camera - Камера, которой управляем
 * @param domElement - DOM-элемент для отслеживания событий мыши
 * @returns Настроенные контролы
 */
export function createControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
): OrbitControls {
  const controls = new OrbitControls(camera, domElement);

  // --- Настройки поведения ---
  controls.enableDamping = true; // Включаем инерцию (плавное движение)
  controls.dampingFactor = 0.08; // Сила инерции (0-1, меньше = плавнее)
  controls.minDistance = 0.5; // Минимальное приближение к объекту
  controls.maxDistance = 10; // Максимальное удаление от объекта
  controls.target.set(0, 0.2, 0); // Центр вращения (немного выше центра)
  controls.update();

  console.log("🖱️ OrbitControls настроены");
  return controls;
}
