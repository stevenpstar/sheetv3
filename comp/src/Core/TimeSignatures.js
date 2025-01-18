import { RenderSymbol, TimeSigNumbers, } from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
import { GetStaffMiddleLine } from "./Staff.js";
//const Key: Map<string, string[]> = new Map<string, string[]>([
//  ["amin", ""],
//  ["
//])
//
// Returns beats that should separate note groupings etc.
function ReturnBreakPoints(timeSig) {
    const bPoints = [];
    const timeSigString = timeSig.top.toString() + "/" + timeSig.bottom.toString();
    switch (timeSigString) {
        case "4/4":
        default:
            bPoints.push(3);
    }
    return bPoints;
}
class TimeSignature {
    constructor(top, bottom, useSymbol = false) {
        this.Selected = false;
        this.SelType = SelectableTypes.TimeSig;
        this.top = top;
        this.bottom = bottom;
        this.Editable = true;
        this.TopPosition = [{ x: 0, y: 0 }];
        this.BotPosition = [{ x: 0, y: 0 }];
        this.Bounds = [new Bounds(0, 0, 0, 0)];
        // use symbol? (bad name) for things like common and cut common
    }
    render(renderProps, msr, theme) {
        let tGlyph = GetTimeSignatureGlyph(this.top);
        let bGlyph = GetTimeSignatureGlyph(this.bottom);
        msr.Staves.forEach((s) => {
            //      if (this.TopPosition.length > msr.Staves.length || this.BotPosition.length >= msr.Staves.length) { return ;}
            RenderSymbol(renderProps, tGlyph, this.TopPosition[s.Num].x, this.TopPosition[s.Num].y, theme, this.Selected);
            RenderSymbol(renderProps, bGlyph, this.BotPosition[s.Num].x, this.BotPosition[s.Num].y, theme, this.Selected);
        });
    }
    SetBounds(msr) {
        // Delete and recreate, potential for optimisation later
        this.Bounds = [];
        this.TopPosition = [];
        this.BotPosition = [];
        //
        msr.Staves.forEach((s) => {
            // These probably shouldn't be recreated every single time
            this.Bounds.push(new Bounds(0, 0, 0, 0));
            this.TopPosition.push({ x: 0, y: 0 });
            this.BotPosition.push({ x: 0, y: 0 });
            const div = msr.Divisions.find((div) => div.Staff === s.Num);
            if (!div) {
                return;
            }
            const divY = div.Bounds.y;
            const msrMidLine = GetStaffMiddleLine(msr.Staves, s.Num);
            this.Bounds[s.Num].x = msr.Bounds.x + msr.XOffset - 25;
            this.Bounds[s.Num].y = divY + (msrMidLine - 4) * 5;
            this.Bounds[s.Num].width = 30;
            this.Bounds[s.Num].height = 50;
            this.TopPosition[s.Num].x = this.Bounds[s.Num].x;
            this.TopPosition[s.Num].y = divY + (msrMidLine - 2) * 5;
            this.BotPosition[s.Num].x = this.Bounds[s.Num].x;
            this.BotPosition[s.Num].y = divY + (msrMidLine + 2) * 5;
        });
    }
    IsHovered(x, y, cam) {
        return this.Bounds.filter((b) => b.IsHovered(x, y, cam)).length > 0;
    }
}
function GetTimeSignatureGlyph(n) {
    let glyph;
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
function CreateTimeSignature(props) {
    return new TimeSignature(props.top, props.bottom);
}
export { TimeSignature, CreateTimeSignature };
