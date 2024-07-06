import { Bounds } from "../Types/Bounds.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";

class Stem {
  Bounds: Bounds;
  Direction: string;
  StartPoint: number;
  EndPoint: number;
  constructor(bounds: Bounds) {
    this.Bounds = bounds;
  }

  // TODO: Note: Camera is currently baked into actual position
  // This will change when we separate the creation logic from
  // the Note renderer
  Render(context: CanvasRenderingContext2D, cam: Camera, theme: Theme): void {
    context.fillStyle = theme.NoteElements;
    context.fillRect(this.Bounds.x,
                     this.Bounds.y,
                     this.Bounds.width,
                     this.Bounds.height);
  }
}

export { Stem };
