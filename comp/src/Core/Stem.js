import { Flags, RenderSymbol } from "../Renderers/MusicFont.Renderer.js";
import { StemDirection } from "../Renderers/Note.Renderer.js";
class Stem {
    constructor(bounds) {
        this.Selected = false;
        this.Editable = false;
        this.Bounds = bounds;
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
    Render(renderProps, theme, isBeamed, dir) {
        renderProps.context.fillStyle = theme.NoteElements;
        if (this.Selected) {
            renderProps.context.fillStyle = theme.SelectColour;
        }
        renderProps.context.fillRect(this.Bounds.x + renderProps.camera.x, this.Bounds.y + renderProps.camera.y, this.Bounds.width, this.Bounds.height);
        // This will eventually be moved, so every non-beam stem will have flags for
        // now lmao
        if (!isBeamed) {
            const flag = dir === StemDirection.Up ? Flags.QuaverDown : Flags.QuaverUp;
            const yBuffer = dir ? 0 : 10;
            RenderSymbol(renderProps, flag, this.Bounds.x, this.Bounds.y + this.Bounds.height, theme, this.Selected);
        }
    }
    RenderBounds(context, cam) {
        context.fillStyle = "rgba(255, 0, 0, 255)";
        context.fillRect(this.Bounds.x + cam.x, this.Bounds.y + cam.y, this.Bounds.width, this.Bounds.height);
    }
}
export { Stem };
