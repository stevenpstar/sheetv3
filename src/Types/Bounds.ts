import { Camera } from "../Core/Camera.js";

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

  IsHovered(ix: number, iy: number, cam: Camera): boolean {
    if (this.height < 0) {
      return (
        ix >= this.x + cam.x &&
        ix <= this.x + cam.x + this.width &&
        iy > this.y - Math.abs(this.height) + cam.y &&
        iy <= this.y + cam.y
      );
    }
    return (
      ix >= this.x + cam.x &&
      ix <= this.x + cam.x + this.width &&
      iy >= this.y + cam.y &&
      iy <= this.y + cam.y + this.height
    );
  }

  IsHoveredNoCamera(ix: number, iy: number): boolean {
      if (this.height < 0) {
        return (
          ix >= this.x &&
          ix <= this.x + this.width &&
          iy > this.y - Math.abs(this.height) &&
          iy <= this.y
        );
      }
      return (
        ix >= this.x &&
        ix <= this.x + this.width &&
        iy >= this.y &&
        iy <= this.y + this.height
      );
    }


  Intersects(b: Bounds): boolean {
    let intersect = false;
    // We need to check if any of the corners of the bounds are hovering us,
    // and then do the same in reverse
    if (this.IsHoveredNoCamera(b.x, b.y)) {
      return true;
    }
    if (this.IsHoveredNoCamera(b.x + b.width, b.y + b.height)) {
      return true;
    }

    if (this.IsHoveredNoCamera(b.x, b.y + b.height)) {
      return true;
    }

    if (this.IsHoveredNoCamera(b.x + b.width, b.y + b.height)) {
      return true;
    }
    // Reverse checks

    if (b.IsHoveredNoCamera(this.x, this.y)) {
      return true;
    }
    if (b.IsHoveredNoCamera(this.x + this.width, this.y + this.height)) {
      return true;
    }

    if (b.IsHoveredNoCamera(this.x, this.y + this.height)) {
      return true;
    }

    if (b.IsHoveredNoCamera(this.x + this.width, this.y + this.height)) {
      return true;
    }

    return intersect;
  }
}

export { Bounds };
