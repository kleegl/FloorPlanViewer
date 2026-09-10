/**
 * Модуль загрузки 3D-моделей в формате GLB
 * Использует GLTFLoader с поддержкой DRACO сжатия
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// --- Конфигурация ---
const DRACO_DECODER_PATH =
  "https://www.gstatic.com/draco/versioned/decoders/1.5.5/";

// --- Состояние ---
let currentModel: THREE.Group | null = null;
let loaderInstance: GLTFLoader | null = null;

// Колбэки
let onLoadStart: (() => void) | null = null;
let onLoadProgress: ((percent: number) => void) | null = null;
let onLoadComplete: ((model: THREE.Group) => void) | null = null;
let onLoadError: ((error: any) => void) | null = null;

/**
 * Инициализирует загрузчик моделей
 */
export function initModelLoader(): void {
  loaderInstance = new GLTFLoader();

  // Настройка DRACO для сжатых моделей
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
  loaderInstance.setDRACOLoader(dracoLoader);

  console.log("📦 Загрузчик моделей инициализирован");
}

/**
 * Устанавливает колбэки для загрузки
 */
export function setLoadCallbacks(
  start: () => void,
  progress: (percent: number) => void,
  complete: (model: THREE.Group) => void,
  error: (err: any) => void,
): void {
  onLoadStart = start;
  onLoadProgress = progress;
  onLoadComplete = complete;
  onLoadError = error;
}

/**
 * Загружает 3D-модель по URL
 * @param url - URL модели (GLB файл)
 */
export function loadModel(url: string): void {
  if (!loaderInstance) {
    console.error("❌ Загрузчик не инициализирован");
    return;
  }

  console.log(`📦 Загрузка модели: ${url}`);

  if (onLoadStart) onLoadStart();

  loaderInstance.load(
    url,
    // --- Успешная загрузка ---
    (gltf) => {
      console.log("✅ Модель загружена");
      const model = gltf.scene;

      // Настраиваем модель
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);

      // Включаем тени для всех мешей
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      currentModel = model;

      if (onLoadComplete) onLoadComplete(model);
    },
    // --- Прогресс загрузки ---
    (progress) => {
      const percent =
        progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
      if (onLoadProgress) onLoadProgress(percent);
    },
    // --- Ошибка ---
    (error) => {
      console.error("❌ Ошибка загрузки:", error);
      if (onLoadError) onLoadError(error);
    },
  );
}

/**
 * Получить текущую модель
 */
export function getCurrentModel(): THREE.Group | null {
  return currentModel;
}

/**
 * Очистить текущую модель
 */
export function clearModel(scene: THREE.Scene): void {
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }
}
