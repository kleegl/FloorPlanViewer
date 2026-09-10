/**
 * ================================================
 * ГЛАВНЫЙ ФАЙЛ ВИДЖЕТА
 * Точка входа, связывает все модули вместе
 * ================================================
 */

// --- Импорт стилей ---
import "./style.css";

// --- Импорт ядра ---
import * as THREE from "three";
import { createScene } from "./core/scene";
import { setupLighting } from "./core/lighting";
import { createControls } from "./core/controls";

// --- Импорт модулей ---
import {
  initLoader,
  showLoader,
  updateProgress,
  updateLoaderText,
} from "./ui/loader";
import {
  initCurrentRoom,
  updateCurrentRoom,
  setRoomUpdateCallback,
} from "./ui/currentRoom";
import {
  initMap,
  updateMiniMap,
  openFullscreenMap,
  closeFullscreenMap,
  handleFullscreenMapClick,
  setMapClickCallback,
} from "./ui/map";
import {
  initTopBar,
  setViewChangeCallback,
  setTogglePointsCallback,
  setActiveView,
} from "./ui/topBar";
import {
  initModelLoader,
  loadModel,
  getCurrentModel,
  clearModel,
  setLoadCallbacks,
} from "./models/modelLoader";
import {
  flyToPoint,
  updateAnimations,
  setFlyCompleteCallback,
} from "./navigation/cameraFly";
import {
  createPoints,
  setPointsVisible,
  getPointGroups,
  handlePointHover,
  handlePointClick,
  getAllPoints,
  findPointById,
  getPointsVisible,
  resetAllMarkers,
  setPointCallbacks,
} from "./navigation/points";

// --- Импорт типов ---
import { type CameraPoint } from "./types";
import { VIEWS } from "./camera-points";

console.log("🚀 Запуск Granel 3D Widget");

// ================================================
// 1. ПОЛУЧАЕМ DOM-ЭЛЕМЕНТЫ
// ================================================

// Контейнеры
const container = document.getElementById("canvas-container")!;
const loaderEl = document.getElementById("loader")!;
const progressBar = document.getElementById("progress-bar")! as HTMLDivElement;
const loaderPercent = document.getElementById(
  "loader-percent",
)! as HTMLDivElement;
const loaderText = document.querySelector(".loader-text")! as HTMLDivElement;

// Текущая комната
const currentRoom = document.getElementById("current-room")!;
const roomIcon = currentRoom.querySelector(".room-icon")!;
const roomName = currentRoom.querySelector(".room-name")!;
const roomArea = currentRoom.querySelector(".room-area")!;

// Карта
const miniMapContainer = document.getElementById("mini-map-container")!;
const miniMapCanvas = document.getElementById(
  "miniMapCanvas",
)! as HTMLCanvasElement;
const fullscreenMap = document.getElementById("fullscreen-map")!;
const fullscreenMapCanvas = document.getElementById(
  "fullscreenMapCanvas",
)! as HTMLCanvasElement;
const expandMapBtn = document.getElementById("expandMapBtn")!;
const closeMapBtn = document.getElementById("closeMapBtn")!;

// Верхняя панель
const viewBtns = document.querySelectorAll(".view-btn")!;
const togglePointsBtn = document.getElementById("togglePoints")!;

// Информация о точке (при ховере)
const pointInfo = document.getElementById("point-info")!;
const pointInfoName = pointInfo.querySelector(".point-info-name")!;
const pointInfoArea = pointInfo.querySelector(".point-info-area")!;

// ================================================
// 2. ИНИЦИАЛИЗИРУЕМ UI МОДУЛИ
// ================================================

// Лоадер
initLoader(loaderEl, progressBar, loaderPercent, loaderText);

// Текущая комната
initCurrentRoom(roomIcon, roomName, roomArea);

// Карта
initMap(miniMapCanvas, fullscreenMapCanvas, fullscreenMap, miniMapContainer);

// Верхняя панель
initTopBar(viewBtns, togglePointsBtn);

// ================================================
// 3. СОЗДАЕМ 3D СЦЕНУ
// ================================================

// Создаем сцену, камеру и рендерер
const { scene, camera, renderer } = createScene(container);

// Добавляем освещение
setupLighting(scene);

// Создаем управление камерой
const controls = createControls(camera, renderer.domElement);

// ================================================
// 4. ПЕРЕМЕННЫЕ СОСТОЯНИЯ
// ================================================

let isHovering = false;
let hoveredPoint: CameraPoint | null = null;

