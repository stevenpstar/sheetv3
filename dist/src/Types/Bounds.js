var Bounds = /** @class */ (function () {
    function Bounds(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Bounds.prototype.IsHovered = function (ix, iy, cam) {
        return (ix >= this.x + cam.x && ix <= this.x + cam.x + this.width &&
            iy >= this.y + cam.y && iy <= this.y + cam.y + this.height);
    };
    return Bounds;
}());
export { Bounds };
