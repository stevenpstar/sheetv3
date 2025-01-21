class Bounds {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    IsHovered(ix, iy, cam) {
        if (this.height < 0) {
            return (ix >= this.x + cam.x &&
                ix <= this.x + cam.x + this.width &&
                iy > this.y - Math.abs(this.height) + cam.y &&
                iy <= this.y + cam.y);
        }
        return (ix >= this.x + cam.x &&
            ix <= this.x + cam.x + this.width &&
            iy >= this.y + cam.y &&
            iy <= this.y + cam.y + this.height);
    }
}
export { Bounds };
