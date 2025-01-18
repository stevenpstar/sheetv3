import { Division } from "./Division.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import {
  ArticulationSymbol,
  RenderSymbol,
} from "../Renderers/MusicFont.Renderer.js";
import { Note, Theme } from "../entry.js";
import { StemDirection } from "../Renderers/Note.Renderer.js";
import { GetStaffMiddleLine, Staff } from "./Staff.js";

enum ArticulationType {
  NONE,
  ACCENT,
}

class Articulation {
  Type: ArticulationType;
  Beat: number;
  Staff: number;
  constructor(type: ArticulationType, beat: number, staff: number) {
    this.Type = type;
    this.Beat = beat;
    this.Staff = staff;
  }
  Render(
    renderProps: RenderProperties,
    notes: Note[],
    staves: Staff[],
    div: Division,
    theme: Theme,
  ): void {
    RenderArticulation(renderProps, this.Type, div, staves, notes, theme);
  }
}

function RenderArticulation(
  renderProps: RenderProperties,
  type: ArticulationType,
  div: Division,
  staves: Staff[],
  notes: Note[],
  theme: Theme,
): void {
  if (notes.length == 1 && notes[0].Rest) {
    console.error("Trying to render accent when there are no notes");
    return;
  }
  notes.sort((a: Note, b: Note) => {
    return a.Line - b.Line;
  });

  var accentYPos = 0;
  if (div.Direction == StemDirection.Up) {
    accentYPos = notes[notes.length - 1].Bounds.y + 20;
  } else {
    accentYPos = notes[0].Bounds.y - 6;
  }

  // Articulations need to be rendered above or below the stave
  const lineHeight = 5;
  // the 4 in this equation is number of lines from middle to top of stave
  const staveTop =
    div.Bounds.y +
    GetStaffMiddleLine(staves, div.Staff) * lineHeight -
    4 * lineHeight -
    6; // 6 is a small buffer so the articulation is not directly on top of stave may be configurable later
  const staveBot =
    div.Bounds.y +
    GetStaffMiddleLine(staves, div.Staff) * lineHeight +
    4 * lineHeight +
    16; // 6 is a small buffer so the articulation is not directly on top of stave may be configurable later

  if (accentYPos > staveTop && div.Direction == StemDirection.Down) {
    accentYPos = staveTop;
  } else if (accentYPos < staveBot && div.Direction == StemDirection.Up) {
    accentYPos = staveBot;
  }

  var symbol: ArticulationSymbol;
  switch (type) {
    case ArticulationType.ACCENT:
      if (div.Direction == StemDirection.Up) {
        symbol = ArticulationSymbol.AccentBelow;
      } else {
        symbol = ArticulationSymbol.AccentAbove;
      }
    default:
      symbol = ArticulationSymbol.AccentAbove;
  }

  RenderSymbol(
    renderProps,
    symbol,
    div.Bounds.x + div.NoteXBuffer,
    accentYPos,
    theme,
    false,
  );
}

export { Articulation, ArticulationType };
