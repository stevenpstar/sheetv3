class Stem {
    constructor(bounds, div) {
        this.Selected = false;
        this.Editable = false;
        this.Bounds = bounds;
        this.Division = div;
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
    Render(renderProps, theme) {
        renderProps.context.fillStyle = theme.NoteElements;
        if (this.Selected) {
            renderProps.context.fillStyle = theme.SelectColour;
        }
        renderProps.context.fillRect(this.Bounds.x + renderProps.camera.x, this.Bounds.y + renderProps.camera.y, this.Bounds.width, this.Bounds.height);
    }
    RenderBounds(context, cam) {
        context.fillStyle = "rgba(255, 0, 0, 255)";
        context.fillRect(this.Bounds.x + cam.x, this.Bounds.y + cam.y, this.Bounds.width, this.Bounds.height);
    }
}
export { Stem };
