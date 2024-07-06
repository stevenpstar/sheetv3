import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
declare class TimeSignature implements ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds;
    Editable: boolean;
    GBounds: Bounds;
    top: number;
    bottom: number;
    TopPosition: {
        x: number;
        y: number;
    };
    BotPosition: {
        x: number;
        y: number;
    };
    GTopPosition: {
        x: number;
        y: number;
    };
    GBotPosition: {
        x: number;
        y: number;
    };
    constructor(top: number, bottom: number, useSymbol?: boolean);
    render(renderProps: RenderProperties, msr: Measure, theme: Theme): void;
    SetBounds(msr: Measure, staff: number): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
}
declare function CreateTimeSignature(props: {
    top: number;
    bottom: number;
}): TimeSignature;
export { TimeSignature, CreateTimeSignature };
//# sourceMappingURL=TimeSignatures.d.ts.map