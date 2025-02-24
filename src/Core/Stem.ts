import { Flags, RenderSymbol } from "../Renderers/MusicFont.Renderer.js";
import { StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
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

  Render(
    renderProps: RenderProperties,
    theme: Theme,
    isBeamed: boolean,
    dir: StemDirection,
  ): void {
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
    // This will eventually be moved, so every non-beam stem will have flags for
    // now lmao
    if (!isBeamed) {
      const flag = dir === StemDirection.Up ? Flags.QuaverDown : Flags.QuaverUp;
      const yBuffer = dir ? 0 : 10;
      RenderSymbol(
        renderProps,
        flag,
        this.Bounds.x,
        this.Bounds.y + this.Bounds.height,
        theme,
        this.Selected,
      );
    }
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
