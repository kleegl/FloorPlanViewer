/**
 * ================================================
 * ТОЧКИ ОБЗОРА ДЛЯ 3D-ТУРА
 *
 * Этот файл содержит конфигурацию всех навигационных точек:
 * - Каждая точка = комната или вид
 * - Для каждой точки задана позиция камеры, цель взгляда и позиция маркера
 * - Также есть предустановленные виды для кнопок "Сверху", "Перспектива", "3D-тур"
 * ================================================
 */

// ================================================
// 1. ИНТЕРФЕЙС ТОЧКИ ОБЗОРА
// ================================================

/**
 * Точка обзора для навигации по 3D-сцене
 *
 * @property id - Уникальный идентификатор точки (используется для навигации)
 * @property name - Отображаемое название точки
 * @property area - Площадь комнаты (отображается в UI)
 * @property icon - Эмодзи или символ комнаты
 * @property position - Позиция камеры {x, y, z} (где стоит камера)
 * @property target - Цель взгляда {x, y, z} (куда смотрит камера)
 * @property markerPosition - Позиция маркера на 3D-сцене {x, y, z}
 */
export interface CameraPoint {
  id: string;
  name: string;
  area?: string;
  icon: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  markerPosition: { x: number; y: number; z: number };
}

// ================================================
// 2. ДАННЫЕ ТОЧЕК ОБЗОРА
// ================================================

/**
 * Все доступные точки обзора
 *
 * Координаты подобраны для тестовой модели (шлем)
 * При использовании реальной модели квартиры координаты нужно будет скорректировать
 */
export const CAMERA_POINTS: CameraPoint[] = [
  // --- 1. Общий вид (по умолчанию) ---
  {
    id: "overview",
    name: "Общий вид",
    area: "3D-тур",
    icon: "🏠",
    // Камера смотрит на модель сверху-спереди
    position: { x: 2.5, y: 1.8, z: 3.5 },
    target: { x: 0, y: 0.3, z: 0 },
    // Маркер в центре сцены (над моделью)
    markerPosition: { x: 0, y: 0.3, z: 0 },
  },

  // --- 2. Гостиная ---
  {
    id: "living-room",
    name: "Гостиная",
    area: "24,5 м²",
    icon: "🛋️",
    // Камера смотрит с правой стороны
    position: { x: 1.2, y: 0.8, z: 2.5 },
    target: { x: 0, y: 0.3, z: 0 },
    // Маркер справа от центра
    markerPosition: { x: 0.8, y: 0.3, z: 1.5 },
  },

  // --- 3. Кухня ---
  {
    id: "kitchen",
    name: "Кухня",
    area: "14,67 м²",
    icon: "🍳",
    // Камера смотрит с левой стороны
    position: { x: -1.5, y: 0.8, z: 2.5 },
    target: { x: 0, y: 0.3, z: 0 },
    // Маркер слева от центра
    markerPosition: { x: -1.2, y: 0.3, z: 1.5 },
  },

  // --- 4. Спальня ---
  {
    id: "bedroom",
    name: "Спальня",
    area: "18,2 м²",
    icon: "🛏️",
    // Камера смотрит сзади-слева
    position: { x: -2.0, y: 0.8, z: -1.5 },
    target: { x: 0, y: 0.3, z: 0 },
    // Маркер сзади-слева
    markerPosition: { x: -1.2, y: 0.3, z: -1.2 },
  },

  // --- 5. Ванная ---
  {
    id: "bathroom",
    name: "Ванная",
    area: "8,3 м²",
    icon: "🚿",
    // Камера смотрит сзади-справа
    position: { x: 1.8, y: 0.8, z: -1.8 },
    target: { x: 0, y: 0.3, z: 0 },
    // Маркер сзади-справа
    markerPosition: { x: 1.2, y: 0.3, z: -1.2 },
  },
];

// ================================================
// 3. ПРЕДУСТАНОВЛЕННЫЕ ВИДЫ
// ================================================

/**
 * Соответствие кнопок видов точкам обзора
 * Используется в верхней панели для быстрой навигации
 *
 * Ключ = значение data-view у кнопки
 * Значение = id точки обзора
 */
