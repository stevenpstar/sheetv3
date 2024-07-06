import { RenderSymbol, TimeSigNumbers } from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
import { StaffType } from "./Instrument.js";
import { Measure } from "./Measure.js";
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
        this.TopPosition = { x: 0, y: 0 };
        this.BotPosition = { x: 0, y: 0 };
        this.GTopPosition = { x: 0, y: 0 };
        this.GBotPosition = { x: 0, y: 0 };
        this.Bounds = new Bounds(0, 0, 0, 0);
        this.GBounds = new Bounds(0, 0, 0, 0);
        // use symbol? (bad name) for things like common and cut common
    }
    render(renderProps, msr, theme) {
        let tGlyph = GetTimeSignatureGlyph(this.top);
        let bGlyph = GetTimeSignatureGlyph(this.bottom);
        RenderSymbol(renderProps, tGlyph, this.TopPosition.x, this.TopPosition.y, theme, this.Selected);
        RenderSymbol(renderProps, bGlyph, this.BotPosition.x, this.BotPosition.y, theme, this.Selected);
        if (msr.Instrument.Staff === StaffType.Grand) {
            RenderSymbol(renderProps, tGlyph, this.GTopPosition.x, this.GTopPosition.y, theme, this.Selected);
            RenderSymbol(renderProps, bGlyph, this.GBotPosition.x, this.GBotPosition.y, theme, this.Selected);
        }
    }
    SetBounds(msr, staff) {
        if (staff === StaffType.Single) {
            const msrMidLine = Measure.GetMeasureMidLine(msr);
            this.Bounds.x = msr.Bounds.x + msr.XOffset - 25;
            this.Bounds.y = msr.Bounds.y + ((msrMidLine - 4) * 5);
            this.Bounds.width = 30;
            this.Bounds.height = 50;
            this.TopPosition.x = this.Bounds.x;
            this.TopPosition.y = msr.Bounds.y + ((msrMidLine - 2) * 5);
            this.BotPosition.x = this.Bounds.x;
            this.BotPosition.y = msr.Bounds.y + ((msrMidLine + 2) * 5);
        }
        else {
            const msrMidLine = msr.GetGrandMeasureMidLine();
            this.GBounds.x = msr.Bounds.x + msr.XOffset - 25;
            this.GBounds.y = msr.Bounds.y + msr.GetMeasureHeight() + ((msrMidLine - 4) * 5);
            this.GBounds.width = 30;
            this.GBounds.height = 50;
            this.GTopPosition.x = this.Bounds.x;
            this.GTopPosition.y = msr.Bounds.y + msr.GetMeasureHeight() + ((msrMidLine - 2) * 5);
            this.GBotPosition.x = this.Bounds.x;
            this.GBotPosition.y = msr.Bounds.y + msr.GetMeasureHeight() + ((msrMidLine + 2) * 5);
        }
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam) || this.GBounds.IsHovered(x, y, cam);
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
