import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Camera } from "./Camera.js";
interface TupleDetails {
    StartBeat: number;
    EndBeat: number;
    Value: number;
    Count: number;
}
interface NoteProps {
    Beat: number;
    Duration: number;
    Line: number;
    Rest: boolean;
    Tied: boolean;
    Staff: number;
    Tuple: boolean;
    TupleDetails?: TupleDetails;
    Clef: string;
    Editable?: boolean;
    Grace: boolean;
}
declare class Note implements ISelectable {
    Beat: number;
    Duration: number;
    Line: number;
    Rest: boolean;
    Tied: boolean;
    Accidental: number;
    ID: number;
    SelType: SelectableTypes;
    Clef: string;
    Editable: boolean;
    Grace: boolean;
    Opacity: number;
    TiedStart: number;
    TiedEnd: number;
    Bounds: Bounds;
    Selected: boolean;
    Staff: number;
    StaffGroup: number;
    Tuple: boolean;
    TupleDetails?: TupleDetails;
    constructor(props: NoteProps);
    SetBounds(bounds: Bounds): void;
    SetID(id: number): void;
    SetTiedStartEnd(s: number, e: number): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
    GetMidiNumber(): number;
}
export { Note, NoteProps, TupleDetails };
//# sourceMappingURL=Note.d.ts.map