import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { RenderTrebleClef } from "./Elements/TrebleClef.js";
import { RenderNote, RenderStem } from "./Note.Renderer.js";

const line_space = 10;
const line_width = 1;
const endsWidth = 2;

const debug = true;

// Renders the basic lines and bar endings of the measure, no notes or clefs or time
// time signatures
function RenderMeasureBase(c: HTMLCanvasElement,
                           ctx: CanvasRenderingContext2D,
                           msr: Measure,
                           hoveredId: number,
                          mousePos: {x: number, y: number}): void {

    if (hoveredId === msr.ID) {

      // testing line selection
      const line = Measure.GetLineHovered(mousePos.y, msr);
      ctx.fillStyle = "rgb(0, 0, 255, 0.1)"; 
      ctx.fillRect(line.bounds.x, line.num * (line_space / 2) - (line_space / 4), line.bounds.width, line.bounds.height);
      // now we are going to test "Sections" as they were in v2
      const beatDistr = msr.BeatDistribution;
      beatDistr.forEach(s => {
        if (s.bounds.IsHovered(mousePos.x, mousePos.y)) {
          ctx.fillStyle = "rgb(0, 255, 0, 0.1)"; 
          ctx.fillRect(s.bounds.x, s.bounds.y, s.bounds.width, s.bounds.height);
          RenderNote(c, ctx, s.bounds.x + 18, (line.num * (line_space / 2) + (line_space / 2)), false, "blue");
        }
      })
    }
    ctx.fillStyle = "black";

    const measureBegin = 
      `M${msr.Bounds.x} ${(msr.Bounds.height / 2) - (line_space * 2)} h ${endsWidth} v ${line_space * 4} h -${endsWidth} Z`;
    const measureEnd = 
      `M${msr.Bounds.x + msr.Bounds.width} ${(msr.Bounds.height / 2) - (line_space * 2)} h ${endsWidth} v ${line_space * 4} h -${endsWidth} Z`;

  for (let l=0;l<5;l++) {
        const lineString = `M${msr.Bounds.x} ${(msr.Bounds.height / 2) - (line_space * 2) + line_space * l} h ${msr.Bounds.width.toString()} v ${line_width} h -${msr.Bounds.width.toString()} Z`;
        const linePath = new Path2D(lineString);
        ctx.fill(linePath);
      }
      ctx.fill(new Path2D(measureBegin));
      ctx.fill(new Path2D(measureEnd));

      if (msr.RenderClef) { RenderMeasureClef(c, ctx, msr, "treble"); }
      RenderNotes(c, ctx, msr);
}

function RenderMeasureClef(
  c: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  msr: Measure,
  clef: string): void {

    const clefVert = (msr.Bounds.height / 2) + (line_space * 2);
    const clefPath = RenderTrebleClef(msr.Bounds.x + 18, msr.Bounds.y + (msr.Bounds.height / 2 + (line_space * 2)));

    ctx.fill(new Path2D(clefPath));
  }

function RenderNotes(c: HTMLCanvasElement, 
                     ctx: CanvasRenderingContext2D,
                     msr: Measure)
                     {
  // render notes here

  msr.Notes.forEach((n: Note) => {
    // match to beat distribution
    msr.BeatDistribution.forEach(d => {
      if (d.startNumber === n.Beat) {
        const yPos = (n.Line * (line_space / 2) + (line_space / 2));
        RenderNote(c, ctx, d.bounds.x + 18, yPos, n.Selected);
        RenderStem(ctx, msr.Notes, d);
      }
    })
  })
}

export { RenderMeasureBase }
