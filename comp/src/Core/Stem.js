class Stem {
    constructor(bounds) {
        this.Selected = false;
        this.Editable = false;
        this.Bounds = bounds;
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
    // TODO: Note: Camera is currently baked into actual position
    // This will change when we separate the creation logic from
    // the Note renderer
    Render(context, cam, theme) {
        context.fillStyle = theme.NoteElements;
        context.fillRect(this.Bounds.x + cam.x, this.Bounds.y + cam.y, this.Bounds.width, this.Bounds.height);
    }
}
export { Stem };
