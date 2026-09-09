import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Tween, Group, Easing } from "@tweenjs/tween.js";
import { CAMERA_POINTS, type CameraPoint } from "./camera-points";

console.log("🚀 Запуск Granel 3D Widget (Итерация 3)");

// ================================================
// 1. СОЗДАЕМ ГРУППУ ДЛЯ АНИМАЦИЙ (НОВЫЙ API)
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
const modelInfo = document.getElementById("model-info")!;
const modelTitle = modelInfo.querySelector(".title")!;
const modelSubtitle = modelInfo.querySelector(".subtitle")!;
const navigation = document.getElementById("navigation")!;
const navButtons = document.querySelectorAll(".nav-btn")!;
const pointIndicator = document.getElementById("point-indicator")!;
const currentPoint = document.getElementById("current-point")!;

// ================================================
// 3. СОЗДАЕМ СЦЕНУ
// ================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// ================================================
// 4. СОЗДАЕМ КАМЕРУ
// ================================================
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(2.5, 1.8, 3.5);

// ================================================
// 5. СОЗДАЕМ РЕНДЕРЕР
// ================================================
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

// ================================================
// 6. НАСТРАИВАЕМ УПРАВЛЕНИЕ КАМЕРОЙ
// ================================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.5;
controls.maxDistance = 10;
controls.target.set(0, 0.2, 0);
controls.update();

// ================================================
// 7. ДОБАВЛЯЕМ ОСВЕЩЕНИЕ
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
// 8. ЗАГРУЗЧИК МОДЕЛЕЙ
// ================================================
const loaderGLTF = new GLTFLoader();
let currentModel: THREE.Group | null = null;
let isAnimating = false;
let activeTweens: Tween[] = [];

// ================================================
// 9. ФУНКЦИЯ ПЛАВНОГО ПЕРЕЛЕТА (НОВЫЙ API)
// ================================================

function flyToPoint(point: CameraPoint, duration: number = 1500) {
  console.log(`📍 Перелет к точке: ${point.name}`);
  console.log(`   Цель позиция:`, point.position);
  console.log(`   Цель взгляда:`, point.target);

  // Останавливаем все текущие анимации
  if (isAnimating) {
    console.log("   ⏹ Останавливаем предыдущую анимацию");
    activeTweens.forEach((tween) => tween.stop());
    activeTweens = [];
    isAnimating = false;
  }

  // Отключаем контролы во время анимации
  controls.enabled = false;

  // Текущие позиции
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

  console.log("   Старт позиция:", startPos);
  console.log("   Старт взгляд:", startTarget);

  try {
    // ========== АНИМАЦИЯ ПОЗИЦИИ КАМЕРЫ ==========
    const posTween = new Tween(startPos, tweenGroup)
      .to(
        {
          x: point.position.x,
          y: point.position.y,
          z: point.position.z,
        },
        duration,
      )
      .easing(Easing.Cubic.InOut)
      .onUpdate(() => {
        camera.position.set(startPos.x, startPos.y, startPos.z);
      })
      .onStart(() => console.log("   ▶ Анимация позиции началась"))
      .onComplete(() => console.log("   ✅ Анимация позиции завершена"));

    // ========== АНИМАЦИЯ ЦЕЛИ (куда смотрим) ==========
    const targetTween = new Tween(startTarget, tweenGroup)
      .to(
        {
          x: point.target.x,
          y: point.target.y,
          z: point.target.z,
        },
        duration,
      )
      .easing(Easing.Cubic.InOut)
      .onUpdate(() => {
        controls.target.set(startTarget.x, startTarget.y, startTarget.z);
      })
      .onStart(() => console.log("   ▶ Анимация взгляда началась"))
      .onComplete(() => console.log("   ✅ Анимация взгляда завершена"));

    // Сохраняем и запускаем
    activeTweens = [posTween, targetTween];
    posTween.start();
    targetTween.start();

    isAnimating = true;

    // По окончании
    setTimeout(() => {
      isAnimating = false;
      controls.enabled = true;
      activeTweens = [];
      console.log(`   ✅ Перелет к "${point.name}" завершен`);
      console.log(`   Текущая позиция:`, camera.position);
      console.log(`   Текущий взгляд:`, controls.target);
    }, duration + 100);

    updatePointIndicator(point);
    updateActiveButton(point.id);
  } catch (error) {
    console.error("❌ Ошибка при создании анимации:", error);
    controls.enabled = true;
  }
}

function updatePointIndicator(point: CameraPoint) {
  pointIndicator.textContent = `${point.icon} ${point.name}`;
  currentPoint.classList.add("visible");

  clearTimeout((window as any).indicatorTimeout);
  (window as any).indicatorTimeout = setTimeout(() => {
    currentPoint.classList.remove("visible");
  }, 3000);
}

function updateActiveButton(pointId: string) {
  navButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-point") === pointId) {
      btn.classList.add("active");
    }
  });
}

