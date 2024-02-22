class Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  IsHovered(ix: number, iy: number): boolean {
    return (ix >= this.x && ix <= this.x + this.width &&
            iy >= this.y && iy <= this.y + this.height);
  }
}

export { Bounds };
