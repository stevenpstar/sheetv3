import { BeamDirection, StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { NoteValues } from "./Values.js";
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
    const staff = divisions[0].StaffGroup;
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
function GetBeamString(beam, cam, stemDir, no) {
    const baseThickness = stemDir === StemDirection.Up ? -6 : 6;
    const yBuffer = stemDir === StemDirection.Up ? 8 : -8;
    const lineBuffer = yBuffer * no;
    const svgLine = `M ${beam.StartPoint.x + cam.x + 1} ${beam.StartPoint.y + cam.y - baseThickness + lineBuffer}
        L${beam.EndPoint.x + cam.x + 1} ${beam.EndPoint.y + cam.y - baseThickness + lineBuffer}
        V${beam.EndPoint.y + cam.y + lineBuffer} 
        L${beam.StartPoint.x + cam.x + 1} ${beam.StartPoint.y + cam.y + lineBuffer} z `;
    return svgLine;
}
class Beam {
    constructor(bounds, start, end, count = 1) {
        this.Bounds = bounds;
        this.StartPoint = start;
        this.EndPoint = end;
        this.Count = count;
    }
    Render(context, cam, count, stemDir, theme) {
        context.fillStyle = theme.NoteElements;
        const svgLine = GetBeamString(this, cam, stemDir, 0);
        context.fill(new Path2D(svgLine));
        for (let i = 1; i < this.Count; i++) {
            context.fill(new Path2D(GetBeamString(this, cam, stemDir, i)));
        }
    }
    static BeamCount(duration, tuplet = false) {
        let count = 0;
        if (duration >= 0.25) {
            return count;
        }
        if (duration >= NoteValues.n32 && duration < NoteValues.n16) {
            count = 3;
        }
        else if (duration >= NoteValues.n16 && duration < NoteValues.n8) {
            count = 2;
        }
        else {
            count = 1;
        }
        // TODO: This is a band-aid fix, may not work for all durations/counts
        if (tuplet) {
            count -= 1;
        }
        return count;
    }
}
export { Beam, GenerateBeams, DetermineBeamDirection };
