import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { StaffType } from "./Instrument.js";
import { Measure } from "./Measure.js";
declare class Clef implements ISelectable {
    ID: number;
    Selected: boolean;
    Position: {
        x: number;
        y: number;
    };
    Bounds: Bounds;
    SelType: SelectableTypes;
    Type: string;
    Beat: number;
    Editable: boolean;
    constructor(id: number, pos: {
        x: number;
        y: number;
    }, type: string, beat: number);
    render(renderProps: RenderProperties, theme: Theme): void;
    SetBounds(msr: Measure, staff: number): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
}
declare function GetNoteClefType(msr: Measure, noteBeat: number, staff: StaffType): string;
export { Clef, GetNoteClefType };
//# sourceMappingURL=Clef.d.ts.map