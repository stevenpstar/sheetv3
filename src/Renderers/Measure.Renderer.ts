import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { RenderFourTop } from "./Elements/TimeSignature.js";
import { RenderTrebleClef } from "./Elements/TrebleClef.js";
import { RenderNote, RenderRest, RenderStem, RenderStemRevise, RenderTies, renderLedgerLines } from "./Note.Renderer.js";

const line_space = 10;
const line_width = 1;
const endsWidth = 2;

const debug = true;
const noteXBuffer = 9;

function RenderMeasure(
  measure: Measure, renderProps: RenderProperties, hovId: number,
  mousePos: { x: number, y: number }, lastMeasure: boolean,
  noteInput: boolean, index: number, restInput: boolean) {

    if (hovId === measure.ID)
      RenderHovered(measure, renderProps, hovId, mousePos, noteInput, restInput);
    if (debug)
      RenderDebug(measure, renderProps, index);

    RenderMeasureBase(measure, renderProps, mousePos, lastMeasure);
    RenderNotes(measure, renderProps);
}

function RenderDebug(
  measure: Measure,
  renderProps: RenderProperties,
  index: number){
    const { canvas, context, camera } = renderProps;

    if (measure.Divisions.length === 0) {
      console.error("measure has no divisions");
      return;
    }

    const fDiv = measure.Divisions[0];

    measure.Divisions.forEach((div: Division, i: number) => {
      const x = div.Bounds.x + camera.x + 2;
      const y = div.Bounds.y + div.Bounds.height + camera.y;
      context.fillStyle = debugGetDurationName(div.Duration).colour;
      context.fillRect(x, y + 10, 
                       div.Bounds.width - 4, 5);
      context.fillStyle = "black";
      context.font = "8px serif";
      context.fillText(debugGetDurationName(div.Duration).name, x,
                       y + 25);

      context.fillStyle = "black";
      context.fillText(div.Beat.toString(), x,
                       y + 40);
    });
    if (index === 0) {
      context.fillStyle = "black";
      context.fillText("Dur:", 
                       fDiv.Bounds.x + camera.x - 30,
                         fDiv.Bounds.y + camera.y + fDiv.Bounds.height + 25);
      context.fillText("Beat:", 
                       fDiv.Bounds.x + camera.x - 30,
                         fDiv.Bounds.y + camera.y + fDiv.Bounds.height + 40);
    }

  }

interface debugValueProperties {
  name: string;
  colour: string;
}

function debugGetDurationName(duration: number, alpha: number = 255): debugValueProperties {
  let name = "";
  let g: number = 150;
  let r: number = 0;
  let b: number = 0;
  let a: number = alpha;

  switch (duration) {
    case 1:
      name = "1";
      break;
    case 0.5:
      name = "1/2";
      b = 130;
      r = 100;
      break;
    case 0.25:
      name = "1/4";
      b = 130;
      break;
    case 0.125:
      name = "1/8";
      b = 200;
      break;
    case 0.0625:
      name = "1/16";
      b = 220;
      r = 100;
      break;
    case 0.03125:
      name = "1/32";
      b = 200;
      g = 70;
      r = 100;
      break;
    default:
      name = "unknown"
      g = 0;
      r = 255;
  }
  const colour = `rgba(${r}, ${g}, ${b}, ${a})`;
  return { name: name, colour: colour };
}

