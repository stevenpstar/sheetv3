import {
  DynamicSymbol,
  RenderSymbol,
} from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { Division, Measure } from "./Measure.js";
import { Note } from "./Note.js";

// Trying non-class based to see how it goes, will prob re-write as
// they will need to be selectable/deletable - but may re-write how that
// functions too, wait and see
class Dynamic implements ISelectable {
  Symbol: DynamicSymbol;
  Staff: number;
  Beat: number;
  Selected: boolean;
  Editable: boolean;
  Bounds: Bounds;
  SelType: SelectableTypes;
  ID: number;
  constructor(symbol: DynamicSymbol, staff: number, beat: number) {
    this.Symbol = symbol;
    this.Staff = staff;
    this.Beat = beat;
  }
  IsHovered(x: number, y: number, cam: Camera): boolean {
    return false;
  }
}

function RenderDynamic(
  renderProps: RenderProperties,
  measure: Measure,
  dynamic: Dynamic,
  theme: Theme,
): void {
  if (dynamic.Staff >= measure.Staves.length) {
    console.error("(RenderDynamic): Staff out of bounds of measure");
    return;
  }
  let findDiv = measure.Divisions.filter(
    (d: Division) => d.Beat === dynamic.Beat,
  );
  if (findDiv.length === 0) {
    console.error("(RenderDynamic): Division Beat not matching with dynamic");
    return;
  }
  const div = findDiv[0];
  const divNotes = measure.Notes.filter((n: Note) => n.Beat === div.Beat).sort(
    (a: Note, b: Note) => a.Line - b.Line,
  );
  const minHeight = div.Bounds.y + 11 * 10;
  const noteHeight = divNotes[divNotes.length - 1].Bounds.y;
  const yBuffer = 20; // this will  be changed, needs a minimum y value so the dynamic is not on the staff
  const yPos = minHeight > noteHeight ? minHeight : noteHeight + yBuffer;
  RenderSymbol(renderProps, dynamic.Symbol, div.Bounds.x, yPos, theme, false);
}

export { Dynamic, RenderDynamic };
