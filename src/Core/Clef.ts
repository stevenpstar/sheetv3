import { Clefs, RenderScaledSymbol, stdFontSize } from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { Subdivision, SubdivisionType } from "./Division.js";
import { StaffType } from "./Instrument.js";
import { Measure } from "./Measure.js";
import { GetStaffMiddleLine } from "./Staff.js";

// TODO: Move this somewhere central
const lineSpace = 10;

class Clef implements ISelectable {
  ID: number;
  Selected: boolean;
  Staff: number;
  Position: { x: number; y: number };
  Bounds: Bounds;
  SelType: SelectableTypes;
  Type: string;
  Beat: number;
  Editable: boolean;
  // This clef will effect notes after this beat (rendered after note on beat)
  PostClef: boolean;
  constructor(id: number, type: string, beat: number, staff: number, postClef: boolean = false) {
    this.ID = id;
    this.Position = { x: 0, y: 0 };
    this.Staff = staff;
    this.Bounds = new Bounds(0, 0, 0, 0);
    this.Type = type;
    this.SelType = SelectableTypes.Clef;
    this.Beat = beat;
    this.Selected = false;
    // TODO: shouldn't only be true
    this.Editable = true;
    this.PostClef = postClef;
  }

  render(renderProps: RenderProperties, theme: Theme): void {
    let clefSymbol: Clefs;
    switch (this.Type) {
      case "treble":
        clefSymbol = Clefs.G;
        break;
      case "bass":
        clefSymbol = Clefs.F;
        break;
      default:
        clefSymbol = Clefs.G;
    }

    const scale = this.Beat == 1 ? stdFontSize * 1.0 : stdFontSize * 0.65;

    RenderScaledSymbol(
      renderProps,
      clefSymbol,
      this.Position.x,
      this.Position.y,
      theme,
      this.Selected,
      scale
    );
  }

  SetBounds(msr: Measure, staff: number): void {
    // There is a difference between position and bounds
    // Position is for visually positioning the clef glyph, bounds is for selection
    const div = msr.Voices[msr.ActiveVoice].Divisions.find(
      (d) => d.Beat === this.Beat && d.Staff === staff,
    );
    let xPosition: number = msr.Bounds.x;
    if (this.Beat !== 1) {
      if (div) {
        if (this.PostClef) {
          const POST_clefSubDiv = div.Subdivisions
            .find((sd: Subdivision) => sd.Type === SubdivisionType.POST_CLEF);
          if (POST_clefSubDiv) {
            xPosition = POST_clefSubDiv.Bounds.x;
          } else {
            xPosition = div.Bounds.x;
          }
        }
        else {
          const clefSubDiv = div.Subdivisions
            .find((sd: Subdivision) => sd.Type === SubdivisionType.CLEF);
          if (clefSubDiv) {
            xPosition = clefSubDiv.Bounds.x;
          } else {
            xPosition = div.Bounds.x;
          }
        }
      }
    }
    //    this.Beat === 1
    //      ? msr.Bounds.x
    //      : div.Subdivisions.find(
    //          (sd: Subdivision) => sd.Type === SubdivisionType.CLEF,
    //        ).Bounds.x;
    // If not first measure, and not first on line we need to check/compare
    // clefs. Clef may need to be rendered on previous measures last POST_CLEF
    // subdivision
    if (msr.PrevMeasure) {
      if (msr.PrevMeasure.PageLine !== msr.PageLine) {
        // do stuff
      }
    }
    const xBuffer = 3;
    let lineBuffer = 2;
    let yBuffer = 0;
    const msrMidLine = GetStaffMiddleLine(msr.Staves, staff);
    this.Position.x = xPosition + xBuffer;
    this.Bounds.x = xPosition + xBuffer;
    switch (this.Type) {
      case "bass":
        lineBuffer = -2;
    }
    this.Position.y = div.Bounds.y + yBuffer + (msrMidLine + lineBuffer) * 5;
    this.Bounds.y = div.Bounds.y;
    this.Bounds.width = 30;
    this.Bounds.height = 85;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }
}

function GetNoteClefType(
  msr: Measure,
  noteBeat: number,
  staff: StaffType,
): string {
  let clefType: string = staff === StaffType.Single ? "treble" : "bass";
  if (staff === StaffType.Single) {
    msr.Clefs.sort((a: Clef, b: Clef) => {
      return a.Beat - b.Beat;
    });
    msr.Clefs.forEach((c: Clef) => {
      // clefs can change part way through measure
      // need to find latest clef to pass on to note (by beat)
      if (c.Beat <= noteBeat) {
        clefType = c.Type;
        return;
      }
    });
  }
  return clefType;
}

export { Clef, GetNoteClefType };
