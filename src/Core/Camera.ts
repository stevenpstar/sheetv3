import { ConfigSettings } from "../Types/Config";

class Camera {
  Dragging: boolean;
  DraggingX: number;
  DraggingY: number;
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  Zoom: number;
  // Experimental smooth zoom
  ZoomTarget: number;
  constructor(x: number, y: number) {
    this.Dragging = false;
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.Zoom = 1;
    this.ZoomTarget = this.Zoom;
  }

  SetDragging(
    drag: boolean,
    x: number,
    y: number,
    config: ConfigSettings,
    cam: Camera,
  ): void {
    if (config.CameraSettings?.DragEnabled === false) {
      this.Dragging = false;
      return;
    }

    this.Dragging = drag;
    if (this.Dragging) {
      this.DraggingX = x / cam.Zoom;
      this.DraggingY = y / cam.Zoom;
    } else {
      this.DraggingX = 0.0;
      this.DraggingY = 0.0;
      this.oldX = this.x;
      this.oldY = this.y;
    }
  }

  DragCamera(mx: number, my: number): boolean {
    if (!this.Dragging) {
      return false;
    }
    this.x = Math.floor(this.oldX + mx - this.DraggingX);
    this.y = Math.floor(this.oldY + my - this.DraggingY);
    return true;
  }

  SetZoom(zoom: number): void {
    this.Zoom = zoom;
  }
}

export { Camera };
