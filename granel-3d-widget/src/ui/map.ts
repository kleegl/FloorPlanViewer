/**
 * Модуль управления картой (мини-карта и полноэкранная)
 * Рисует схематичное отображение квартиры с точками комнат
 */

import { type CameraPoint } from "../types";
import { getAllPoints } from "../navigation/points";

// DOM-элементы
let miniMapCanvas: HTMLCanvasElement;
let fullscreenMapCanvas: HTMLCanvasElement;
let fullscreenMap: HTMLElement;
let miniMapContainer: HTMLElement;

// Состояние
let isFullscreenOpen = false;

// Колбэк для клика по точке на карте
let onMapPointClick: ((point: CameraPoint) => void) | null = null;

/**
 * Инициализирует модуль карты
 */
export function initMap(
  miniCanvas: HTMLCanvasElement,
  fullCanvas: HTMLCanvasElement,
  fullscreenContainer: HTMLElement,
  miniContainer: HTMLElement,
): void {
  miniMapCanvas = miniCanvas;
  fullscreenMapCanvas = fullCanvas;
  fullscreenMap = fullscreenContainer;
  miniMapContainer = miniContainer;
}

/**
 * Устанавливает колбэк для клика по точке на карте
 */
export function setMapClickCallback(
  callback: (point: CameraPoint) => void,
): void {
  onMapPointClick = callback;
}

/**
 * Рисует карту на canvas
 * @param canvas - Canvas для рисования
 * @param isFullscreen - true = полноэкранная карта (с названиями)
 */
export function drawMap(
  canvas: HTMLCanvasElement,
  isFullscreen: boolean = false,
): void {
  const parent = canvas.parentElement!;
  const rect = parent.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);

  // Настраиваем размер canvas (x2 для четкости на retina)
  canvas.width = size * 2;
  canvas.height = size * 2;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) * 0.4;

  // Очищаем canvas
  ctx.clearRect(0, 0, w, h);

  // --- Рисуем фон (круг) ---
  ctx.fillStyle = "rgba(10, 10, 30, 0.6)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // --- Рисуем комнаты в виде кругов на окружности ---
  const colors = ["#ffd700", "#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"];
  const points = getAllPoints().filter((p) => p.id !== "overview");
  const pointCount = points.length;
  const angleStep = (Math.PI * 2) / pointCount;

  // Сохраняем позиции точек для кликов
  const pointPositions: { x: number; y: number; point: CameraPoint }[] = [];

  points.forEach((point, index) => {
    // Позиция точки на карте (по кругу)
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius * 0.7;
    const y = centerY + Math.sin(angle) * radius * 0.7;

    pointPositions.push({ x, y, point });

    // --- Круг комнаты ---
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 20);
    grad.addColorStop(0, colors[index % colors.length]);
    grad.addColorStop(1, "rgba(255,255,255,0.05)");
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = colors[index % colors.length];
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- Иконка комнаты ---
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(point.icon, x, y + 1);

    // --- Название (только на полноэкранной карте) ---
    if (isFullscreen) {
      ctx.font = "12px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(point.name, x, y + 32);
    }
  });

  // Сохраняем позиции для кликов
  (canvas as any).pointPositions = pointPositions;

  // --- Центральная точка ---
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd700";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,215,0,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Обновляет мини-карту
 */
export function updateMiniMap(): void {
  drawMap(miniMapCanvas, false);
}

/**
 * Обновляет полноэкранную карту
 */
export function updateFullscreenMap(): void {
  drawMap(fullscreenMapCanvas, true);
}

/**
 * Открывает полноэкранную карту
 */
export function openFullscreenMap(): void {
  fullscreenMap.style.display = "flex";
  isFullscreenOpen = true;
  setTimeout(() => updateFullscreenMap(), 50);
}

/**
 * Закрывает полноэкранную карту
 */
export function closeFullscreenMap(): void {
  fullscreenMap.style.display = "none";
  isFullscreenOpen = false;
}

/**
 * Проверяет, открыта ли полноэкранная карта
 */
export function isFullscreenMapOpen(): boolean {
  return isFullscreenOpen;
}

/**
 * Обработчик клика по полноэкранной карте
 */
export function handleFullscreenMapClick(event: MouseEvent): void {
  const rect = fullscreenMapCanvas.getBoundingClientRect();
  const scaleX = fullscreenMapCanvas.width / rect.width;
  const scaleY = fullscreenMapCanvas.height / rect.height;

  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;

  const positions = (fullscreenMapCanvas as any).pointPositions || [];

  for (const pos of positions) {
    const dist = Math.sqrt((mouseX - pos.x) ** 2 + (mouseY - pos.y) ** 2);
    if (dist < 30) {
      // Нашли точку!
      if (onMapPointClick) {
        onMapPointClick(pos.point);
      }
      closeFullscreenMap();
      return;
    }
  }
}
