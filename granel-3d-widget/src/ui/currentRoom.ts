/**
 * Модуль отображения текущей комнаты (слева снизу)
 * Определяет ближайшую точку к камере и показывает ее данные
 */

import * as THREE from "three";
import { type CameraPoint } from "../types";
import { getAllPoints } from "../navigation/points";

// DOM-элементы для отображения
let roomIcon: HTMLElement;
let roomName: HTMLElement;
let roomArea: HTMLElement;

// Колбэк для обновления
let onRoomUpdate: ((point: CameraPoint) => void) | null = null;

/**
 * Инициализирует модуль текущей комнаты
 * @param iconElement - Элемент для иконки
 * @param nameElement - Элемент для названия
 * @param areaElement - Элемент для площади
 */
export function initCurrentRoom(
  iconElement: HTMLElement,
  nameElement: HTMLElement,
  areaElement: HTMLElement,
): void {
  roomIcon = iconElement;
  roomName = nameElement;
  roomArea = areaElement;
}

/**
 * Находит ближайшую точку к камере
 * @param camera - Камера
 * @returns Ближайшая точка или null
 */
function findClosestPoint(camera: THREE.PerspectiveCamera): CameraPoint | null {
  const cameraPos = camera.position;
  const points = getAllPoints();
  let closest: CameraPoint | null = null;
  let minDist = Infinity;

  points.forEach((point) => {
    const target = point.target;
    const dist = cameraPos.distanceTo(
      new THREE.Vector3(target.x, target.y, target.z),
    );
    if (dist < minDist) {
      minDist = dist;
      closest = point;
    }
  });

  return closest;
}

/**
 * Обновляет отображение текущей комнаты
 * @param camera - Камера
 */
export function updateCurrentRoom(camera: THREE.PerspectiveCamera): void {
  const point = findClosestPoint(camera);
  if (point) {
    roomIcon.textContent = point.icon;
    roomName.textContent = point.name;
    roomArea.textContent = point.area || "3D-тур";

    if (onRoomUpdate) {
      onRoomUpdate(point);
    }
  }
}

/**
 * Устанавливает колбэк для обновления комнаты
 */
export function setRoomUpdateCallback(
  callback: (point: CameraPoint) => void,
): void {
  onRoomUpdate = callback;
}
