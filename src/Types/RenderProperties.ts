import { Camera } from "../Core/Camera.js";
interface RenderProperties {
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  camera: Camera
}

export { RenderProperties };
