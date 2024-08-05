import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
declare class Stem implements ISelectable {
    ID: number;
    Selected: boolean;
    Bounds: Bounds;
    SelType: SelectableTypes.Stem;
    Editable: boolean;
    Direction: string;
    StartPoint: number;
    EndPoint: number;
    constructor(bounds: Bounds);
    IsHovered(x: number, y: number, cam: Camera): boolean;
    Render(context: CanvasRenderingContext2D, cam: Camera, theme: Theme): void;
}
export { Stem };
//# sourceMappingURL=Stem.d.ts.map