// ================================================
// 5. НАСТРАИВАЕМ ОБРАТНЫЕ ВЫЗОВЫ
// ================================================

// --- Перелеты ---
setFlyCompleteCallback(() => {
  // Обновляем текущую комнату после перелета
  updateCurrentRoom(camera);
  updateMiniMap();
});

// --- Карта ---
setMapClickCallback((point: CameraPoint) => {
  // Перелет по клику на карте
  flyToPoint(point, camera, controls);
  // Обновляем UI после перелета
  setTimeout(() => {
    updateCurrentRoom(camera);
    updateMiniMap();
  }, 100);
});

// --- Кнопки видов ---
setViewChangeCallback((pointId: string) => {
  const point = findPointById(pointId);
  if (point) {
    flyToPoint(point, camera, controls);
    setTimeout(() => {
      updateCurrentRoom(camera);
      updateMiniMap();
    }, 100);
  }
});

// --- Переключение видимости точек ---
setTogglePointsCallback((visible: boolean) => {
  if (!visible) {
    // Скрываем информацию при скрытии точек
    pointInfo.style.display = "none";
    resetAllMarkers();
    isHovering = false;
    hoveredPoint = null;
  }
});

// --- Обновление комнаты ---
setRoomUpdateCallback((point: CameraPoint) => {
  // Дополнительные действия при смене комнаты
  console.log(`🏠 Текущая комната: ${point.name}`);
});

// Устанавливаем колбэки для точек
setPointCallbacks(
  // При наведении
  (point: CameraPoint | null) => {
    if (point) {
      // Показываем информацию о точке
      pointInfo.style.display = "block";
      pointInfoName.textContent = point.icon + " " + point.name;
      pointInfoArea.textContent = point.area || "";
    } else {
      pointInfo.style.display = "none";
    }
  },
  // При клике
  (point: CameraPoint) => {
    console.log(`🖱️ Клик по точке: ${point.name}`);
    flyToPoint(point, camera, controls);
    setTimeout(() => {
      updateCurrentRoom(camera);
      updateMiniMap();
    }, 100);
  },
);

// ================================================
// 6. РЕЙКАСТ ДЛЯ ТОЧЕК (hover + click)
// ================================================

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/**
 * Обработчик движения мыши - определяет наведение на точки
 */
function onPointerMove(event: PointerEvent) {
  const pointsVisible = getPointsVisible();

  // Если точки скрыты - скрываем всю информацию
  if (!pointsVisible) {
    if (isHovering) {
      pointInfo.style.display = "none";
      handlePointHover(null);
      resetAllMarkers();
      isHovering = false;
      hoveredPoint = null;
      renderer.domElement.style.cursor = "default";
    }
    return;
  }

  // Вычисляем координаты указателя в NDC
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Запускаем рейкаст
  raycaster.setFromCamera(pointer, camera);

  // Получаем все маркеры точек
  const markers = getPointGroups().map((g) => g.marker);
  const intersects = raycaster.intersectObjects(markers);

  // Сбрасываем все маркеры
  resetAllMarkers();

  if (intersects.length > 0) {
    // Нашли точку!
    const hit = intersects[0].object;
    const point = hit.userData.point as CameraPoint;

    // Подсвечиваем точку
    handlePointHover(point);
    isHovering = true;
    hoveredPoint = point;
    renderer.domElement.style.cursor = "pointer";

    // Показываем информацию о точке
    pointInfo.style.display = "block";
    pointInfoName.textContent = point.icon + " " + point.name;
    pointInfoArea.textContent = point.area || "";
  } else {
    // Ничего не нашли
    pointInfo.style.display = "none";
    handlePointHover(null);
    isHovering = false;
    hoveredPoint = null;
    renderer.domElement.style.cursor = "default";
  }
}

/**
 * Обработчик клика - перелет к точке
 */
function onPointerDown(event: PointerEvent) {
  // Если наведены на точку и точки видны - перелетаем
  if (isHovering && hoveredPoint && getPointsVisible()) {
    handlePointClick(hoveredPoint);
    // flyToPoint вызовется через handlePointClick
  }
}

// Подписываемся на события
renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("pointerdown", onPointerDown);

// ================================================
// 7. КАРТА: ОТКРЫТИЕ/ЗАКРЫТИЕ
// ================================================

miniMapContainer.addEventListener("click", openFullscreenMap);
expandMapBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  openFullscreenMap();
});
closeMapBtn.addEventListener("click", closeFullscreenMap);
fullscreenMapCanvas.addEventListener("click", handleFullscreenMapClick);

