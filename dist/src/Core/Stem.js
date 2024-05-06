class Stem {
    constructor(bounds) {
        this.Bounds = bounds;
    }
    // TODO: Note: Camera is currently baked into actual position
    // This will change when we separate the creation logic from
    // the Note renderer
    Render(context, cam) {
        context.fillStyle = "black";
        context.fillRect(this.Bounds.x, this.Bounds.y, this.Bounds.width, this.Bounds.height);
    }
}
export { Stem };
