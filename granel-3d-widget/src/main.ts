import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Tween, Group, Easing } from "@tweenjs/tween.js";
import { CAMERA_POINTS, type CameraPoint, VIEWS } from "./camera-points";

console.log("🚀 Запуск Granel 3D Widget");

// ================================================
// 1. TWEEN GROUP
// ================================================
const tweenGroup = new Group();

// ================================================
// 2. ДОМ ЭЛЕМЕНТЫ
// ================================================
const container = document.getElementById("canvas-container")!;
const loader = document.getElementById("loader")!;
const progressBar = document.getElementById("progress-bar")! as HTMLDivElement;
const loaderPercent = document.getElementById(
  "loader-percent",
)! as HTMLDivElement;
const loaderText = document.querySelector(".loader-text")! as HTMLDivElement;
const branding = document.getElementById("branding")!;
const pointInfo = document.getElementById("point-info")!;
const pointInfoName = pointInfo.querySelector(".point-info-name")!;
const pointInfoArea = pointInfo.querySelector(".point-info-area")!;
const togglePointsBtn = document.getElementById("togglePoints")!;
const viewBtns = document.querySelectorAll(".view-btn")!;

// Элементы текущей комнаты
const currentRoom = document.getElementById("current-room")!;
const roomIcon = currentRoom.querySelector(".room-icon")!;
const roomName = currentRoom.querySelector(".room-name")!;
const roomArea = currentRoom.querySelector(".room-area")!;

// Элементы карты
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

// ================================================
// 3. THREE.JS СЦЕНА
// ================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(2.5, 1.8, 3.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.5;
controls.maxDistance = 10;
controls.target.set(0, 0.2, 0);
controls.update();

// ================================================
// 4. ОСВЕЩЕНИЕ
// ================================================
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
fillLight.position.set(-5, 2, -3);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0x8888ff, 0x444422, 0.6);
scene.add(hemiLight);

// ================================================
// 5. ТОЧКИ НА СЦЕНЕ
// ================================================
interface PointGroup {
  marker: THREE.Mesh;
  ring: THREE.Mesh;
  iconSprite: THREE.Sprite;
  labelSprite: THREE.Sprite;
  point: CameraPoint;
  isHovered: boolean;
}

const pointGroups: PointGroup[] = [];
let pointsVisible = false;
let hoveredPoint: CameraPoint | null = null;

