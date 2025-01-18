import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { ConfigSettings } from "../entry.js";
import { StemDirection } from "./Note.Renderer.js";
declare function RenderMeasure(measure: Measure, renderProps: RenderProperties, mousePos: {
    x: number;
    y: number;
}, lastMeasure: boolean, noteInput: boolean, index: number, restInput: boolean, noteValue: number, config: ConfigSettings): void;
declare function IsFlippedNote(notes: Note[], index: number, dir: StemDirection): boolean;
export { RenderMeasure, IsFlippedNote };
//# sourceMappingURL=Measure.Renderer.d.ts.map