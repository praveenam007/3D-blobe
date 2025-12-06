export enum ShapeType {
  TORUS = 'torus',
  CUBE = 'cube',
  SPHERE = 'sphere',
  ICOSAHEDRON = 'icosahedron'
}

export interface SceneState {
  shape: ShapeType;
  color: string;
  speed: number;
  wireframe: boolean;
  roughness: number;
  metalness: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ToolResponse {
  shape?: string;
  color?: string;
  speed?: number;
  roughness?: number;
  metalness?: number;
}