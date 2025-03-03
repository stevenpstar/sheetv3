import { Camera } from "../Core/Camera.js";
import { Theme } from "./Config.js";
interface RenderProperties {
  context: CanvasRenderingContext2D;
  camera: Camera;
  theme: Theme;
}

export { RenderProperties };