function createIconTexture(
  icon: string,
  size: number = 128,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);

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

  ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = `${size * 0.5}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.fillText(icon, size / 2, size / 2 + 2);

  return new THREE.CanvasTexture(canvas);
}

function createLabelTexture(
  text: string,
  area: string = "",
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.font = "bold 44px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 6);

  if (area) {
    ctx.shadowBlur = 15;
    ctx.font = "28px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.fillText(area, canvas.width / 2, canvas.height / 2 + 44);
  }

  return new THREE.CanvasTexture(canvas);
}

function createScenePoints() {
  pointGroups.forEach((group) => {
    scene.remove(group.marker);
    scene.remove(group.ring);
    scene.remove(group.iconSprite);
    scene.remove(group.labelSprite);
  });
  pointGroups.length = 0;

  CAMERA_POINTS.forEach((point) => {
    const pos = point.markerPosition;

    const markerGeo = new THREE.CircleGeometry(0.2, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(pos.x, pos.y, pos.z);
    marker.userData = { point, isMarker: true };
    scene.add(marker);

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

    const iconTexture = createIconTexture(point.icon);
    const iconMaterial = new THREE.SpriteMaterial({
      map: iconTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      sizeAttenuation: true,
    });
    const iconSprite = new THREE.Sprite(iconMaterial);
    iconSprite.position.set(pos.x, pos.y, pos.z + 0.01);
    iconSprite.scale.set(0.5, 0.5, 1);
    scene.add(iconSprite);

    const labelTexture = createLabelTexture(point.name, point.area || "");
    const labelMaterial = new THREE.SpriteMaterial({
      map: labelTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      sizeAttenuation: true,
    });
    const labelSprite = new THREE.Sprite(labelMaterial);
    labelSprite.position.set(pos.x, pos.y + 0.6, pos.z);
    labelSprite.scale.set(1.6, 0.4, 1);
    scene.add(labelSprite);

    pointGroups.push({
      marker,
      ring,
      iconSprite,
      labelSprite,
      point,
      isHovered: false,
    });
  });
}

function updatePointsVisibility(visible: boolean) {
  pointsVisible = visible;
  pointGroups.forEach((group) => {
    const opacity = visible ? 1 : 0;
    group.marker.material.opacity = opacity * 0.3;
    group.ring.material.opacity = opacity * 0.5;
    group.iconSprite.material.opacity = opacity;
    if (!group.isHovered) {
      group.labelSprite.material.opacity = 0;
    }
  });
}

// ================================================
// 6. ОПРЕДЕЛЕНИЕ БЛИЖАЙШЕЙ ТОЧКИ
// ================================================
function findClosestPoint(): CameraPoint | null {
  const cameraPos = camera.position;
  let closest: CameraPoint | null = null;
  let minDist = Infinity;

  CAMERA_POINTS.forEach((point) => {
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

function updateCurrentRoom() {
  const point = findClosestPoint();
  if (point) {
    roomIcon.textContent = point.icon;
    roomName.textContent = point.name;
    roomArea.textContent = point.area || "3D-тур";
  }
}

// ================================================
// 7. РИСОВАНИЕ КАРТЫ
// ================================================
const mapPoints: { x: number; y: number; point: CameraPoint }[] = [];

function drawMap(canvas: HTMLCanvasElement, isFullscreen: boolean = false) {
  const parent = canvas.parentElement!;
  const rect = parent.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);

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

  ctx.clearRect(0, 0, w, h);

  // Фон
  ctx.fillStyle = "rgba(10, 10, 30, 0.6)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Очищаем массив точек карты
  mapPoints.length = 0;

  // Рисуем комнаты
  const colors = ["#ffd700", "#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"];
  const pointCount = CAMERA_POINTS.filter((p) => p.id !== "overview").length;
  const angleStep = (Math.PI * 2) / pointCount;

  // Сохраняем позиции точек для кликов
  const pointPositions: { x: number; y: number; point: CameraPoint }[] = [];

  CAMERA_POINTS.filter((p) => p.id !== "overview").forEach((point, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius * 0.7;
    const y = centerY + Math.sin(angle) * radius * 0.7;

    pointPositions.push({ x, y, point });

    // Круг комнаты
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

    // Иконка
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(point.icon, x, y + 1);

    // Название (только на большой карте)
    if (isFullscreen) {
      ctx.font = "12px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(point.name, x, y + 32);
    }
  });

  // Сохраняем позиции для кликов
  (canvas as any).pointPositions = pointPositions;

  // Центральная точка
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd700";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,215,0,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function updateMiniMap() {
  drawMap(miniMapCanvas, false);
}

function updateFullscreenMap() {
  drawMap(fullscreenMapCanvas, true);
}

// ================================================
// 8. КАРТА: ОТКРЫТИЕ/ЗАКРЫТИЕ
// ================================================
function openFullscreenMap() {
  fullscreenMap.style.display = "flex";
  setTimeout(() => updateFullscreenMap(), 50);
}

function closeFullscreenMap() {
  fullscreenMap.style.display = "none";
}

// Клик по мини-карте
miniMapContainer.addEventListener("click", openFullscreenMap);
expandMapBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  openFullscreenMap();
});
closeMapBtn.addEventListener("click", closeFullscreenMap);

// Клик по точкам на полноэкранной карте
fullscreenMapCanvas.addEventListener("click", (event) => {
  const rect = fullscreenMapCanvas.getBoundingClientRect();
  const scaleX = fullscreenMapCanvas.width / rect.width;
  const scaleY = fullscreenMapCanvas.height / rect.height;

  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;

  const positions = (fullscreenMapCanvas as any).pointPositions || [];

  let found = false;
  for (const pos of positions) {
    const dist = Math.sqrt((mouseX - pos.x) ** 2 + (mouseY - pos.y) ** 2);
    if (dist < 30) {
      // Нашли точку!
      flyToPoint(pos.point);
      closeFullscreenMap();
      found = true;
      break;
    }
  }

  if (!found) {
    console.log("Клик мимо точек");
  }
});

// ================================================
// 9. РЕЙКАСТ ПО ТОЧКЕ ДЛЯ ВЗАИМОДЕЙСТВИЯ
// ================================================
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let isHovering = false;

function onPointerMove(event: PointerEvent) {
  if (!pointsVisible) {
    if (isHovering) {
      hidePointInfo();
      resetAllMarkers();
      isHovering = false;
    }
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const markers = pointGroups.map((g) => g.marker);
  const intersects = raycaster.intersectObjects(markers);

  // Сначала сбрасываем все
  resetAllMarkers();

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const point = hit.userData.point as CameraPoint;
    const group = pointGroups.find((g) => g.point.id === point.id);

    if (group) {
      group.marker.scale.set(1.6, 1.2, 1);
      group.ring.scale.set(1.6, 1.2, 1);
      group.labelSprite.material.opacity = 1;
      group.isHovered = true;

      showPointInfo(point);
      hoveredPoint = point;
      isHovering = true;
      renderer.domElement.style.cursor = "pointer";
    }
  } else {
    hidePointInfo();
    hoveredPoint = null;
    isHovering = false;
    renderer.domElement.style.cursor = "default";
  }
}

function resetAllMarkers() {
  pointGroups.forEach((group) => {
    group.marker.scale.set(1, 1, 1);
    group.ring.scale.set(1, 1, 1);
    if (!group.isHovered) {
      group.labelSprite.material.opacity = 0;
    }
    group.isHovered = false;
  });
}

function showPointInfo(point: CameraPoint) {
  const pointInfo = document.getElementById("point-info")!;
  pointInfo.style.display = "block";
  pointInfo.querySelector(".point-info-name")!.textContent =
    point.icon + " " + point.name;
  pointInfo.querySelector(".point-info-area")!.textContent = point.area || "";
}

function hidePointInfo() {
  const pointInfo = document.getElementById("point-info")!;
  pointInfo.style.display = "none";
}

// ================================================
// 10. КЛИК ПО ТОЧКЕ
// ================================================
function onPointerDown(event: PointerEvent) {
  if (!pointsVisible || !hoveredPoint) return;
  flyToPoint(hoveredPoint);
}

// ================================================
// 11. UI КНОПКИ
// ================================================

// Кнопки видов
viewBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    if (!view) return;

    viewBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const pointId = VIEWS[view as keyof typeof VIEWS];
    const point = CAMERA_POINTS.find((p) => p.id === pointId);
    if (point) {
      flyToPoint(point);
      // Обновляем комнату после перелета
      setTimeout(() => updateCurrentRoom(), 100);
    }
  });
});

// Кнопка показа точек
togglePointsBtn.addEventListener("click", () => {
  pointsVisible = !pointsVisible;
  togglePointsBtn.classList.toggle("active");
  updatePointsVisibility(pointsVisible);
  if (!pointsVisible) {
    hidePointInfo();
    resetAllMarkers();
    hoveredPoint = null;
    isHovering = false;
  }
});

viewBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    if (!view) return;

    viewBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const pointId = VIEWS[view as keyof typeof VIEWS];
    const point = CAMERA_POINTS.find((p) => p.id === pointId);
    if (point) flyToPoint(point);
  });
});

// ================================================
// 12. EVENTS
// ================================================
renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("pointerdown", onPointerDown);

// ================================================
// 13. ФУНКЦИЯ ПЕРЕЛЕТА
// ================================================
let isAnimating = false;
let activeTweens: Tween[] = [];

function flyToPoint(point: CameraPoint, duration: number = 1200) {
  console.log(`📍 Перелет к: ${point.name}`);

  if (isAnimating) {
    activeTweens.forEach((t) => t.stop());
    activeTweens = [];
    isAnimating = false;
  }

  controls.enabled = false;

  const startPos = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  const startTarget = {
    x: controls.target.x,
    y: controls.target.y,
    z: controls.target.z,
  };

  const posTween = new Tween(startPos, tweenGroup)
    .to(point.position, duration)
    .easing(Easing.Cubic.InOut)
    .onUpdate(() => camera.position.set(startPos.x, startPos.y, startPos.z));

  const targetTween = new Tween(startTarget, tweenGroup)
    .to(point.target, duration)
    .easing(Easing.Cubic.InOut)
    .onUpdate(() =>
      controls.target.set(startTarget.x, startTarget.y, startTarget.z),
    )
    .onComplete(() => {
      controls.enabled = true;
      isAnimating = false;
      updateCurrentRoom(); // Обновляем комнату
    });

  activeTweens = [posTween, targetTween];
  posTween.start();
  targetTween.start();
  isAnimating = true;
}

// ================================================
// 14. ЗАГРУЗКА МОДЕЛИ
// ================================================
const loaderGLTF = new GLTFLoader();
let currentModel: THREE.Group | null = null;

function loadModel(url: string) {
  showLoader(true);
  updateProgress(0);

  loaderGLTF.load(
    url,
    (gltf) => {
      console.log("✅ Модель загружена");
      onModelLoaded(gltf.scene);
    },
    (progress) => {
      const percent =
        progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
      updateProgress(percent);
    },
    (error) => {
      console.error("❌ Ошибка:", error);
      onModelError(error);
    },
  );
}

function onModelLoaded(model: THREE.Group) {
  if (currentModel) scene.remove(currentModel);
  currentModel = model;
  model.scale.set(1, 1, 1);
  model.position.set(0, 0, 0);
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);
  fitCameraToModel(model);
  showLoader(false);

  createScenePoints();
  updateCurrentRoom();
  updateMiniMap();
}

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

function onModelError(error: any) {
  console.error("❌ Ошибка:", error);
  showLoader(false);
}

// ================================================
// 15. UI ФУНКЦИИ
// ================================================
function showLoader(show: boolean) {
  loader.style.display = show ? "flex" : "none";
}

function updateProgress(percent: number) {
  const clamped = Math.min(100, Math.max(0, percent));
  progressBar.style.width = `${clamped}%`;
  loaderPercent.textContent = `${Math.round(clamped)}%`;
}

// ================================================
// 16. АНИМАЦИЯ
// ================================================
function animate() {
  requestAnimationFrame(animate);

  tweenGroup.update();
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ================================================
// 17. RESIZE
// ================================================
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  updateMiniMap();
});

// ================================================
// 18. ЗАПУСК
// ================================================
const MODEL_URL =
  "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf";
loadModel(MODEL_URL);

// ================================================
// 19. API
// ================================================
(window as any).GranelWidget = {
  flyTo: (pointId: string) => {
    const point = CAMERA_POINTS.find((p) => p.id === pointId);
    if (point) flyToPoint(point);
  },
  togglePoints: () => {
    pointsVisible = !pointsVisible;
    togglePointsBtn.classList.toggle("active");
    updatePointsVisibility(pointsVisible);
  },
};

console.log("✅ Виджет готов!");
console.log("📖 API: window.GranelWidget");