// ================================================
// 8. ЗАГРУЗКА МОДЕЛИ
// ================================================

// Инициализируем загрузчик
initModelLoader();

// Настраиваем колбэки загрузки
setLoadCallbacks(
  // --- Начало загрузки ---
  () => {
    showLoader(true);
    updateProgress(0);
    updateLoaderText("Начинаем загрузку...");
  },

  // --- Прогресс загрузки ---
  (percent) => {
    updateProgress(percent);
    updateLoaderText(`Загрузка... ${Math.round(percent)}%`);
  },

  // --- УСПЕШНАЯ ЗАГРУЗКА ---
  (model) => {
    console.log("✅ Модель загружена, добавляем на сцену");

    // Добавляем модель на сцену
    scene.add(model);

    // Настраиваем камеру под модель
    fitCameraToModel(model);

    // Скрываем лоадер
    showLoader(false);

    // СОЗДАЕМ ТОЧКИ НА СЦЕНЕ (ВАЖНО!)
    createPoints(scene);

    // По умолчанию точки скрыты
    setPointsVisible(false);

    // Обновляем информацию о текущей комнате
    updateCurrentRoom(camera);

    // Обновляем мини-карту
    updateMiniMap();

    // Активируем кнопку "3D-тур"
    setActiveView("3d");

    console.log("✅ Виджет полностью загружен и готов к работе!");
  },

  // --- ОШИБКА ЗАГРУЗКИ ---
  (error) => {
    console.error("❌ Ошибка загрузки модели:", error);
    showLoader(false);
    updateLoaderText("❌ Ошибка загрузки модели");
  },
);

/**
 * Настраивает камеру так, чтобы видеть всю модель
 */
function fitCameraToModel(model: THREE.Group) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 2.5;

  controls.target.copy(center);
  camera.position.set(
    center.x + distance * 0.5,
    center.y + distance * 0.3,
    center.z + distance,
  );
  controls.update();
}

// Загружаем модель
const MODEL_URL =
  "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf";
loadModel(MODEL_URL);

// ================================================
// 9. АНИМАЦИОННЫЙ ЦИКЛ
// ================================================

function animate() {
  requestAnimationFrame(animate);

  // Обновляем анимации перелетов
  updateAnimations();

  // Обновляем контролы
  controls.update();

  // Рендерим сцену
  renderer.render(scene, camera);
}
animate();

// ================================================
// 10. ПУБЛИЧНЫЙ API
// ================================================

(window as any).GranelWidget = {
  /**
   * Перелет к точке по ID
   * @param pointId - ID точки (например, 'kitchen')
   */
  flyTo: (pointId: string) => {
    const point = findPointById(pointId);
    if (point) {
      flyToPoint(point, camera, controls);
      setTimeout(() => {
        updateCurrentRoom(camera);
        updateMiniMap();
      }, 100);
    } else {
      console.warn(`❌ Точка "${pointId}" не найдена`);
    }
  },

  /**
   * Переключить видимость точек на сцене
   */
  togglePoints: () => {
    const visible = !getPointsVisible();
    setPointsVisible(visible);
    togglePointsBtn.classList.toggle("active");

    if (!visible) {
      pointInfo.style.display = "none";
      resetAllMarkers();
      isHovering = false;
      hoveredPoint = null;
    }
  },

  /**
   * Получить все точки обзора
   */
  getPoints: () => getAllPoints(),

  /**
   * Сбросить камеру на общий вид
   */
  resetCamera: () => {
    const overview = findPointById("overview");
    if (overview) {
      flyToPoint(overview, camera, controls);
      setTimeout(() => {
        updateCurrentRoom(camera);
        updateMiniMap();
      }, 100);
    }
  },

  /**
   * Показать точки (если скрыты)
   */
  showPoints: () => {
    setPointsVisible(true);
    togglePointsBtn.classList.add("active");
  },

  /**
   * Скрыть точки
   */
  hidePoints: () => {
    setPointsVisible(false);
    togglePointsBtn.classList.remove("active");
    pointInfo.style.display = "none";
    resetAllMarkers();
    isHovering = false;
    hoveredPoint = null;
  },
};

console.log("✅ Виджет готов!");
console.log("📖 API: window.GranelWidget");
console.log("📍 Используйте кнопки для навигации");
console.log("🔧 Для отладки: window.GranelWidget.togglePoints()");
