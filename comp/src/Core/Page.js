import { Bounds } from "../Types/Bounds.js";
const defaultMargins = {
    left: 40,
    right: 40,
    top: 40,
    bottom: 40,
};
const scale = 6;
const a4w = 210 * scale;
const a4h = 297 * scale;
class Page {
    constructor(x, y, pageNum) {
        this.Margins = defaultMargins;
        this.MarginAdj = [];
        this.Number = pageNum;
        this.Bounds = new Bounds(x, y, a4w, a4h);
        // left margin
        this.MarginAdj.push({
            Name: "left",
            Direction: "horizontal",
            Bounds: new Bounds(this.Bounds.x + this.Margins.left - 12.5, this.Bounds.y - 25, 25, 25),
        });
        this.PageLines = [];
        this.PageLines.push({
            Number: 1,
            YPos: y + this.Margins.top,
            LineBounds: new Bounds(this.Bounds.x - 50, y + this.Margins.top - 12.5, 25, 25),
        });
    }
    // TODO Later will need to add ability to add lines in between others
    // TODO Later will need to make line height adjustable/have formattable
    // settings
    AddLine(lineHeight) {
        const latestLine = this.PageLines[this.PageLines.length - 1];
        const newLine = {
            Number: latestLine.Number + 1,
            YPos: this.Bounds.y + this.Margins.top,
            LineBounds: new Bounds(this.Bounds.x - 50, latestLine.LineBounds.y + lineHeight - 12.5, 25, 25),
        };
        this.PageLines.push(newLine);
        return newLine;
    }
}
export { Page };
