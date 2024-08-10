import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Message } from "../Types/Message.js";
import { MeasureSettings } from "../entry.js";
import { Camera } from "./Camera.js";
import { Clef } from "./Clef.js";
import { type Division } from "./Division.js";
import { Instrument } from "./Instrument.js";
import { Note } from "./Note.js";
import { Page } from "./Page.js";
import { Staff } from "./Staff.js";
import { TimeSignature } from "./TimeSignatures.js";
interface MeasureProps {
    Instrument: Instrument;
    Bounds: Bounds;
    TimeSignature: {
        top: number;
        bottom: number;
    };
    KeySignature: string;
    Notes: Note[];
    Staves: Staff[];
    Clefs: Clef[];
    RenderClef: boolean;
    RenderTimeSig: boolean;
    RenderKey: boolean;
    Camera: Camera;
    Page: Page;
    Message: (msg: Message) => void;
    Settings?: MeasureSettings;
}
declare class Measure implements ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Instrument: Instrument;
    Bounds: Bounds;
    Editable: boolean;
    Clefs: Clef[];
    TimeSignature: TimeSignature;
    KeySignature: string;
    Notes: Note[];
    Divisions: Division[];
    RenderClef: boolean;
    RenderKey: boolean;
    RenderTimeSig: boolean;
    Camera: Camera;
    Page: Page;
    PageLine: Number;
    Message: (msg: Message) => void;
    Staves: Staff[];
    XOffset: number;
    Line: number;
    RunningID: {
        count: number;
    };
    constructor(properties: MeasureProps, runningId: {
        count: number;
    });
    GetLineHovered(y: number, staffNum: number): {
        num: number;
        bounds: Bounds;
    };
    GetNotePositionOnLine(line: number, staff: number): number;
    GetBoundsWithOffset(): Bounds;
    SetXOffset(): void;
    CreateDivisions(cam: Camera, afterInput?: boolean): void;
    Reposition(prevMsr: Measure): void;
    GetMeasureHeight(): number;
    GetGrandMeasureHeight(): number;
    GetGrandMeasureMidLine(): number;
    NEW_GetMeasureHeight(): number;
    AddNote(note: Note, fromInput?: boolean): void;
    ClearNonRestNotes(beat: number, staff: number): void;
    ClearRestNotes(beat: number, staff: number): void;
    ClearMeasure(ignoreNotes?: Note[]): void;
    DeleteSelected(): void;
    GetMinimumWidth(): number;
    ReturnSelectableElements(): ISelectable[];
    IsHovered(x: number, y: number, cam: Camera): boolean;
    ChangeTimeSignature(top: number, bottom: number, transpose: boolean): void;
}
export { Measure, MeasureProps, Division, Clef };
//# sourceMappingURL=Measure.d.ts.map