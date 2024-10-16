import { DynamicSymbol } from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
declare class Dynamic implements ISelectable {
    Symbol: DynamicSymbol;
    Staff: number;
    Beat: number;
    Selected: boolean;
    Editable: boolean;
    Bounds: Bounds;
    SelType: SelectableTypes;
    ID: number;
    constructor(symbol: DynamicSymbol, staff: number, beat: number);
    IsHovered(x: number, y: number, cam: Camera): boolean;
}
declare function RenderDynamic(renderProps: RenderProperties, measure: Measure, dynamic: Dynamic, theme: Theme): void;
export { Dynamic, RenderDynamic };
//# sourceMappingURL=Dynamic.d.ts.map