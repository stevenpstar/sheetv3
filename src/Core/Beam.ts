import { BeamDirection, StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { Camera } from "./Camera.js";
import { DivGroup, Division } from "./Division.js";
import { Measure } from "./Measure.js";
import { Note } from "./Note.js";

class Beam {
  Bounds: Bounds;
  Direction: string;
  StartPoint: {x: number, y: number};
  EndPoint: {x: number, y: number};
  constructor(bounds: Bounds, start: {x: number, y: number}, end: {x: number, y: number}) {
    this.Bounds = bounds;
    this.StartPoint = start;
    this.EndPoint = end;
  }

  Render(context: CanvasRenderingContext2D, cam: Camera): void {
    // TODO: This should eventually be an svg path (probably)
      const svgLine = `
        M ${this.StartPoint.x + cam.x} ${this.StartPoint.y + cam.y}
        L${this.EndPoint.x + cam.x + 2} ${this.EndPoint.y + cam.y}
        V${(this.EndPoint.y + cam.y) + 5} 
        L${this.StartPoint.x + cam.x} ${this.StartPoint.y + 5 + cam.y} z
      `
      context.fill(new Path2D(svgLine));
  }
}

function DetermineBeamDirection(measure: Measure,
                                divGroup: DivGroup,
                                stemDir: StemDirection): BeamDirection {

  const divisions = divGroup.Divisions.sort((a: Division, b: Division) => {
    return a.Beat - b.Beat;
  });

  if (stemDir === StemDirection.Up) {
    const firstDivTopLine = divGroup.Notes[0].sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    })[0].Line;
    const lastDivTopLine = divGroup.Notes[divGroup.Notes.length-1].sort((a: Note, b:Note) => {
      return a.Line - b.Line;
    })[0].Line;

    // Flat beam direction
    if (firstDivTopLine === lastDivTopLine) { return BeamDirection.Flat}
    // get direction
    let assumedDir = firstDivTopLine < lastDivTopLine ? "down" : "up";
    let gotDir = false;
    divisions.forEach((d: Division, i: number) => {
      if (i === 0 || gotDir) { return; } // skip first division
      const divTopLine = divGroup.Notes[i].sort((a: Note, b: Note) => {
        return a.Line - b.Line;
      })[0].Line;

      if (divTopLine < firstDivTopLine) {
        if (assumedDir === "down") {
          assumedDir = "flat";
          gotDir = true;
        }
      } else {
        if (assumedDir === "up") {
          assumedDir = "flat";
          gotDir = true;
        }
      }
    });
    switch (assumedDir) {
      case "up":
        return BeamDirection.UpMax;
      case "down":
        return BeamDirection.DownMax;
      default:
        return BeamDirection.Flat;
    }
  } else {}
  return BeamDirection.Flat;
}

function GenerateBeams(measure: Measure, divGroup: DivGroup, stemDir: StemDirection): Beam {
  // lines go top - bot in terms of value (0... 30 etc.)
  let startTopLine: number, endTopLine = Number.MIN_SAFE_INTEGER;
  let startBotLine: number, endBotLine = Number.MAX_SAFE_INTEGER;
  const divisions = divGroup.Divisions.sort((a: Division, b: Division) => {
    return a.Beat - b.Beat;
  });
  // assuming that divGroup.notes array is sorted by beat
  startTopLine = divGroup.Notes[0].sort((a: Note, b:Note) => {
    return a.Line - b.Line;
  })[0].Line;
  startBotLine = divGroup.Notes[0].sort((a: Note, b:Note) => {
    return a.Line - b.Line;
  })[divGroup.Notes[0].length - 1].Line;

  endTopLine = divGroup.Notes[divGroup.Notes.length-1].sort((a: Note, b:Note) => {
    return a.Line - b.Line;
  })[0].Line;
  endBotLine = divGroup.Notes[divGroup.Notes.length-1].sort((a: Note, b:Note) => {
    return a.Line - b.Line;
  })[divGroup.Notes[divGroup.Notes.length-1].length - 1].Line;

  // we'll figure this shit out
//  if (stemDir === StemDirection.Up) {}
  //  19 = various buffers (x / note)
  const beamStartX = divisions[0].Bounds.x + 19;
  const beamStartY = Measure.GetNotePositionOnLine(measure, startTopLine) - 35;

  const beamEndX = divisions[divisions.length-1].Bounds.x + 19;
  const beamEndY = Measure.GetNotePositionOnLine(measure, endTopLine) - 35;

  const beam = new Beam(new Bounds(
    beamStartX, beamStartY, (beamEndX - beamStartX), 5),
    {x: beamStartX, y: beamStartY },
    {x: beamEndX, y: beamEndY });
  return beam;
}

export { Beam, GenerateBeams, DetermineBeamDirection } 
