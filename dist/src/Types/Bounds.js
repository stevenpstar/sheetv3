var Bounds = /** @class */ (function () {
    function Bounds(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Bounds.prototype.IsHovered = function (ix, iy) {
        return (ix >= this.x && ix <= this.x + this.width &&
            iy >= this.y && iy <= this.y + this.height);
    };
    return Bounds;
}());
export { Bounds };
