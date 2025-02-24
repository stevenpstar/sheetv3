import { StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { Beam } from "./Beam.js";
import { Flag } from "./Flag.js";
import { Measure } from "./Measure.js";
import { Note } from "./Note.js";
import { Stem } from "./Stem.js";
import { Voice } from "./Voice.js";
declare enum SubdivisionType {
    CLEF = 0,
    GRACE_NOTE = 1,
    NOTE = 2
}
type Subdivision = {
    Type: SubdivisionType;
    Bounds: Bounds;
};
interface Division {
    Beat: number;
    Duration: number;
    Bounds: Bounds;
    Staff: number;
    StaffGroup: number;
    Direction: StemDirection;
    NoteXBuffer: number;
    Subdivisions: Subdivision[];
}
interface DivGroup {
    Divisions: Division[];
    Notes: Array<Note[]>;
    CrossStaff: boolean;
    Staff: number;
    Beams: Beam[];
    Stems: Stem[];
    Flags: Flag[];
    StemDir: StemDirection;
}
interface DivGroups {
    DivGroups: DivGroup[];
}
declare const DivisionMinWidth = 30;
declare const DivisionMaxWidth = 40;
declare function CreateDivisions(msr: Measure, notes: Note[], staff: number, voice: Voice): Division[];
declare function ResizeDivisions(msr: Measure, divisions: Division[], staff: number): void;
declare function GetDivisionTotalWidth(divisions: Division[]): number;
declare function GetDivisionGroups(msr: Measure, staff: number): DivGroup[];
declare function IsRestOnBeat(beat: number, notes: Note[], staff: number): boolean;
export { Division, CreateDivisions, ResizeDivisions, GetDivisionTotalWidth, DivGroups, DivGroup, Subdivision, SubdivisionType, IsRestOnBeat, GetDivisionGroups, DivisionMinWidth, DivisionMaxWidth, };
//# sourceMappingURL=Division.d.ts.map