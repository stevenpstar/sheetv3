import { Flags, RenderSymbol } from "../Renderers/MusicFont.Renderer.js";
import { StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { Division } from "./Division.js";

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
  Division: Division;
  constructor(bounds: Bounds, div: Division) {
    this.Bounds = bounds;
    this.Division = div;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }

  Render(renderProps: RenderProperties, theme: Theme): void {
    renderProps.context.fillStyle = theme.NoteElements;
    if (this.Selected) {
      renderProps.context.fillStyle = theme.SelectColour;
    }
    renderProps.context.fillRect(
      this.Bounds.x + renderProps.camera.x,
      this.Bounds.y + renderProps.camera.y,
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
