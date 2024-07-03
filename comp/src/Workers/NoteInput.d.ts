import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
declare function AddNoteOnMeasure(msr: Measure, noteValue: number, line: number, beat: Division, rest: boolean): void;
declare function InputOnMeasure(msr: Measure, noteValue: number, x: number, y: number, cam: Camera, rest: boolean): void;
declare function UpdateNoteBounds(msr: Measure, staff: number): void;
declare function CreateTuplet(selNotes: Map<Measure, Note[]>, count: number): number;
export { InputOnMeasure, UpdateNoteBounds, CreateTuplet, AddNoteOnMeasure };
//# sourceMappingURL=NoteInput.d.ts.map