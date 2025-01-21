import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";

class Stem implements ISelectable {
  ID: number;
  Selected: boolean = false;
  Bounds: Bounds;
  SelType: SelectableTypes.Stem;
  Editable: boolean = false;
  Direction: string;
  StartPoint: number;
  EndPoint: number;
  Staff: number;
  constructor(bounds: Bounds) {
    this.Bounds = bounds;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }

  // TODO: Note: Camera is currently baked into actual position
  // This will change when we separate the creation logic from
  // the Note renderer
  Render(context: CanvasRenderingContext2D, cam: Camera, theme: Theme): void {
    context.fillStyle = theme.NoteElements;
    if (this.Selected) {
      context.fillStyle = theme.SelectColour;
    }
    context.fillRect(
      this.Bounds.x + cam.x,
      this.Bounds.y + cam.y,
      this.Bounds.width,
      this.Bounds.height,
    );
  }
  RenderBounds(context: CanvasRenderingContext2D, cam: Camera): void {
    context.fillStyle = "rgba(255, 0, 0, 255)";
    context.fillRect(
      this.Bounds.x + cam.x,
      this.Bounds.y + cam.y,
      this.Bounds.width,
      this.Bounds.height,
    );
  }
}

export { Stem };
