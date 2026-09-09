export interface CameraPoint {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  description?: string;
}

export const CAMERA_POINTS: CameraPoint[] = [
  {
    id: "overview",
    name: "Общий вид",
    icon: "🏠",
    position: { x: 2.5, y: 1.8, z: 3.5 },
    target: { x: 0, y: 0.3, z: 0 },
    description: "Вид на модель",
  },
  {
    id: "living-room",
    name: "Спереди",
    icon: "👀",
    position: { x: 0, y: 0.8, z: 3 },
    target: { x: 0, y: 0.3, z: 0 },
    description: "Фронтальный вид",
  },
  {
    id: "kitchen",
    name: "Сбоку",
    icon: "🔍",
    position: { x: 3.5, y: 0.8, z: 0 },
    target: { x: 0, y: 0.3, z: 0 },
    description: "Вид справа",
  },
  {
    id: "bedroom",
    name: "Сверху",
    icon: "⬇️",
    position: { x: 0, y: 3.5, z: 0.01 },
    target: { x: 0, y: 0, z: 0 },
    description: "Вид сверху",
  },
  {
    id: "bathroom",
    name: "Крупно",
    icon: "🔎",
    position: { x: 0.8, y: 1.0, z: 1.8 },
    target: { x: 0, y: 0.4, z: 0 },
    description: "Детальный вид",
  },
];
