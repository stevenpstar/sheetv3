import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { Division } from "./Division.js";
declare class Stem implements ISelectable {
    ID: number;
    Selected: boolean;
    Bounds: Bounds;
    SelType: SelectableTypes.Stem;
    Editable: boolean;
    Direction: string;
    StartPoint: number;
    EndPoint: number;
    Staff: number;
    Division: Division;
    constructor(bounds: Bounds, div: Division);
    IsHovered(x: number, y: number, cam: Camera): boolean;
    Render(renderProps: RenderProperties, theme: Theme): void;
    RenderBounds(context: CanvasRenderingContext2D, cam: Camera): void;
}
export { Stem };
//# sourceMappingURL=Stem.d.ts.map