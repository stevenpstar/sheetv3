import { Camera } from "../Core/Camera.js";
import { BeatDistribution, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { RenderTrebleClef } from "./Elements/TrebleClef.js";
import { RenderNote, RenderRest, RenderStem, renderLedgerLines } from "./Note.Renderer.js";

const line_space = 10;
const line_width = 1;
const endsWidth = 2;

const debug = true;

function RenderMeasure(
  measure: Measure, renderProps: RenderProperties, hovId: number,
  mousePos: { x: number, y: number }, lastMeasure: boolean) {

    if (hovId === measure.ID)
      RenderHovered(measure, renderProps, hovId, mousePos);

    RenderMeasureBase(measure, renderProps, mousePos, lastMeasure);
    RenderNotes(measure, renderProps);
}

function RenderHovered(
  measure: Measure,
  renderProps: RenderProperties,
  hovId: number,
  mousePos: { x: number, y: number }) {
    
    const { canvas, context, camera } = renderProps;

    const line = Measure.GetLineHovered(mousePos.y, measure, camera);
      context.fillStyle = "rgb(0, 0, 255, 0.1)"; 
      const lineY = measure.Bounds.y + (line.num * (line_space / 2) - (line_space / 4));
      context.fillRect(line.bounds.x + camera.x, lineY + camera.y, line.bounds.width, line.bounds.height);
      // now we are going to test "Sections" as they were in v2
      const beatDistr = measure.BeatDistribution;
      beatDistr.forEach(s => {
        if (s.bounds.IsHovered(mousePos.x, mousePos.y, camera)) {
          const onLedger = ((line.num < 10 || line.num > 20) && line.num % 2 !== 0);
          context.fillStyle = "rgb(0, 255, 0, 0.1)"; 
          context.fillRect(s.bounds.x + camera.x, s.bounds.y + camera.y, s.bounds.width, s.bounds.height);
          const noteY = measure.Bounds.y + camera.y + (line.num * (line_space / 2) + (line_space / 2));
          // temp note
          const tempNoteProps = {
            Beat: s.startNumber,
            Duration: 0.25,
            Line: line.num
          }

          const tempNote = new Note(tempNoteProps);
          RenderNote(tempNote,
                     renderProps,
                     new Bounds(s.bounds.x + 18 + camera.x,
                     noteY, 0, 0), true);
        }
      });
  }

// Renders the basic lines and bar endings of the measure, no notes or clefs or time
// time signatures
function RenderMeasureBase(
  msr: Measure,
  renderProps: RenderProperties,
  mousePos: {x: number, y: number},
  lastMeasure: boolean): void {

    const { canvas, context, camera } = renderProps;

    context.fillStyle = "black";

    const measureBegin = 
      `M${msr.Bounds.x + camera.x} ${(msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${endsWidth} v ${line_space * 4} h -${endsWidth} Z`;
    const measureEnd = 
      `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x} ${(msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${endsWidth} v ${line_space * 4 + 1} h -${endsWidth} Z`;
    const measureDoubleEnd = 
      `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x - 4} ${(msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${endsWidth} v ${line_space * 4 + 1} h -${endsWidth} Z`;


  for (let l=0;l<5;l++) {
        const lineString = `M${msr.Bounds.x + camera.x} ${(msr.Bounds.height / 2) - (line_space * 2) + line_space * l + camera.y} h ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;
        const linePath = new Path2D(lineString);
        context.fill(linePath);
      }
      context.fill(new Path2D(measureBegin));
      context.fill(new Path2D(measureEnd));
      if (lastMeasure) {
        context.fill(new Path2D(measureDoubleEnd));
      }

      if (msr.RenderClef) { RenderMeasureClef(canvas, context, msr, "treble", camera); }
}

function RenderMeasureClef(
  c: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  msr: Measure,
  clef: string,
  cam: Camera): void {

    const clefVert = (msr.Bounds.height / 2) + (line_space * 2);
    const clefPath = RenderTrebleClef(msr.Bounds.x + 18 + cam.x, msr.Bounds.y + cam.y + (msr.Bounds.height / 2 + (line_space * 2)));

    ctx.fill(new Path2D(clefPath));
  }

function RenderNotes(
  msr: Measure,
  renderProps: RenderProperties) {
  
  const { canvas, context, camera } = renderProps;

  msr.BeatDistribution.forEach((div: BeatDistribution) => {
    let noteCount = 0;
    msr.Notes.forEach(n => {
      if (n.Beat === div.startNumber) {
        const yPos = (msr.Bounds.y + camera.y) + (n.Line * (line_space / 2) + 5);
        RenderNote(n, renderProps, new Bounds(div.bounds.x + 18 + camera.x, yPos, 0, 0), n.Selected);      
        RenderStem(context, msr.Notes, div, camera);                                                     
        noteCount++;
      }
    });
    if (noteCount === 0) {
      RenderRest(context, div, camera);
      return;
    }

    renderLedgerLines(msr.Notes, div, renderProps);

  });
}

export { RenderMeasure }
