import { Note } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";

const noteHead = 'a6.7692 4.5128-33 1011.3543-7.3735 6.7692 4.5128-33 10-11.3543 7.3735'

function RenderNote(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, selected: boolean, colour: string = "black"): void {
  const posString = 'm' + x.toString() + ' ' + (y - 1).toString();
  ctx.fillStyle = selected ? "blue" : colour;
  ctx.fill(new Path2D(posString + noteHead));
}

function RenderStem(ctx: CanvasRenderingContext2D,
                    notes: Note[],
                   beatD: { startNumber: number, value: number, bounds: Bounds }): void {
  const bdNotes = notes.filter((note: Note) => note.Beat === beatD.startNumber);
  bdNotes.sort((a: Note, b: Note) => {
    return a.Line - b.Line;
  });

//  const yPos = (n.Line * (line_space / 2) + (line_space / 2));
  //  Stem Up (default/only for now)
  const yPos = ( bdNotes[bdNotes.length-1].Line * (10 / 2) + (10 / 2));
  const yPos2 = ( bdNotes[0].Line * (10 / 2) + (10 / 2));
  const diff = (yPos - yPos2) + 40;
  ctx.fillStyle = "black";
  // TODO: investigate changing note-head size so that it doesn't end on half
  // pixel
  ctx.fillRect(Math.floor(beatD.bounds.x + 18 + 10), yPos - 5,
               2, -diff);

//  const stem = `M${beatD.bounds.x + 18 + 10} ${yPos - 5} h ${2} v -${diff} h -${2} Z`;
//  ctx.fill(new Path2D(stem));
}

export { RenderNote, RenderStem };
