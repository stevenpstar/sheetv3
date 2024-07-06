import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
declare enum StemDirection {
    Up = 0,
    Down = 1
}
declare enum BeamDirection {
    UpMax = 0,
    UpDynamic = 1,
    DownMax = 2,
    DownDynamic = 3,
    Flat = 4
}
declare function RenderNote(note: Note, renderProps: RenderProperties, Bounds: Bounds, selected: boolean, flipNote: boolean, stemDir: StemDirection, theme: Theme, colour?: string): void;
declare function RenderDots(renderProps: RenderProperties, note: Note, dotXStart: number): void;
declare function RenderRest(ctx: CanvasRenderingContext2D, div: Division, cam: Camera, note: Note, msr: Measure, theme: Theme): void;
declare function RenderTuplets(renderProps: RenderProperties, divisions: Division[], notes: Note[], staff: number, msr: Measure, theme: Theme): void;
declare function RenderTies(renderProps: RenderProperties, divisions: Division[], notes: Note[], staff: number, msr: Measure): void;
declare function DetermineStemDirection(notes: Array<Note[]>, divisions: Division[], staff: number, measure: Measure): StemDirection;
declare function RenderStemRevise(renderProps: RenderProperties, notes: Array<Note[]>, divisions: Division[], staff: number, msr: Measure, beamDir: BeamDirection, theme: Theme, colour?: string): void;
declare function renderLedgerLines(notes: Note[], division: Division, renderProps: RenderProperties, staff: number, msr: Measure, theme: Theme, colour?: string): void;
export { RenderNote, RenderRest, renderLedgerLines, RenderStemRevise, RenderTies, DetermineStemDirection, RenderDots, StemDirection, BeamDirection, RenderTuplets };
//# sourceMappingURL=Note.Renderer.d.ts.map