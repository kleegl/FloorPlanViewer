/**
 * Модуль управления 3D-сценой
 * Отвечает за создание и настройку сцены, камеры и рендерера
 */

import * as THREE from "three";

/**
 * Создает и настраивает 3D-сцену
 * @param container - DOM-элемент для вставки canvas
 * @returns Объект со сценой, камерой и рендерером
 */
export function createScene(container: HTMLElement) {
  // --- Создаем сцену ---
  // Scene - это корневой контейнер для всех 3D-объектов
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a); // Темно-синий фон

  // --- Создаем камеру ---
  // PerspectiveCamera - имитирует зрение человека (объекты дальше - меньше)
  const camera = new THREE.PerspectiveCamera(
    45, // Угол обзора в градусах
    window.innerWidth / window.innerHeight, // Соотношение сторон
    0.1, // Ближняя плоскость отсечения
    1000, // Дальняя плоскость отсечения
  );
  camera.position.set(2.5, 1.8, 3.5); // Начальная позиция камеры

  // --- Создаем рендерер ---
  // WebGLRenderer - рисует сцену на canvas с использованием WebGL
  const renderer = new THREE.WebGLRenderer({
    antialias: true, // Сглаживание для более гладких линий
    alpha: false, // Непрозрачный фон
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Оптимизация для retina
  renderer.shadowMap.enabled = true; // Включаем тени
  renderer.shadowMap.type = THREE.PCFShadowMap; // Тип теней (мягкие)
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Кино-тонирование
  renderer.toneMappingExposure = 1.2; // Экспозиция
  container.appendChild(renderer.domElement); // Добавляем canvas в DOM

  // --- Обработка изменения размера окна ---
  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener("resize", onResize);

  // Возвращаем все созданные объекты для использования в других модулях
  return {
    scene,
    camera,
    renderer,
    onResize, // Экспортируем для возможного ручного вызова
  };
}

// Тип возвращаемого значения для использования в других файлах
export type SceneContext = ReturnType<typeof createScene>;
