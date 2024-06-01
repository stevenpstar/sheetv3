import { Camera } from "../Core/Camera";
declare class Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    IsHovered(ix: number, iy: number, cam: Camera): boolean;
}
export { Bounds };
//# sourceMappingURL=Bounds.d.ts.map