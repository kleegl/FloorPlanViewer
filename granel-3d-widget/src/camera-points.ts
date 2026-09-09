export interface CameraPoint {
  id: string;
  name: string;
  area?: string;
  icon: string; // Эмодзи или символ комнаты
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  markerPosition: { x: number; y: number; z: number };
}

export const CAMERA_POINTS: CameraPoint[] = [
  {
    id: "overview",
    name: "Общий вид",
    area: "3D-тур",
    icon: "🏠",
    position: { x: 2.5, y: 1.8, z: 3.5 },
    target: { x: 0, y: 0.3, z: 0 },
    markerPosition: { x: 0, y: 0.3, z: 0 },
  },
  {
    id: "living-room",
    name: "Гостиная",
    area: "24,5 м²",
    icon: "🛋️",
    position: { x: 1.2, y: 0.8, z: 2.5 },
    target: { x: 0, y: 0.3, z: 0 },
    markerPosition: { x: 0.8, y: 0.3, z: 1.5 },
  },
  {
    id: "kitchen",
    name: "Кухня",
    area: "14,67 м²",
    icon: "🍳",
    position: { x: -1.5, y: 0.8, z: 2.5 },
    target: { x: 0, y: 0.3, z: 0 },
    markerPosition: { x: -1.2, y: 0.3, z: 1.5 },
  },
  {
    id: "bedroom",
    name: "Спальня",
    area: "18,2 м²",
    icon: "🛏️",
    position: { x: -2.0, y: 0.8, z: -1.5 },
    target: { x: 0, y: 0.3, z: 0 },
    markerPosition: { x: -1.2, y: 0.3, z: -1.2 },
  },
  {
    id: "bathroom",
    name: "Ванная",
    area: "8,3 м²",
    icon: "🚿",
    position: { x: 1.8, y: 0.8, z: -1.8 },
    target: { x: 0, y: 0.3, z: 0 },
    markerPosition: { x: 1.2, y: 0.3, z: -1.2 },
  },
];

// Предустановленные виды
export const VIEWS = {
  "3d": "overview",
  perspective: "living-room",
  top: "bedroom",
};
