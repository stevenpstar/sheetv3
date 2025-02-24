import { StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
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
    Staff: number;
    constructor(bounds: Bounds);
    IsHovered(x: number, y: number, cam: Camera): boolean;
    Render(renderProps: RenderProperties, theme: Theme, isBeamed: boolean, dir: StemDirection): void;
    RenderBounds(context: CanvasRenderingContext2D, cam: Camera): void;
}
export { Stem };
//# sourceMappingURL=Stem.d.ts.map