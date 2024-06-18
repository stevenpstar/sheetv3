import { ConfigSettings } from "../Types/Config";

class Camera {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  Zoom: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.Zoom = 1;
  }
}

export { Camera };
