import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
declare enum BarlineType {
    SINGLE = 0,
    DOUBLE = 1,
    END = 2,
    REPEAT_BEGIN = 3,
    REPEAT_END = 4
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
    constructor(pos: BarlinePos, type: BarlineType);
    IsHovered(x: number, y: number, cam: Camera): boolean;
}
declare function RenderBarline(renderProps: RenderProperties, endMeasure: Measure, beginMeasure: Measure, cam: Camera): void;
declare function PositionMatch(pos: BarlinePos, type: BarlineType): boolean;
export { Barline, BarlineType, BarlinePos, RenderBarline, PositionMatch };
//# sourceMappingURL=Barline.d.ts.map