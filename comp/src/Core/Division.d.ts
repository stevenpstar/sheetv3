import { StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { Beam } from "./Beam.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
import { Note } from "./Note.js";
import { Stem } from "./Stem.js";
interface Division {
    Beat: number;
    Duration: number;
    Bounds: Bounds;
    Staff: number;
    StaffGroup: number;
    Direction: StemDirection;
    NoteXBuffer: number;
}
interface DivGroup {
    Divisions: Division[];
    Notes: Array<Note[]>;
    CrossStaff: boolean;
    Staff: number;
    Beams: Beam[];
    Stems: Stem[];
    StemDir?: StemDirection;
}
interface DivGroups {
    DivGroups: DivGroup[];
}
declare const DivisionMinWidth = 30;
declare const DivisionMaxWidth = 40;
declare function CreateDivisions(msr: Measure, notes: Note[], staff: number, cam: Camera): Division[];
declare function ResizeDivisions(msr: Measure, divisions: Division[], staff: number): void;
declare function GetDivisionTotalWidth(divisions: Division[]): number;
declare function GetDivisionGroups(msr: Measure, staff: number): DivGroup[];
declare function IsRestOnBeat(beat: number, notes: Note[], staff: number): boolean;
export { Division, CreateDivisions, ResizeDivisions, GetDivisionTotalWidth, DivGroups, DivGroup, IsRestOnBeat, GetDivisionGroups, DivisionMinWidth, DivisionMaxWidth, };
//# sourceMappingURL=Division.d.ts.map