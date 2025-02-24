import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { DivGroup } from "./Division.js";
declare enum FlagDirection {
    UP = 0,
    DOWN = 1
}
declare class Flag implements ISelectable {
    ID: number;
    Selected: boolean;
    Editable: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds;
    Direction: FlagDirection;
    Duration: number;
    constructor(bounds: Bounds, flagDir: FlagDirection, duration: number);
    IsHovered(x: number, y: number, cam: Camera): boolean;
    SetBounds(bounds: Bounds): Bounds;
    Render(renderProps: RenderProperties, theme: Theme): void;
    RenderBounds(context: CanvasRenderingContext2D, cam: Camera): void;
}
declare function CreateFlags(group: DivGroup): Flag[];
export { Flag, CreateFlags };
//# sourceMappingURL=Flag.d.ts.map