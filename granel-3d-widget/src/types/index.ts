/**
 * Типы и интерфейсы для всего проекта
 */

import { type CameraPoint } from "../camera-points";
import * as THREE from "three";

// Экспортируем CameraPoint из camera-points
export type { CameraPoint };

/**
 * Конфигурация виджета
 */
export interface WidgetConfig {
  containerId: string;
  modelUrl: string;
  autoRotate?: boolean;
}

/**
 * Группа элементов для маркера на сцене
 */
export interface PointGroup {
  marker: THREE.Mesh; // Основной круг
  ring: THREE.Mesh; // Кольцо вокруг
  iconSprite: THREE.Sprite; // Иконка (эмодзи)
  labelSprite: THREE.Sprite; // Текстовая метка
  point: CameraPoint; // Данные точки
  isHovered: boolean; // Флаг наведения
}

/**
 * Позиция точки на карте
 */
export interface MapPointPosition {
  x: number;
  y: number;
  point: CameraPoint;
}