function RenderHovered(
  measure: Measure,
  renderProps: RenderProperties,
  hovId: number,
  mousePos: { x: number, y: number },
  noteInput: boolean,
  restInput: boolean) {
    
    const { canvas, context, camera } = renderProps;

    const line = Measure.GetLineHovered(mousePos.y, measure, camera);
      if (noteInput) {
        context.fillStyle = "rgb(0, 0, 255, 0.1)"; 
        const lineY = measure.Bounds.y + (line.num * (line_space / 2) - (line_space / 4));
        context.fillRect(line.bounds.x + camera.x, lineY + camera.y, line.bounds.width, line.bounds.height);
      }
      // now we are going to test "Sections" as they were in v2
      const divisions = measure.Divisions;
      divisions.forEach(s => {
        if (s.Bounds.IsHovered(mousePos.x, mousePos.y, camera)) {
          if (noteInput) {
         //   context.fillStyle = debugGetDurationName(s.Duration, 0.2).colour; 
         //   context.fillRect(s.Bounds.x + camera.x, s.Bounds.y + camera.y, s.Bounds.width, s.Bounds.height);
            const noteY = measure.Bounds.y + (line.num * (line_space / 2));// + (line_space / 2));
            // temp note
            const tempNoteProps = {
              Beat: s.Beat,
              Duration: 0.25,
              Line: line.num,
              Rest: false,
              Tied: false
            } 

            const tempNote = new Note(tempNoteProps);
            RenderNote(tempNote,
                       renderProps,
                       new Bounds(s.Bounds.x + noteXBuffer,
                       noteY, 0, 0), true);
          }
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

    const lastEndThickness = lastMeasure ?
      endsWidth * 2 : endsWidth;

    const measureBegin = 
      `M${msr.Bounds.x + camera.x} ${ msr.Bounds.y + (msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${endsWidth} v ${line_space * 4} h -${endsWidth} Z`;
    const measureEnd = 
      `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x} ${ msr.Bounds.y + (msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${lastEndThickness} v ${line_space * 4 + 1} h -${lastEndThickness} Z`;
    const measureDoubleEnd = 
      `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x - 4} ${msr.Bounds.y + (msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${endsWidth} v ${line_space * 4 + 1} h -${endsWidth} Z`;


  for (let l=0;l<5;l++) {
        const lineString = `M${msr.Bounds.x + camera.x} ${msr.Bounds.y + (msr.Bounds.height / 2) - (line_space * 2) + line_space * l + camera.y} h ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;
        const linePath = new Path2D(lineString);
        context.fill(linePath);
      }
      context.fill(new Path2D(measureBegin));
      context.fill(new Path2D(measureEnd));
      if (lastMeasure) {
        context.fill(new Path2D(measureDoubleEnd));
      }

      if (msr.RenderClef) { RenderMeasureClef(canvas, context, msr, "treble", camera); }
      if (msr.RenderTimeSig) { 
        const xOff = msr.RenderClef ? 32 : 4;
        RenderTimeSig(renderProps, msr, "4", "4", xOff);
      }
}

function RenderMeasureClef(
  c: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  msr: Measure,
  clef: string,
  cam: Camera): void {

    const clefVert = (msr.Bounds.height / 2) + (line_space * 2);
    const clefPath = RenderTrebleClef(
      msr.Bounds.x + 16 + cam.x,
      msr.Bounds.y + cam.y + (msr.Bounds.height / 2 + (line_space * 2)));

    ctx.fill(new Path2D(clefPath));
}

function RenderTimeSig(
  renderProps: RenderProperties,
  msr: Measure,
  top: string,
  bottom: string,
  xOffset: number): void {
    const topString = RenderFourTop(
      msr.Bounds.x + xOffset + renderProps.camera.x,
      msr.Bounds.y + renderProps.camera.y + (15 * 5) - 5);
    const botString = RenderFourTop(
      msr.Bounds.x + xOffset + renderProps.camera.x,
      msr.Bounds.y + renderProps.camera.y + (19 * 5) - 4);

    renderProps.context.fill(new Path2D(topString));
    renderProps.context.fill(new Path2D(botString));
  }

interface DivGroup {
  Divisions: Division[];
  Notes: Array<Note[]>;
};

interface DivGroups {
  DivGroups: DivGroup[];
}

function RenderNotes(
  msr: Measure,
  renderProps: RenderProperties) {
  
  const { canvas, context, camera } = renderProps;
  const testGroups: DivGroups = { DivGroups: [] };
  let startFlag = false;
  let divs: Division[] = [];
  let notes: Array<Note[]> = [];

  msr.Divisions.forEach((div: Division, i: number) => {
    const divNotes = msr.Notes.filter((note: Note) => note.Beat === div.Beat);
    divNotes.sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    });
    divNotes.forEach(n => {
      if (n.Beat === div.Beat && n.Rest === false) {
//        const yPos = (msr.Bounds.y + camera.y) + (n.Line * (line_space / 2) + 5);
        const yPos = msr.Bounds.y + n.Line * 5;
        RenderNote(n,
                   renderProps,
                   new Bounds(div.Bounds.x + noteXBuffer, yPos, 10, 10),
                   n.Selected);      
//        RenderStem(context, msr.Notes, div, camera);                                                     
      }
    });
    if (divNotes.length === 0) {
      RenderRest(context, div, camera);
      if (startFlag) {
        testGroups.DivGroups.push({ Divisions: divs, Notes: notes });
        divs = [];
        notes = [];
      }
      return;
    }
    if (!startFlag) {
      if (div.Duration > 0.125) {
        divs.push(div);
        notes.push(divNotes);
        testGroups.DivGroups.push({ Divisions: divs, Notes: notes });
        divs = [];
        notes = [];
      } else {
        divs.push(div);
        notes.push(divNotes);
        startFlag = true;
      }
    } else {
      if (div.Duration > 0.125) { // TODO: Division breaks
        // End current group
        startFlag = false;
        testGroups.DivGroups.push({ Divisions: divs, Notes: notes });
        divs = [];
        notes = [];

        // Create a new group
        divs.push(div);
        notes.push(divNotes);
        testGroups.DivGroups.push({ Divisions: divs, Notes: notes });
        divs = [];
        notes = [];

      } else {
        divs.push(div);
        notes.push(divNotes);
        if (i === msr.Divisions.length - 1) {
           testGroups.DivGroups.push({ Divisions: divs, Notes: notes });
           divs = [];
           notes = [];
        }
      }
    }
    renderLedgerLines(msr.Notes, div, renderProps);
  });
  testGroups.DivGroups.forEach((group: DivGroup, i: number) => {
    if (group.Divisions.length > 0) {
      RenderStemRevise(renderProps, group.Notes, group.Divisions);
    }
  });
  RenderTies(renderProps, msr.Divisions, msr.Notes);
}

interface NoteGroup {
  startBeat: number;
  endBeat: number;
}

function GetNoteGroups(msr: Measure): NoteGroup[] {
  let startBeat = -1;
  let endBeat = -1;
  const noteGroups = []

  return noteGroups;
}

export { RenderMeasure }
