import { BeamDirection, DetermineStemDirection, StemDirection, } from "./Note.Renderer.js";
import { Stem } from "../Core/Stem.js";
import { Bounds } from "../Types/Bounds.js";
import { DetermineBeamDirection } from "../Core/Beam.js";
import { GetStaffActualMidLine, GetStaffHeightUntil, GetStaffMiddleLine, } from "../Core/Staff.js";
import { IsFlippedNote } from "./Measure.Renderer.js";
function AlterHeightForBeam(stemDir, beamDir, height, alterAmount) {
    if ((stemDir === StemDirection.Up && beamDir === BeamDirection.UpMax) ||
        (stemDir === StemDirection.Down && beamDir === BeamDirection.DownMax)) {
        height -= alterAmount;
    }
    else if ((stemDir === StemDirection.Down && beamDir === BeamDirection.UpMax) ||
        (stemDir === StemDirection.Up && beamDir === BeamDirection.DownMax)) {
        height += alterAmount;
    }
    return height;
}
function StemToCenter(stemDir, lowestLine, highestLine, midLine) {
    const lineDist = 7;
    if (stemDir === StemDirection.Up) {
        return highestLine > 15 + lineDist;
    }
    else {
        return lowestLine < 15 - lineDist;
    }
}
// Create Stem Objects (Separate from render, allow to be selectable)
function CreateStems(notes, divisions, staff, measure, camera) {
    const stems = [];
    let dynNoteXBuffer = 9;
    const stemDir = DetermineStemDirection(notes, divisions, staff, measure);
    let highestLine = Number.MAX_SAFE_INTEGER;
    let lowestLine = Number.MIN_SAFE_INTEGER;
    let hNote;
    let lNote;
    notes.forEach((na) => {
        na.forEach((n) => {
            if (n.Line < highestLine) {
                highestLine = n.Line;
                hNote = n;
            }
            if (n.Line > lowestLine) {
                lowestLine = n.Line;
                lNote = n;
            }
        });
    });
    const staffMidLinePos = GetStaffHeightUntil(measure.Staves, staff) +
        GetStaffMiddleLine(measure.Staves, staff) * 5;
    const xBuffer = stemDir === StemDirection.Up ? 11.5 : 0.25;
    const beamDir = DetermineBeamDirection(measure, { Divisions: divisions, Notes: notes }, stemDir);
    const shouldBeam = divisions.length > 1 && divisions[0].Duration <= 0.25;
    divisions.forEach((div, i) => {
        const beamAlt = i * (10 / divisions.length - 1);
        const divNotes = notes[i];
        const numOfAcc = divNotes.filter((n) => n.Accidental !== 0).length;
        if (numOfAcc > 0) {
            dynNoteXBuffer += dynNoteXBuffer * numOfAcc - 1;
        }
        divNotes.sort((a, b) => a.Line - b.Line);
        // TODO: Was alternating between 11 and 12 causing mismatch, may need to be
        // adjusted later not sure.
        let stemX = stemDir === StemDirection.Up
            ? divNotes[0].Bounds.x + 10.25
            : divNotes[0].Bounds.x; //Math.floor( div.Bounds.x + xBuffer + dynNoteXBuffer);
        if (IsFlippedNote(divNotes, 0, stemDir)) {
            stemX = divNotes[0].Bounds.x;
        }
        // stem Y set to 0 for now, is updated later.
        const stem = new Stem(new Bounds(stemX, 0, 1.5, 0));
        if (stemDir === StemDirection.Up) {
            stem.Bounds.y = divNotes[divNotes.length - 1].Bounds.y + 2.0;
            stem.Bounds.height =
                hNote.Bounds.y - divNotes[divNotes.length - 1].Bounds.y - 35;
        }
        else {
            stem.Bounds.y = divNotes[0].Bounds.y + 2.5;
            stem.Bounds.height = lNote.Bounds.y - divNotes[0].Bounds.y + 35;
        }
        const diff = measure.Staves[staff].TopLine < 0
            ? Math.abs(measure.Staves[staff].TopLine)
            : measure.Staves[staff].TopLine;
        const staffRelativeMid = GetStaffActualMidLine(measure.Staves, staff) + diff;
        if (StemToCenter(stemDir, lowestLine, highestLine, staffRelativeMid)) {
            stem.Bounds.height = staffMidLinePos - stem.Bounds.y + measure.Bounds.y;
        }
        if (shouldBeam) {
            stem.Bounds.height = AlterHeightForBeam(stemDir, beamDir, stem.Bounds.height, beamAlt);
        }
        stems.push(stem);
    });
    return stems;
}
// v3 of this bloody function
function RenderStem(renderProps, notes, divisions, staff, msr, beamDir, theme) {
    const { canvas, context, camera } = renderProps;
    let dynNoteXBuffer = 9;
    const stemDir = DetermineStemDirection(notes, divisions, staff, msr);
    const xBuffer = stemDir === StemDirection.Up ? 11.5 : 0.25;
    divisions.forEach((div, i) => {
        const divNotes = notes[i];
        divNotes.sort((a, b) => a.Line - b.Line);
        let lowestNote = divNotes[divNotes.length - 1];
        let highestNote = divNotes[0];
        const stemX = Math.floor(div.Bounds.x + xBuffer + camera.x + dynNoteXBuffer);
    });
}
export { CreateStems };
