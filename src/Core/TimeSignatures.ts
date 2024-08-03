import { RenderSymbol, TimeSigNumbers } from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { StaffType } from "./Instrument.js";
import { Measure } from "./Measure.js";
import { GetStaffMiddleLine } from "./Staff.js";
//const Key: Map<string, string[]> = new Map<string, string[]>([
//  ["amin", ""],
//  ["
//])
//

// Returns beats that should separate note groupings etc.
function ReturnBreakPoints(timeSig: { top: number, bottom: number }): number[] {
  const bPoints: number[] = [];
  const timeSigString = timeSig.top.toString() + "/" + timeSig.bottom.toString();
  switch (timeSigString) {
    case "4/4":
    default:
      bPoints.push(3);
  }
  return bPoints;
}

class TimeSignature implements ISelectable {
  ID: number;
  Selected: boolean;
  SelType: SelectableTypes;
  Bounds: Bounds;
  Editable: boolean;
  GBounds: Bounds;
  top: number;
  bottom: number;

  TopPosition: { x: number, y: number };
  BotPosition: { x: number, y: number };

  // This is a temporary solution, will need to rework to make staff count
  // generic
  GTopPosition: { x: number, y: number };
  GBotPosition: { x: number, y: number };


  constructor(top: number, bottom: number, useSymbol: boolean = false) {
    this.Selected = false;
    this.SelType = SelectableTypes.TimeSig;
    this.top = top;
    this.bottom = bottom;
    this.Editable = true;
    this.TopPosition = { x: 0, y: 0 };
    this.BotPosition = { x: 0, y: 0 };
    this.GTopPosition = { x: 0, y: 0 };
    this.GBotPosition = { x: 0, y: 0 };
    this.Bounds = new Bounds(0, 0, 0, 0);
    this.GBounds = new Bounds(0, 0, 0, 0);
    // use symbol? (bad name) for things like common and cut common
  }

  render(renderProps: RenderProperties, msr: Measure, theme: Theme): void {
    let tGlyph: TimeSigNumbers = GetTimeSignatureGlyph(this.top);
    let bGlyph: TimeSigNumbers = GetTimeSignatureGlyph(this.bottom);

    RenderSymbol( renderProps, tGlyph, this.TopPosition.x, this.TopPosition.y, theme, this.Selected);
    RenderSymbol( renderProps, bGlyph, this.BotPosition.x, this.BotPosition.y, theme, this.Selected);

    if (msr.Instrument.Staff === StaffType.Grand) {
      RenderSymbol( renderProps, tGlyph, this.GTopPosition.x, this.GTopPosition.y, theme, this.Selected);
      RenderSymbol( renderProps, bGlyph, this.GBotPosition.x, this.GBotPosition.y, theme, this.Selected);
    }
  }

  SetBounds(msr: Measure, staff: number): void {
    if (staff === StaffType.Single) {
      const msrMidLine = GetStaffMiddleLine(msr.Staves, staff);
      this.Bounds.x = msr.Bounds.x + msr.XOffset - 25;
      this.Bounds.y = msr.Bounds.y + ((msrMidLine - 4) * 5);
      this.Bounds.width = 30;
      this.Bounds.height = 50;
      this.TopPosition.x = this.Bounds.x;
      this.TopPosition.y = msr.Bounds.y + ((msrMidLine - 2) * 5);
      this.BotPosition.x = this.Bounds.x;
      this.BotPosition.y = msr.Bounds.y + ((msrMidLine + 2) * 5);
    } else {
      const msrMidLine = msr.GetGrandMeasureMidLine();
      this.GBounds.x = msr.Bounds.x + msr.XOffset - 25;
      this.GBounds.y = msr.Bounds.y + msr.GetMeasureHeight() +((msrMidLine - 4) * 5);
      this.GBounds.width = 30;
      this.GBounds.height = 50;
      this.GTopPosition.x = this.Bounds.x;
      this.GTopPosition.y = msr.Bounds.y + msr.GetMeasureHeight() + ((msrMidLine - 2) * 5);
      this.GBotPosition.x = this.Bounds.x;
      this.GBotPosition.y = msr.Bounds.y + msr.GetMeasureHeight() + ((msrMidLine + 2) * 5);
    }
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam) || this.GBounds.IsHovered(x, y, cam);
  }
}

function GetTimeSignatureGlyph(n: number): TimeSigNumbers {
  let glyph: TimeSigNumbers;
  switch (n) {
    case 0:
      glyph = TimeSigNumbers.Zero;
      break;
    case 1:
      glyph = TimeSigNumbers.One;
      break;
   case 2:
      glyph = TimeSigNumbers.Two;
      break;
   case 3:
      glyph = TimeSigNumbers.Three;
      break;
   case 4:
      glyph = TimeSigNumbers.Four;
      break;
   case 5:
      glyph = TimeSigNumbers.Five;
      break;
  case 6:
      glyph = TimeSigNumbers.Six;
      break;
  case 7:
      glyph = TimeSigNumbers.Seven;
      break;
  case 8:
      glyph = TimeSigNumbers.Eight;
      break;
  case 9:
      glyph = TimeSigNumbers.Nine;
      break;
  }
  return glyph;
}

function CreateTimeSignature(props: {top: number, bottom: number}): TimeSignature {
  return new TimeSignature(props.top, props.bottom);
}

export { TimeSignature, CreateTimeSignature }
