import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { ISelectable } from "../Types/ISelectable.js";
declare function AddNoteOnMeasure(msr: Measure, noteValue: number, line: number, beat: Division, rest: boolean, grace: boolean): void;
declare function InputOnMeasure(msr: Measure, noteValue: number, x: number, y: number, cam: Camera, rest: boolean, grace: boolean): void;
declare function RecreateDivisionGroups(msr: Measure): void;
declare function UpdateNoteBounds(msr: Measure, staff: number): void;
declare function CreateTuplet(selNotes: Map<Measure, ISelectable[]>, count: number): number;
export { InputOnMeasure, UpdateNoteBounds, CreateTuplet, AddNoteOnMeasure, RecreateDivisionGroups, };
//# sourceMappingURL=NoteInput.d.ts.map