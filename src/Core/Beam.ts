import { Bounds } from "../Types/Bounds.js";
import { Camera } from "./Camera.js";

class Beam {
  Bounds: Bounds;
  Direction: string;
  StartPoint: number;
  EndPoint: number;
  constructor(bounds: Bounds) {
    this.Bounds = bounds;
  }

  Render(context: CanvasRenderingContext2D, cam: Camera): void {

  }
}

export { Beam } 
