import { Beam } from "../Core/Beam.js";
import { DetermineStemDirection, } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
function CreateBeams(divGroup, stems, measure) {
    let beams = [];
    stems.sort((a, b) => a.Bounds.x - b.Bounds.x);
    // Primary Beam (top/main)
    const beamOne = new Beam(new Bounds(stems[0].Bounds.x, stems[0].Bounds.y + stems[0].Bounds.height, 5, 5), { x: stems[0].Bounds.x, y: stems[0].Bounds.y + stems[0].Bounds.height }, {
        x: stems[stems.length - 1].Bounds.x,
        y: stems[stems.length - 1].Bounds.y +
            stems[stems.length - 1].Bounds.height,
    });
    beams.push(beamOne);
    //for divGroup.Divisions
    return beams;
}
function CreateBeamsRevise(divGroup, stems, tuplet) {
    const beams = [];
    let newBeam = true;
    let tempBeam = null;
    const stemDir = DetermineStemDirection(divGroup.Notes, divGroup.Divisions);
    divGroup.Divisions.forEach((div, i) => {
        if (i > stems.length || stems.length == 0) {
            return;
        }
        const startingStem = i == 0 ? stems[i] : stems[i - 1];
        const stem = stems[i];
        if (!newBeam) {
            if (Beam.BeamCount(div.Duration, tuplet) !== beams[beams.length - 1].Count) {
                newBeam = true;
            }
        }
        if (newBeam) {
            const count = Beam.BeamCount(div.Duration, tuplet);
            tempBeam = new Beam(new Bounds(0, 0, 0, 0), {
                x: startingStem.Bounds.x,
                y: startingStem.Bounds.y + startingStem.Bounds.height,
            }, { x: stem.Bounds.x, y: stem.Bounds.y + stem.Bounds.height }, count);
            beams.push(tempBeam);
            newBeam = false;
        }
        else {
            tempBeam.EndPoint = {
                x: stem.Bounds.x,
                y: stem.Bounds.y + stem.Bounds.height,
            };
        }
        // Beam angle is up or straight
        if (tempBeam.StartPoint.y > tempBeam.EndPoint.y) {
            tempBeam.Bounds.x = tempBeam.StartPoint.x;
            tempBeam.Bounds.y = tempBeam.EndPoint.y;
            tempBeam.Bounds.width = tempBeam.EndPoint.x - tempBeam.StartPoint.x;
            tempBeam.Bounds.height = tempBeam.StartPoint.y - tempBeam.EndPoint.y + 6;
        }
        else {
            tempBeam.Bounds.x = tempBeam.StartPoint.x;
            tempBeam.Bounds.y = tempBeam.StartPoint.y - 6;
            tempBeam.Bounds.width = tempBeam.EndPoint.x - tempBeam.StartPoint.x;
            tempBeam.Bounds.height = tempBeam.EndPoint.y - tempBeam.StartPoint.y + 6;
        }
        console.log("temp beam: ", tempBeam);
    });
    return beams;
}
export { CreateBeams, CreateBeamsRevise };
