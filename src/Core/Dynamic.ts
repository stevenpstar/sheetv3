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

const DynamicSymbolMap = new Map<string, DynamicSymbol>([
  ["p", DynamicSymbol.Piano],
  ["m", DynamicSymbol.Mezzo],
  ["f", DynamicSymbol.Forte],
  ["r", DynamicSymbol.Rinforzando],
  ["s", DynamicSymbol.SForzando],
  ["z", DynamicSymbol.Z],
  ["n", DynamicSymbol.N],
]);

// Trying non-class based to see how it goes, will prob re-write as
// they will need to be selectable/deletable - but may re-write how that
// functions too, wait and see
class Dynamic implements ISelectable {
  Symbol: string;
  Staff: number;
  Beat: number;
  Selected: boolean;
  Editable: boolean;
  Bounds: Bounds;
  SelType: SelectableTypes;
  ID: number;
  constructor(symbol: string, staff: number, beat: number) {
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
  if (dynamic.Symbol === "") {
    console.error("(RenderDynamic): No Symbol String");
    return;
  }
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
  const divNotes = measure.Voices[measure.ActiveVoice].Notes.filter(
    (n: Note) => n.Beat === div.Beat,
  ).sort((a: Note, b: Note) => a.Line - b.Line);
  const minHeight = div.Bounds.y + 11 * 10;
  const noteHeight = divNotes[divNotes.length - 1].Bounds.y;
  const yBuffer = 20; // this will  be changed, needs a minimum y value so the dynamic is not on the staff
  const yPos = minHeight > noteHeight ? minHeight : noteHeight + yBuffer;
  const xBuffer = 16;
  for (let i = 0; i < dynamic.Symbol.length; i++) {
    RenderSymbol(
      renderProps,
      DynamicSymbolMap.get(dynamic.Symbol[i]),
      div.Bounds.x + xBuffer * i,
      yPos,
      theme,
      false,
    );
  }
}

export { Dynamic, RenderDynamic };
