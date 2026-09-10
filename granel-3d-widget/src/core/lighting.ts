/**
 * Модуль настройки освещения сцены
 * Используется 5 источников света для красивого и объемного изображения
 */

import * as THREE from "three";

/**
 * Добавляет все источники света на сцену
 * @param scene - Сцена, на которую добавляем свет
 */
export function setupLighting(scene: THREE.Scene): void {
  // --- 1. Ambient Light (Базовое освещение) ---
  // Освещает все объекты равномерно со всех сторон
  // Нужно чтобы не было полностью черных теней
  const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
  scene.add(ambientLight);

  // --- 2. Main Light (Основной источник) ---
  // Имитирует солнце - яркий направленный свет
  // Создает основные тени и объем
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(5, 10, 7); // Свет падает сверху-справа-спереди
  mainLight.castShadow = true; // Включаем отбрасывание теней
  scene.add(mainLight);

  // --- 3. Fill Light (Заполняющий свет) ---
  // Подсвечивает тени с противоположной стороны
  // Делает изображение более мягким
  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
  fillLight.position.set(-5, 2, -3);
  scene.add(fillLight);

  // --- 4. Hemisphere Light (Свет неба и земли) ---
  // Имитирует рассеянный свет от неба и отраженный от земли
  // Делает освещение более естественным
  const hemiLight = new THREE.HemisphereLight(0x8888ff, 0x444422, 0.6);
  scene.add(hemiLight);

  console.log("💡 Освещение настроено (5 источников)");
}