export const VIEWS: Record<string, string> = {
  "3d": "overview", // Кнопка "3D-тур" → Общий вид
  perspective: "living-room", // Кнопка "Перспектива" → Гостиная
  top: "bedroom", // Кнопка "Сверху" → Спальня
};

// ================================================
// 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ТОЧКАМИ
// ================================================

/**
 * Находит точку обзора по ID
 * @param id - Идентификатор точки
 * @returns Точка обзора или undefined, если не найдена
 */
export function findCameraPointById(id: string): CameraPoint | undefined {
  return CAMERA_POINTS.find((point) => point.id === id);
}

/**
 * Получает все точки обзора (кроме общего вида)
 * @returns Массив точек (без overview)
 */
export function getRoomPoints(): CameraPoint[] {
  return CAMERA_POINTS.filter((point) => point.id !== "overview");
}

/**
 * Получает точку обзора по названию кнопки вида
 * @param viewKey - Ключ вида ('3d', 'perspective', 'top')
 * @returns Точка обзора или undefined
 */
export function getPointByView(viewKey: string): CameraPoint | undefined {
  const pointId = VIEWS[viewKey];
  if (pointId) {
    return findCameraPointById(pointId);
  }
  return undefined;
}

/**
 * Проверяет, существует ли точка с таким ID
 */
export function hasCameraPoint(id: string): boolean {
  return CAMERA_POINTS.some((point) => point.id === id);
}

/**
 * Получает массив всех ID точек
 */
export function getCameraPointIds(): string[] {
  return CAMERA_POINTS.map((point) => point.id);
}

/**
 * Получает массив названий точек
 */
export function getCameraPointNames(): string[] {
  return CAMERA_POINTS.map((point) => point.name);
}

// ================================================
// 5. КОНФИГУРАЦИЯ ДЛЯ КАРТЫ (схема квартиры)
// ================================================

/**
 * Цвета для каждой комнаты на карте
 * Индекс соответствует порядку точек в CAMERA_POINTS (без overview)
 */
export const MAP_COLORS = [
  "#ffd700", // Золотой
  "#ff6b6b", // Красный
  "#4ecdc4", // Бирюзовый
  "#45b7d1", // Голубой
  "#f9ca24", // Желтый
];

/**
 * Радиус отображения комнат на карте (относительный)
 * 0.7 = 70% от радиуса карты
 */
export const MAP_ROOM_RADIUS = 0.7;

/**
 * Размер точек на карте
 */
export const MAP_POINT_SIZE = 18;

/**
 * Получает цвет комнаты по индексу
 */
export function getMapColor(index: number): string {
  return MAP_COLORS[index % MAP_COLORS.length];
}

// ================================================
// 6. КОНФИГУРАЦИЯ ПО УМОЛЧАНИЮ
// ================================================

/**
 * Значения по умолчанию для новых точек
 * Используется при добавлении новых комнат через API
 */
export const DEFAULT_POINT_CONFIG = {
  position: { x: 0, y: 1, z: 2 },
  target: { x: 0, y: 0.3, z: 0 },
  markerPosition: { x: 0, y: 0.3, z: 0 },
};

/**
 * Создает новую точку обзора с значениями по умолчанию
 * @param id - Уникальный ID
 * @param name - Название
 * @param icon - Иконка (эмодзи)
 * @param area - Площадь (опционально)
 * @returns Новая точка обзора
 */
export function createCameraPoint(
  id: string,
  name: string,
  icon: string,
  area?: string,
): CameraPoint {
  return {
    id,
    name,
    icon,
    area,
    ...DEFAULT_POINT_CONFIG,
  };
}

// ================================================
// 7. ЭКСПОРТ ДЛЯ ОТЛАДКИ
// ================================================

console.log(`📍 Загружено ${CAMERA_POINTS.length} точек обзора:`);
CAMERA_POINTS.forEach((point) => {
  console.log(`   - ${point.icon} ${point.name} (${point.id})`);
});
console.log(`📌 Предустановленные виды:`, Object.keys(VIEWS).join(", "));
