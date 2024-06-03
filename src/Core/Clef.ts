import { Clefs, RenderSymbol } from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Camera } from "./Camera.js";
import { StaffType } from "./Instrument.js";
import { Measure } from "./Measure.js";

// TODO: Move this somewhere central
const lineSpace = 10;

class Clef implements ISelectable {
  ID: number;
  Selected: boolean;
  Position: { x: number, y: number };
  Bounds: Bounds;
  SelType: SelectableTypes;
  Type: string;
  Beat: number;
  constructor(id: number, pos: { x: number, y: number }, type: string, beat: number) {
    this.ID = id;
    this.Position = pos;
    this.Bounds = new Bounds(0, 0, 0, 0);
    this.Type = type;
    this.SelType = SelectableTypes.Clef;
    this.Beat = beat;
    this.Selected = false;
  }

  render(renderProps: RenderProperties): void {
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

    const colour = this.Selected ? "blue" : "black";

    RenderSymbol(renderProps,
                 clefSymbol,
                 this.Position.x,
                 this.Position.y,
                  colour);
  //  renderProps.context.strokeStyle = "green";
  //  renderProps.context.strokeRect(
  //    this.Bounds.x + renderProps.camera.x,
  //    this.Bounds.y + renderProps.camera.y,
  //    this.Bounds.width,
  //    this.Bounds.height);
  }

  SetBounds(msr: Measure, staff: number): void {
    // There is a difference between position and bounds
    // Position is for visually positioning the clef glyph, bounds is for selection
    const div = msr.Divisions.find(d => d.Beat === this.Beat && d.Staff === staff);
    const xPosition: number = this.Beat === 1 ? 
      msr.Bounds.x : div.Bounds.x;
    const xBuffer = 3;
    // Treble as default, 2
    let lineBuffer = 2;
//    let yBuffer = staff === 0 ? 0 : msr.GetMeasureHeight();
    let yBuffer = 0;
    const msrMidLine = staff === StaffType.Single ?
      Measure.GetMeasureMidLine(msr) : msr.GetGrandMeasureMidLine();
    this.Position.x = xPosition + xBuffer;
    this.Bounds.x = xPosition + xBuffer;
    switch (this.Type) {
      case "bass":
        lineBuffer = -2;
    }
    this.Position.y = div.Bounds.y + yBuffer + ((msrMidLine + lineBuffer) * 5);
    this.Bounds.y = div.Bounds.y;
    this.Bounds.width = 30;
    this.Bounds.height = 85;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }
}

function GetNoteClefType(msr: Measure, noteBeat: number, staff: StaffType): string {
  let clefType: string = staff === StaffType.Single ?
    "treble" : "bass";
  if (staff === StaffType.Single) {
    msr.Clefs.sort((a: Clef, b: Clef) => {
      return a.Beat - b.Beat;
    })
    msr.Clefs.forEach((c: Clef) => {
      // clefs can change part way through measure
      // need to find latest clef to pass on to note (by beat)
      if (c.Beat <= noteBeat) {
        clefType = c.Type;
        return;
      }
    });
  } else {
    msr.GrandClefs.sort((a: Clef, b: Clef) => {
      return a.Beat - b.Beat;
    })
    msr.GrandClefs.forEach((c: Clef) => {
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

export { Clef, GetNoteClefType }
