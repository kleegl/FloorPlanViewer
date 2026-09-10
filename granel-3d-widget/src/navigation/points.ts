/**
 * Модуль управления точками-маркерами на 3D сцене
 * Точки отображаются как кружки с иконками комнат
 * При наведении увеличиваются и показывают название
 */

import * as THREE from "three";
import { type CameraPoint, type PointGroup } from "../types";
import { CAMERA_POINTS } from "../camera-points";

// --- Состояние точек ---
let pointGroups: PointGroup[] = [];
let pointsVisible = false;

// Колбэки для внешнего взаимодействия
let onPointHover: ((point: CameraPoint | null) => void) | null = null;
let onPointClick: ((point: CameraPoint) => void) | null = null;

/**
 * Настройка колбэков для взаимодействия с точками
 */
export function setPointCallbacks(
  hover: (point: CameraPoint | null) => void,
  click: (point: CameraPoint) => void,
): void {
  onPointHover = hover;
  onPointClick = click;
}

/**
 * Создает текстуру с иконкой (эмодзи) внутри круга
 * @param icon - Эмодзи (например, '🍳')
 * @param size - Размер текстуры в пикселях
 * @returns Текстура для Sprite
 */
function createIconTexture(
  icon: string,
  size: number = 128,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Очищаем холст
  ctx.clearRect(0, 0, size, size);

  // Рисуем круг с градиентом
  const radius = size / 2 - 8;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    radius,
  );
  gradient.addColorStop(0, "rgba(255, 215, 0, 0.25)");
  gradient.addColorStop(0.5, "rgba(255, 215, 0, 0.15)");
  gradient.addColorStop(1, "rgba(255, 215, 0, 0.05)");

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Обводка круга
  ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Иконка (эмодзи)
  ctx.font = `${size * 0.5}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.fillText(icon, size / 2, size / 2 + 2);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Создает текстуру с текстовой меткой (название + площадь)
 * @param text - Название комнаты
 * @param area - Площадь комнаты
 * @returns Текстура для Sprite
 */
function createLabelTexture(
  text: string,
  area: string = "",
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Тень для читаемости текста на любом фоне
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Название комнаты (крупный шрифт)
  ctx.font = "bold 44px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 6);

  // Площадь (мелкий шрифт, золотым цветом)
  if (area) {
    ctx.shadowBlur = 15;
    ctx.font = "28px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.fillText(area, canvas.width / 2, canvas.height / 2 + 44);
  }

  return new THREE.CanvasTexture(canvas);
}

/**
 * Создает все точки-маркеры на сцене
 * @param scene - 3D-сцена
 */
export function createPoints(scene: THREE.Scene): void {
  // Удаляем старые точки если были
  pointGroups.forEach((group) => {
    scene.remove(group.marker);
    scene.remove(group.ring);
    scene.remove(group.iconSprite);
    scene.remove(group.labelSprite);
  });
  pointGroups = [];

  // Создаем точки для каждой комнаты
  CAMERA_POINTS.forEach((point) => {
    const pos = point.markerPosition;

    // --- 1. Основной круг (для кликов и ховера) ---
    const markerGeo = new THREE.CircleGeometry(0.2, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0, // Скрыт по умолчанию, показывается кнопкой "глаз"
      side: THREE.DoubleSide,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(pos.x, pos.y, pos.z);
    marker.userData = { point, isMarker: true };
    scene.add(marker);

    // --- 2. Кольцо вокруг маркера (декоративное) ---
    const ringGeo = new THREE.RingGeometry(0.22, 0.28, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(pos.x, pos.y, pos.z);
    ring.userData = { isRing: true };
    scene.add(ring);

    // --- 3. Иконка (спрайт с эмодзи) ---
    const iconTexture = createIconTexture(point.icon);
    const iconMaterial = new THREE.SpriteMaterial({
      map: iconTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      sizeAttenuation: true, // Уменьшается с расстоянием
    });
    const iconSprite = new THREE.Sprite(iconMaterial);
    iconSprite.position.set(pos.x, pos.y, pos.z + 0.01); // Немного выше круга
    iconSprite.scale.set(0.5, 0.5, 1);
    scene.add(iconSprite);

    // --- 4. Текстовая метка (показывается при наведении) ---
    const labelTexture = createLabelTexture(point.name, point.area || "");
    const labelMaterial = new THREE.SpriteMaterial({
      map: labelTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      sizeAttenuation: true,
    });
    const labelSprite = new THREE.Sprite(labelMaterial);
    labelSprite.position.set(pos.x, pos.y + 0.6, pos.z); // Выше маркера
    labelSprite.scale.set(1.6, 0.4, 1);
    scene.add(labelSprite);

    // Сохраняем группу элементов точки
    pointGroups.push({
      marker,
      ring,
      iconSprite,
      labelSprite,
      point,
      isHovered: false,
    });
  });

  console.log(`📍 Создано ${pointGroups.length} точек на сцене`);
}

/**
 * Показывает или скрывает все точки
 * @param visible - true = показать, false = скрыть
 */
export function setPointsVisible(visible: boolean): void {
  pointsVisible = visible;
  pointGroups.forEach((group) => {
    const opacity = visible ? 1 : 0;
    group.marker.material.opacity = opacity * 0.3;
    group.ring.material.opacity = opacity * 0.5;
    group.iconSprite.material.opacity = opacity;
    // Метки скрыты по умолчанию, показываются только при ховере
    if (!group.isHovered) {
      group.labelSprite.material.opacity = 0;
    }
  });
}

/**
 * Получить состояние видимости точек
 */
export function getPointsVisible(): boolean {
  return pointsVisible;
}

/**
 * Получить все группы точек
 */
export function getPointGroups(): PointGroup[] {
  return pointGroups;
}

/**
 * Получить точку по ID
 */
export function findPointById(id: string): CameraPoint | undefined {
  return CAMERA_POINTS.find((p) => p.id === id);
}

/**
 * Получить все точки
 */
export function getAllPoints(): CameraPoint[] {
  return [...CAMERA_POINTS];
}

/**
 * Обработчик наведения мыши на точку (вызывается из рейкаста)
 * @param point - Точка, на которую навели (null если убрали)
 */
export function handlePointHover(point: CameraPoint | null): void {
  // Сбрасываем все маркеры
  pointGroups.forEach((group) => {
    if (!group.isHovered) {
      group.labelSprite.material.opacity = 0;
    }
  });

  if (point) {
    // Нашли точку - увеличиваем ее и показываем метку
    const group = pointGroups.find((g) => g.point.id === point.id);
    if (group) {
      group.marker.scale.set(1.6, 1.2, 1); // Растягиваем в овал
      group.ring.scale.set(1.6, 1.2, 1);
      group.labelSprite.material.opacity = 1;
      group.isHovered = true;
    }
  } else {
    // Убрали наведение - возвращаем все в исходное состояние
    pointGroups.forEach((group) => {
      group.marker.scale.set(1, 1, 1);
      group.ring.scale.set(1, 1, 1);
      group.isHovered = false;
    });
  }

  // Вызываем внешний колбэк
  if (onPointHover) {
    onPointHover(point);
  }
}

/**
 * Обработчик клика по точке
 * @param point - Точка, по которой кликнули
 */
export function handlePointClick(point: CameraPoint): void {
  if (onPointClick) {
    onPointClick(point);
  }
}

/**
 * Сбросить все маркеры в исходное состояние
 */
export function resetAllMarkers(): void {
  pointGroups.forEach((group) => {
    group.marker.scale.set(1, 1, 1);
    group.ring.scale.set(1, 1, 1);
    if (!group.isHovered) {
      group.labelSprite.material.opacity = 0;
    }
    group.isHovered = false;
  });
}
