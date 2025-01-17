import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Camera } from "./Camera.js";
declare enum BarlineType {
    STANDARD = 0,
    REPEAT_BEGIN = 1,
    REPEAT_END = 2
}
declare enum BarlinePos {
    START = 0,
    END = 1
}
declare class Barline implements ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds;
    Editable: boolean;
    Position: BarlinePos;
    Type: BarlineType;
    IsHovered(x: number, y: number, cam: Camera): boolean;
    Render(): void;
}
export { Barline, BarlineType };
//# sourceMappingURL=Barline.d.ts.map