// ================================================
// 10. НАСТРАИВАЕМ КНОПКИ
// ================================================

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const pointId = btn.getAttribute("data-point");
    console.log(`🔘 Нажата кнопка: ${pointId}`);

    const point = CAMERA_POINTS.find((p) => p.id === pointId);
    if (point) {
      flyToPoint(point);
    }
  });
});

// ================================================
// 11. ТЕСТОВЫЕ ФУНКЦИИ
// ================================================

(window as any).testFly = (pointId?: string) => {
  const point = pointId
    ? CAMERA_POINTS.find((p) => p.id === pointId)
    : CAMERA_POINTS[0];
  if (point) flyToPoint(point);
};

(window as any).CAMERA_POINTS = CAMERA_POINTS;

// ================================================
// 12. ЗАГРУЗКА МОДЕЛИ
// ================================================

function loadModel(url: string) {
  console.log(`📦 Начинаем загрузку: ${url}`);

  showLoader(true);
  updateProgress(0);

  loaderGLTF.load(
    url,
    (gltf) => {
      console.log("✅ Модель успешно загружена!");
      onModelLoaded(gltf.scene);
    },
    (progress) => {
      const percent =
        progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
      updateProgress(percent);
      updateLoaderText(`Загрузка... ${Math.round(percent)}%`);
    },
    (error) => {
      console.error("❌ Ошибка загрузки:", error);
      onModelError(error);
    },
  );
}

function onModelLoaded(model: THREE.Group) {
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

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
  showModelInfo(true, "Квартира", "Модель загружена ✅");

  navigation.classList.add("visible");

  const overviewPoint = CAMERA_POINTS.find((p) => p.id === "overview");
  if (overviewPoint) {
    updatePointIndicator(overviewPoint);
    updateActiveButton("overview");
  }

  console.log(`📊 Полигонов: ${countPolygons(model)}`);

  // Автоматический тестовый перелет
  setTimeout(() => {
    console.log('🔄 Авто-тест: перелет на "Спереди"...');
    const testPoint = CAMERA_POINTS.find((p) => p.id === "living-room");
    if (testPoint) flyToPoint(testPoint);
  }, 1500);
}

function onModelError(error: any) {
  console.error("❌ Ошибка загрузки модели:", error);
  updateLoaderText("❌ Ошибка загрузки модели");

  setTimeout(() => {
    showLoader(false);
    createFallbackObject();
  }, 2000);
}

function createFallbackObject() {
  console.log("🔄 Создаем тестовый объект");

  const geometry = new THREE.IcosahedronGeometry(1.2, 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.3,
    roughness: 0.4,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  currentModel = new THREE.Group();
  currentModel.add(mesh);

  showModelInfo(true, "Тестовый объект", "Модель не найдена");
  navigation.classList.add("visible");
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
  camera.lookAt(center);
  controls.update();
}

function countPolygons(model: THREE.Group): number {
  let count = 0;
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geom = child.geometry;
      if (geom.index) {
        count += geom.index.count / 3;
      } else if (geom.attributes.position) {
        count += geom.attributes.position.count / 3;
      }
    }
  });
  return Math.round(count);
}

// ================================================
// 13. UI ФУНКЦИИ
// ================================================

function showLoader(show: boolean) {
  loader.style.display = show ? "flex" : "none";
}

function updateLoaderText(text: string) {
  loaderText.textContent = text;
}

function updateProgress(percent: number) {
  const clamped = Math.min(100, Math.max(0, percent));
  progressBar.style.width = `${clamped}%`;
  loaderPercent.textContent = `${Math.round(clamped)}%`;
}

function showModelInfo(show: boolean, title: string, subtitle: string) {
  if (show) {
    modelInfo.style.display = "block";
    modelTitle.textContent = title;
    modelSubtitle.textContent = subtitle;
  } else {
    modelInfo.style.display = "none";
  }
}

// ================================================
// 14. АНИМАЦИОННЫЙ ЦИКЛ (НОВЫЙ API)
// ================================================

function animate() {
  requestAnimationFrame(animate);

  // Обновляем группу анимаций (НОВЫЙ API)
  tweenGroup.update();

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ================================================
// 15. RESIZE
// ================================================

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// ================================================
// 16. ЗАПУСК
// ================================================

console.log("📦 Загружаем модель...");

const MODEL_URL =
  "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf";
loadModel(MODEL_URL);

setTimeout(() => {
  if (!currentModel) {
    console.log("⏳ Таймаут. Создаем тестовый объект.");
    showLoader(false);
    createFallbackObject();
  }
}, 10000);

// ================================================
// 17. API
// ================================================

(window as any).GranelWidget = {
  flyTo: (pointId: string) => {
    const point = CAMERA_POINTS.find((p) => p.id === pointId);
    if (point) flyToPoint(point);
  },
  getPoints: () => CAMERA_POINTS,
  resetCamera: () => {
    const overview = CAMERA_POINTS.find((p) => p.id === "overview");
    if (overview) flyToPoint(overview);
  },
};

console.log("✅ Виджет готов!");
console.log("📖 API: window.GranelWidget");
console.log('🔧 Тест: window.testFly("kitchen")');
