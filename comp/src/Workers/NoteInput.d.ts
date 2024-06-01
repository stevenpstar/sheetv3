import { Camera } from "../Core/Camera.js";
import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
declare function InputOnMeasure(msr: Measure, noteValue: number, x: number, y: number, cam: Camera, rest: boolean): void;
declare function UpdateNoteBounds(msr: Measure, staff: number): void;
declare function CreateTuplet(selNotes: Map<Measure, Note[]>, count: number): number;
export { InputOnMeasure, UpdateNoteBounds, CreateTuplet };
//# sourceMappingURL=NoteInput.d.ts.map