class Camera {
    constructor(x, y) {
        this.Dragging = false;
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.Zoom = 1;
    }
    SetDragging(drag, x, y, config, cam) {
        var _a;
        if (((_a = config.CameraSettings) === null || _a === void 0 ? void 0 : _a.DragEnabled) === false) {
            this.Dragging = false;
            return;
        }
        this.Dragging = drag;
        if (this.Dragging) {
            this.DraggingX = x / cam.Zoom;
            this.DraggingY = y / cam.Zoom;
        }
        else {
            this.DraggingX = 0.0;
            this.DraggingY = 0.0;
            this.oldX = this.x;
            this.oldY = this.y;
        }
    }
    DragCamera(mx, my) {
        if (!this.Dragging) {
            return false;
        }
        this.x = Math.floor(this.oldX + mx - this.DraggingX);
        this.y = Math.floor(this.oldY + my - this.DraggingY);
        return true;
    }
}
export { Camera };
