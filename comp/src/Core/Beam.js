import { BeamDirection, StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
function DetermineBeamDirection(measure, divGroup, stemDir) {
    const divisions = divGroup.Divisions.sort((a, b) => {
        return a.Beat - b.Beat;
    });
    if (stemDir === StemDirection.Up) {
        const firstDivTopLine = divGroup.Notes[0].sort((a, b) => {
            return a.Line - b.Line;
        })[0].Line;
        const lastDivTopLine = divGroup.Notes[divGroup.Notes.length - 1].sort((a, b) => {
            return a.Line - b.Line;
        })[0].Line;
        if (firstDivTopLine === lastDivTopLine) {
            return BeamDirection.Flat;
        }
        else if (firstDivTopLine < lastDivTopLine) {
            return BeamDirection.DownMax;
        }
        else if (firstDivTopLine > lastDivTopLine) {
            return BeamDirection.UpMax;
        }
    }
    else {
        const firstDivBotLine = divGroup.Notes[0].sort((a, b) => {
            return a.Line - b.Line;
        })[divGroup.Notes[0].length - 1].Line;
        const lastDivBotLine = divGroup.Notes[divGroup.Notes.length - 1].sort((a, b) => {
            return a.Line - b.Line;
        })[divGroup.Notes[divGroup.Notes.length - 1].length - 1].Line;
        // Flat beam direction
        if (firstDivBotLine === lastDivBotLine) {
            return BeamDirection.Flat;
        }
        else if (firstDivBotLine < lastDivBotLine) {
            return BeamDirection.UpMax;
        }
        else if (firstDivBotLine > lastDivBotLine) {
            return BeamDirection.DownMax;
        }
    }
    return BeamDirection.Flat;
}
function GenerateBeams(measure, divGroup, stemDir) {
    // lines go top - bot in terms of value (0... 30 etc.)
    let startTopLine, endTopLine = Number.MIN_SAFE_INTEGER;
    let startBotLine, endBotLine = Number.MAX_SAFE_INTEGER;
    const divisions = divGroup.Divisions.sort((a, b) => {
        return a.Beat - b.Beat;
    });
    const staff = divisions[0].Staff;
    // assuming that divGroup.notes array is sorted by beat
    startTopLine = divGroup.Notes[0].sort((a, b) => {
        return a.Line - b.Line;
    })[0].Line;
    startBotLine = divGroup.Notes[0].sort((a, b) => {
        return a.Line - b.Line;
    })[divGroup.Notes[0].length - 1].Line;
    endTopLine = divGroup.Notes[divGroup.Notes.length - 1].sort((a, b) => {
        return a.Line - b.Line;
    })[0].Line;
    endBotLine = divGroup.Notes[divGroup.Notes.length - 1].sort((a, b) => {
        return a.Line - b.Line;
    })[divGroup.Notes[divGroup.Notes.length - 1].length - 1].Line;
    // we'll figure this shit out
    //  if (stemDir === StemDirection.Up) {}
    //  19 = various buffers (x / note)
    const beamStartX = divisions[0].Bounds.x + 19;
    const beamStartY = measure.GetNotePositionOnLine(startTopLine, staff) - 35;
    const beamEndX = divisions[divisions.length - 1].Bounds.x + 19;
    const beamEndY = measure.GetNotePositionOnLine(endTopLine, staff) - 35;
    const beam = new Beam(new Bounds(beamStartX, beamStartY, beamEndX - beamStartX, 5), { x: beamStartX, y: beamStartY }, { x: beamEndX, y: beamEndY });
    return beam;
}
class Beam {
    constructor(bounds, start, end) {
        this.Bounds = bounds;
        this.StartPoint = start;
        this.EndPoint = end;
    }
    Render(context, cam, count, stemDir, theme) {
        context.fillStyle = theme.NoteElements;
        const baseThickness = stemDir === StemDirection.Up ? -6 : 6;
        const svgLine = `M ${this.StartPoint.x + cam.x + 1} ${this.StartPoint.y + cam.y - baseThickness}
        L${this.EndPoint.x + cam.x + 1} ${this.EndPoint.y + cam.y - baseThickness}
        V${this.EndPoint.y + cam.y} 
        L${this.StartPoint.x + cam.x + 1} ${this.StartPoint.y + cam.y} z `;
        context.fill(new Path2D(svgLine));
        let yBuffer = stemDir === StemDirection.Up ? 2.5 : -8;
        let flagBuffer = stemDir === StemDirection.Up ? 6 : 0;
        for (let i = 1; i < count; i++) {
            const thickness = 6;
            const line = `M ${this.StartPoint.x + cam.x} ${this.StartPoint.y + flagBuffer * i + yBuffer * i + cam.y}
          L${this.EndPoint.x + cam.x + 2} ${this.EndPoint.y + flagBuffer * i + yBuffer * i + cam.y}
          V${this.EndPoint.y + flagBuffer * i + yBuffer * i + cam.y + thickness} 
          L${this.StartPoint.x + cam.x} ${this.StartPoint.y + flagBuffer * i + yBuffer * i + thickness + cam.y} z`;
            context.fill(new Path2D(line));
        }
    }
}
export { Beam, GenerateBeams, DetermineBeamDirection };
