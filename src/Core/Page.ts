import { Bounds } from "../Types/Bounds.js";

interface Margins {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const defaultMargins: Margins = {
  left: 0,
  right: 0,
  top: 10,
  bottom: 10
}

interface PageLine {
  Number: number;
  YPos: number;
  LineBounds: Bounds;
}

interface MarginAdjuster {
  Name: string;
  Direction: string;
  Bounds: Bounds;
}

const scale = 6;
const a4w = 210 * scale;
const a4h = 297 * scale;

class Page {
  Margins: Margins;
  // TODO: Change to bounds later
  Bounds: Bounds;
  Number: number;
  PageLines: PageLine[];
  MarginAdj: MarginAdjuster[];
  constructor(x: number, y: number, pageNum: number) {
    this.Margins = defaultMargins;
    this.MarginAdj = [];
    this.Number = pageNum;
    this.Bounds = new Bounds(x, y, a4w, a4h); 
    // left margin
    this.MarginAdj.push({
      Name: "left",
      Direction: "horizontal",
      Bounds: new Bounds(this.Bounds.x + this.Margins.left - 12.5,
                        this.Bounds.y - 25, 25, 25)
    });
    this.PageLines = []; 
    this.PageLines.push(
      {Number: 1,
        YPos: y + this.Margins.top,
        LineBounds: new Bounds(this.Bounds.x - 50, (y + this.Margins.top) - 12.5, 25, 25)});
//    this.PageLines.push(
//      {Number: 2,
//        YPos: y + this.Margins.top,
//        LineBounds: new Bounds(this.Bounds.x - 50, (y + this.Margins.top + 300) - 12.5, 25, 25)});
  }

  // TODO Later will need to add ability to add lines in between others
  AddLine(): PageLine {
    const latestLine = this.PageLines[this.PageLines.length-1];
    const newLine: PageLine = {
      Number: latestLine.Number + 1,
      YPos: this.Bounds.y + this.Margins.top,
      LineBounds: new Bounds(this.Bounds.x - 50, latestLine.LineBounds.y + 300 - 12.5, 25, 25)};
      this.PageLines.push(newLine);
      return newLine;
    }
}

export { Page, MarginAdjuster }
