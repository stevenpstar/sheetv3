import { Bounds } from '../Types/Bounds.js';
import { ISelectable, SelectableTypes } from '../Types/ISelectable.js';
import { Camera } from './Camera.js';
import { Clef } from './Clef.js';
import { type Division } from './Division.js';
import { Instrument } from './Instrument.js';
import { Note } from './Note.js';
import { Page } from './Page.js';
import { TimeSignature } from './TimeSignatures.js';
interface MeasureProps {
    Instrument: Instrument;
    Bounds: Bounds;
    TimeSignature: {
        top: number;
        bottom: number;
    };
    KeySignature: string;
    Notes: Note[];
    Clef: string;
    RenderClef: boolean;
    RenderTimeSig: boolean;
    RenderKey: boolean;
    Camera: Camera;
    Page: Page;
}
declare class Measure implements ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Instrument: Instrument;
    Bounds: Bounds;
    Editable: boolean;
    Clefs: Clef[];
    GrandClefs: Clef[];
    TimeSignature: TimeSignature;
    KeySignature: string;
    Notes: Note[];
    BNotes: Note[];
    Divisions: Division[];
    BDivisions: Division[];
    RenderClef: boolean;
    RenderKey: boolean;
    RenderTimeSig: boolean;
    Camera: Camera;
    Page: Page;
    PageLine: Number;
    XOffset: number;
    SALineTop: number;
    SALineMid: number;
    SALineBot: number;
    SALineTopSave: number;
    SALineBotSave: number;
    SALineTopDef: number;
    SALineBotDef: number;
    PrefBoundsY: number;
    PrevBoundsH: number;
    SBLineTop: number;
    SBLineMid: number;
    SBLineBot: number;
    SBLineTopSave: number;
    SBLineBotSave: number;
    SBLineTopDef: number;
    SBLineBotDef: number;
    SBOffset: number;
    Line: number;
    RunningID: {
        count: number;
    };
    constructor(properties: MeasureProps, runningId: {
        count: number;
    });
    static GetLineHovered(y: number, msr: Measure): {
        num: number;
        bounds: Bounds;
    };
    static GetNotePositionOnLine(msr: Measure, line: number): number;
    static GetMeasureHeight(msr: Measure, cam: Camera): number;
    static GetMeasureMidLine(msr: Measure): number;
    GetBoundsWithOffset(): Bounds;
    SetXOffset(): void;
    CreateDivisions(cam: Camera, afterInput?: boolean): void;
    Reposition(prevMsr: Measure): void;
    GetMeasureHeight(): number;
    GetGrandMeasureHeight(): number;
    GetGrandMeasureMidLine(): number;
    ResetHeight(): void;
    ReHeightenTop(expand: boolean, lineOver: number): void;
    ReHeightenBot(expand: boolean, lineOver: number): void;
    ReHeightenTopGrand(expand: boolean, lineOver: number): void;
    ReHeightenBotGrand(expand: boolean, lineOver: number): void;
    ResetTopHeight(): void;
    AddNote(note: Note): void;
    ClearNonRestNotes(beat: number, staff: number): void;
    ClearRestNotes(beat: number, staff: number): void;
    DeleteSelected(): void;
    GetMinimumWidth(): number;
    ReturnSelectableElements(): ISelectable[];
    IsHovered(x: number, y: number, cam: Camera): boolean;
    ChangeTimeSignature(top: number, bottom: number, transpose: boolean): void;
}
export { Measure, MeasureProps, Division, Clef };
//# sourceMappingURL=Measure.d.ts.map