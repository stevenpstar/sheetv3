import { GetDivisionGroups, IsRestOnBeat } from "../Core/Division.js";
import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderFourTop } from "./Elements/TimeSignature.js";
import { RenderTrebleClef } from "./Elements/TrebleClef.js";
import { DetermineStemDirection, RenderNote, RenderRest, RenderStemRevise, RenderTies, StemDirection, renderLedgerLines } from "./Note.Renderer.js";
const line_space = 10;
const line_width = 1;
const endsWidth = 2;
const debug = true;
const noteXBuffer = 9;
function RenderMeasure(measure, renderProps, hovId, mousePos, lastMeasure, noteInput, index, restInput) {
    if (hovId === measure.ID)
        RenderHovered(measure, renderProps, hovId, mousePos, noteInput, restInput);
    if (debug)
        RenderDebug(measure, renderProps, index);
    RenderMeasureBase(measure, renderProps, mousePos, lastMeasure);
    RenderNotes(measure, renderProps);
}
function RenderDebug(measure, renderProps, index) {
    const { canvas, context, camera } = renderProps;
    if (measure.Divisions.length === 0) {
        console.error("measure has no divisions");
        return;
    }
    const fDiv = measure.Divisions[0];
    measure.Divisions.forEach((div, i) => {
        const x = div.Bounds.x + camera.x + 2;
        const y = div.Bounds.y + div.Bounds.height + camera.y;
        context.fillStyle = debugGetDurationName(div.Duration).colour;
        context.fillRect(x, y + 10, div.Bounds.width - 4, 5);
        context.fillStyle = "black";
        context.font = "8px serif";
        context.fillText(debugGetDurationName(div.Duration).name, x, y + 25);
        context.fillStyle = "black";
        context.fillText(div.Beat.toString(), x, y + 40);
    });
    if (index === 0) {
        context.fillStyle = "black";
        context.fillText("Dur:", fDiv.Bounds.x + camera.x - 30, fDiv.Bounds.y + camera.y + fDiv.Bounds.height + 25);
        context.fillText("Beat:", fDiv.Bounds.x + camera.x - 30, fDiv.Bounds.y + camera.y + fDiv.Bounds.height + 40);
    }
    // note details
    const selectedNotes = measure
        .Notes
        .filter(n => n.Selected);
    if (selectedNotes.length > 0) {
        const selNote = selectedNotes[0];
        context.fillStyle = "black";
        context.font = "8px serif";
        context.fillText(selNote.Beat.toString(), 10, 10);
        context.fillText(selNote.Duration.toString(), 10, 20);
        context.fillText(selNote.Line.toString(), 10, 30);
        context.fillText(selNote.Tied.toString(), 10, 40);
        if (selNote.Tied) {
            context.fillText(selNote.TiedStart.toString(), 40, 40);
            context.fillText(selNote.TiedEnd.toString(), 60, 40);
        }
    }
}
function debugGetDurationName(duration, alpha = 255) {
    let name = "";
    let g = 150;
    let r = 0;
    let b = 0;
    let a = alpha;
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
            name = "unknown";
            g = 0;
            r = 255;
    }
    const colour = `rgba(${r}, ${g}, ${b}, ${a})`;
    return { name: name, colour: colour };
}
function RenderHovered(measure, renderProps, hovId, mousePos, noteInput, restInput) {
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
            if (noteInput && !restInput) {
                //   context.fillStyle = debugGetDurationName(s.Duration, 0.2).colour; 
                //   context.fillRect(s.Bounds.x + camera.x, s.Bounds.y + camera.y, s.Bounds.width, s.Bounds.height);
                const noteY = measure.Bounds.y + (line.num * (line_space / 2)); // + (line_space / 2));
                // temp note
                const tempNoteProps = {
                    Beat: s.Beat,
                    Duration: 0.25,
                    Line: line.num,
                    Rest: false,
                    Tied: false
                };
                const tempNote = new Note(tempNoteProps);
                RenderNote(tempNote, renderProps, new Bounds(s.Bounds.x + noteXBuffer, noteY, 0, 0), true, false, StemDirection.Up);
            }
        }
    });
}
// Renders the basic lines and bar endings of the measure, no notes or clefs or time
// time signatures
function RenderMeasureBase(msr, renderProps, mousePos, lastMeasure) {
    const { canvas, context, camera } = renderProps;
    context.fillStyle = "black";
    const lastEndThickness = lastMeasure ?
        endsWidth * 2 : endsWidth;
    const measureBegin = `M${msr.Bounds.x + camera.x} ${msr.Bounds.y + (msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${endsWidth} v ${line_space * 4} h -${endsWidth} Z`;
    const measureEnd = `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x} ${msr.Bounds.y + (msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${lastEndThickness} v ${line_space * 4 + 1} h -${lastEndThickness} Z`;
    const measureDoubleEnd = `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x - 4} ${msr.Bounds.y + (msr.Bounds.height / 2) - (line_space * 2) + camera.y} h ${endsWidth} v ${line_space * 4 + 1} h -${endsWidth} Z`;
    for (let l = 0; l < 5; l++) {
        const lineString = `M${msr.Bounds.x + camera.x} ${msr.Bounds.y + (msr.Bounds.height / 2) - (line_space * 2) + line_space * l + camera.y} h ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;
        const linePath = new Path2D(lineString);
        context.fill(linePath);
    }
    context.fill(new Path2D(measureBegin));
    context.fill(new Path2D(measureEnd));
    if (lastMeasure) {
        context.fill(new Path2D(measureDoubleEnd));
    }
    if (msr.RenderClef) {
        RenderMeasureClef(canvas, context, msr, "treble", camera);
    }
    if (msr.RenderTimeSig) {
        const xOff = msr.RenderClef ? 32 : 4;
        RenderTimeSig(renderProps, msr, "4", "4", xOff);
    }
}
function RenderMeasureClef(c, ctx, msr, clef, cam) {
    const clefVert = (msr.Bounds.height / 2) + (line_space * 2);
    const clefPath = RenderTrebleClef(msr.Bounds.x + 16 + cam.x, msr.Bounds.y + cam.y + (msr.Bounds.height / 2 + (line_space * 2)));
    ctx.fill(new Path2D(clefPath));
}
function RenderTimeSig(renderProps, msr, top, bottom, xOffset) {
    const topString = RenderFourTop(msr.Bounds.x + xOffset + renderProps.camera.x, msr.Bounds.y + renderProps.camera.y + (15 * 5) - 5);
    const botString = RenderFourTop(msr.Bounds.x + xOffset + renderProps.camera.x, msr.Bounds.y + renderProps.camera.y + (19 * 5) - 4);
    renderProps.context.fill(new Path2D(topString));
    renderProps.context.fill(new Path2D(botString));
}
function RenderNotes(msr, renderProps) {
    const { canvas, context, camera } = renderProps;
    msr.Divisions.forEach((div, i) => {
        const divNotes = msr.Notes.filter((note) => note.Beat === div.Beat);
        divNotes.sort((a, b) => {
            return a.Line - b.Line;
        });
        if (IsRestOnBeat(div.Beat, divNotes)) {
            RenderRest(context, div, camera, divNotes[0]);
            return;
        }
        renderLedgerLines(msr.Notes, div, renderProps);
    });
    const dGroups = GetDivisionGroups(msr);
    dGroups.DivGroups.forEach((group, i) => {
        if (group.Divisions.length > 0) {
            const stemDir = DetermineStemDirection(group.Notes, group.Divisions);
            RenderStemRevise(renderProps, group.Notes, group.Divisions);
            group.Divisions.forEach(div => {
                const dN = msr.Notes.filter((note) => note.Beat === div.Beat);
                dN.sort((a, b) => {
                    return a.Line - b.Line;
                });
                dN.forEach((n, i) => {
                    const yPos = msr.Bounds.y + n.Line * 5;
                    const isFlipped = IsFlippedNote(dN, i, stemDir);
                    let flipNoteOffset = isFlipped ?
                        stemDir === StemDirection.Up ? 11 : -11 : 0;
                    if (n.Rest) {
                        RenderRest(context, div, camera, n);
                    }
                    else {
                        RenderNote(n, renderProps, new Bounds(div.Bounds.x + noteXBuffer + flipNoteOffset, yPos, 10, 10), n.Selected, isFlipped, stemDir);
                    }
                });
            });
        }
    });
    RenderTies(renderProps, msr.Divisions, msr.Notes);
}
function IsFlippedNote(notes, index, dir) {
    let flipped = false;
    let countAbove = 0;
    let countBelow = 0;
    const nLine = notes[index].Line;
    if (notes.length <= 1) {
        return flipped;
    }
    for (let b = index + 1; b <= notes.length - 1; b++) {
        const line = notes[b].Line;
        if (line - nLine === b - index) {
            countBelow++;
        }
        else {
            break;
        }
    }
    for (let a = index - 1; a >= 0; a--) {
        const line = notes[a].Line;
        if (nLine - line === index - a) {
            countAbove++;
        }
        else {
            break;
        }
    }
    const totalCount = countAbove + countBelow + 1;
    const notePos = countAbove + 1;
    if (totalCount % 2 === 0) {
        flipped = dir === StemDirection.Up ?
            notePos % 2 !== 0 : notePos % 2 === 0;
    }
    else {
        flipped = notePos % 2 === 0;
    }
    return flipped;
}
function GetNoteGroups(msr) {
    let startBeat = -1;
    let endBeat = -1;
    const noteGroups = [];
    return noteGroups;
}
export { RenderMeasure, IsFlippedNote };
