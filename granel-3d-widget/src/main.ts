import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

console.log("🚀 Запуск Granel 3D Widget...");

// ============================================
// 1. НАХОДИМ КОНТЕЙНЕР
// ============================================
const container = document.getElementById("canvas-container")!;

// ============================================
// 2. СОЗДАЕМ СЦЕНУ
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e); // Темно-синий фон

// ============================================
// 3. СОЗДАЕМ КАМЕРУ
// ============================================
const camera = new THREE.PerspectiveCamera(
  45, // Угол обзора
  window.innerWidth / window.innerHeight, // Соотношение сторон
  0.1, // Ближняя плоскость отсечения
  1000, // Дальняя плоскость отсечения
);
camera.position.set(3, 2, 5); // Позиция камеры
camera.lookAt(0, 0, 0); // Смотрим в центр

// ============================================
// 4. СОЗДАЕМ РЕНДЕРЕР
// ============================================
const renderer = new THREE.WebGLRenderer({
  antialias: true, // Включить сглаживание
  alpha: false, // Непрозрачный фон
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Оптимизация для retina
renderer.shadowMap.enabled = true; // Включаем тени
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Мягкие тени
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Кино-тонирование
renderer.toneMappingExposure = 1.2;

// Добавляем canvas в контейнер
container.appendChild(renderer.domElement);

// ============================================
// 5. НАСТРАИВАЕМ УПРАВЛЕНИЕ (OrbitControls)
// ============================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Включаем инерцию
controls.dampingFactor = 0.08; // Коэффициент инерции
controls.autoRotate = false; // Автовращение выключено
controls.minDistance = 1; // Минимальное приближение
controls.maxDistance = 20; // Максимальное удаление
controls.target.set(0, 0, 0); // Центр вращения
controls.update();

// ============================================
// 6. ДОБАВЛЯЕМ ОСВЕЩЕНИЕ
// ============================================

// 6.1. Ambient Light - базовое освещение
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

// 6.2. Main Light - основной источник света
const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
scene.add(mainLight);

// 6.3. Fill Light - заполняющий свет
const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
fillLight.position.set(-5, 2, -3);
scene.add(fillLight);

// 6.4. Rim Light - контровой свет
const rimLight = new THREE.DirectionalLight(0xff8844, 0.3);
rimLight.position.set(-2, -1, 5);
scene.add(rimLight);

// 6.5. Hemisphere Light - свет неба и земли
const hemiLight = new THREE.HemisphereLight(0x8888ff, 0x444422, 0.6);
scene.add(hemiLight);

// ============================================
// 7. СОЗДАЕМ ТЕСТОВЫЙ ОБЪЕКТ
// ============================================

// 7.1. Создаем красивый объект (икосаэдр)
const geometry = new THREE.IcosahedronGeometry(1.2, 2); // Радиус, детализация
const material = new THREE.MeshStandardMaterial({
  color: 0xffd700, // Золотой
  metalness: 0.3, // Металличность
  roughness: 0.4, // Шероховатость
  envMapIntensity: 1.0, // Интенсивность отражений
});
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
mesh.position.set(0, 0, 0);
scene.add(mesh);

// 7.2. Добавляем каркас поверх объекта
const wireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0x4488ff,
  wireframe: true,
  transparent: true,
  opacity: 0.15,
});
const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
wireframe.position.copy(mesh.position);
scene.add(wireframe);

// 7.3. Добавляем подставку (плоскость)
const planeGeometry = new THREE.CircleGeometry(2, 32);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a2a4e,
  metalness: 0.8,
  roughness: 0.2,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1.5;
plane.receiveShadow = true;
scene.add(plane);

// 7.4. Добавляем сетку для ориентира
const gridHelper = new THREE.GridHelper(6, 12, 0x8888ff, 0x444466);
gridHelper.position.y = -1.4;
scene.add(gridHelper);

// 7.5. Добавляем частицы для фона (звезды)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 40;
}
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(posArray, 3),
);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0x8888ff,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
particles.position.y = 5;
scene.add(particles);

// ============================================
// 8. АНИМАЦИОННЫЙ ЦИКЛ
// ============================================
function animate() {
  requestAnimationFrame(animate);

  // Вращаем объект
  mesh.rotation.x += 0.003;
  mesh.rotation.y += 0.005;
  wireframe.rotation.x = mesh.rotation.x;
  wireframe.rotation.y = mesh.rotation.y;

  // Медленно вращаем частицы
  particles.rotation.y += 0.0002;

  // Обновляем контролы (для инерции)
  controls.update();

  // Рендерим сцену
  renderer.render(scene, camera);
}
animate();

// ============================================
// 9. АДАПТАЦИЯ ПРИ ИЗМЕНЕНИИ РАЗМЕРА ОКНА
// ============================================
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// ============================================
// 10. ВСПОМОГАТЕЛЬНЫЕ УТИЛИТЫ
// ============================================

// Добавляем глобальный объект для отладки
(window as any).scene = scene;
(window as any).camera = camera;
(window as any).controls = controls;

console.log("✅ 3D сцена успешно создана!");
console.log("📊 Объектов на сцене:", scene.children.length);
console.log("💡 Используйте консоль для отладки: scene, camera, controls");
