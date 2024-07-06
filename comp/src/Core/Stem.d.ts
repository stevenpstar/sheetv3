import { Bounds } from "../Types/Bounds.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
declare class Stem {
    Bounds: Bounds;
    Direction: string;
    StartPoint: number;
    EndPoint: number;
    constructor(bounds: Bounds);
    Render(context: CanvasRenderingContext2D, cam: Camera, theme: Theme): void;
}
export { Stem };
//# sourceMappingURL=Stem.d.ts.map