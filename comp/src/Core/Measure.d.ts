import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Message } from "../Types/Message.js";
import { MeasureSettings } from "../entry.js";
import { Articulation } from "./Articulation.js";
import { Barline } from "./Barline.js";
import { Camera } from "./Camera.js";
import { Clef } from "./Clef.js";
import { type Division } from "./Division.js";
import { Dynamic } from "./Dynamic.js";
import { Instrument } from "./Instrument.js";
import { Note } from "./Note.js";
import { Page } from "./Page.js";
import { Staff } from "./Staff.js";
import { TimeSignature } from "./TimeSignatures.js";
import { Voice } from "./Voice.js";
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
    Barlines: Barline[];
}
declare class Measure implements ISelectable {
    ID: number;
    Num: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Instrument: Instrument;
    Bounds: Bounds;
    Editable: boolean;
    RenderClef: boolean;
    RenderKey: boolean;
    RenderTimeSig: boolean;
    Camera: Camera;
    Page: Page;
    PageLine: Number;
    Message: (msg: Message) => void;
    TimeSignature: TimeSignature;
    KeySignature: string;
    Voices: Voice[];
    ActiveVoice: number;
    Clefs: Clef[];
    Staves: Staff[];
    Barlines: Barline[];
    Articulations: Articulation[];
    Dynamics: Dynamic[];
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
    CreateDivisions(cam: Camera): void;
    Reposition(prevMsr: Measure): void;
    GetMeasureHeight(): number;
    AddNote(note: Note, fromInput?: boolean): void;
    ClearNonRestNotes(beat: number, staff: number): void;
    ClearRestNotes(beat: number, staff: number): void;
    ClearMeasure(ignoreNotes?: Note[]): void;
    DeleteSelected(): void;
    GetMinimumWidth(): number;
    ReturnSelectableElements(): ISelectable[];
    IsHovered(x: number, y: number, cam: Camera): boolean;
    ChangeTimeSignature(top: number, bottom: number, transpose: boolean): void;
    RecalculateBarlines(): void;
}
export { Measure, MeasureProps, Division, Clef };
//# sourceMappingURL=Measure.d.ts.map