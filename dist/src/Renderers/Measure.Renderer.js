import { GetDivisionGroups, IsRestOnBeat } from "../Core/Division.js";
import { StaffType } from "../Core/Instrument.js";
import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderFourTop } from "./Elements/TimeSignature.js";
import { RenderTrebleClef } from "./Elements/TrebleClef.js";
import { RenderKeySignature } from "./KeySignature.Renderer.js";
import { DetermineStemDirection, RenderDots, RenderNote, RenderRest, RenderStemRevise, RenderTies, StemDirection, renderLedgerLines } from "./Note.Renderer.js";
const line_space = 10;
const line_width = 1;
const endsWidth = 2;
const debug = false;
const noteXBuffer = 9;
function RenderMeasure(measure, renderProps, hovId, mousePos, lastMeasure, noteInput, index, restInput) {
    //    if (hovId === measure.ID)
    RenderHovered(measure, renderProps, hovId, mousePos, noteInput, restInput);
    if (debug)
        RenderDebug(measure, renderProps, index, mousePos);
    RenderMeasureBase(measure, renderProps, mousePos, lastMeasure);
    RenderNotes(measure, renderProps, 0);
    if (measure.Instrument.Staff === StaffType.Grand) {
        RenderNotes(measure, renderProps, 1);
    }
}
function RenderDebug(measure, renderProps, index, mousePos) {
    const { canvas, context, camera } = renderProps;
    if (measure.Divisions.length === 0) {
        console.error("measure has no divisions");
        return;
    }
    const fDiv = measure.Divisions[0];
    const renderDurations = false;
    const mousePositionString = `x: ${mousePos.x}, y: ${mousePos.y}`;
    context.fillStyle = "black";
    context.font = "12px serif";
    context.fillText(mousePositionString, 10, 100);
    measure.Divisions.forEach((div, i) => {
        if (renderDurations) {
            const x = div.Bounds.x + camera.x + 2;
            const y = div.Bounds.y + div.Bounds.height + camera.y;
            context.fillStyle = debugGetDurationName(div.Duration).colour;
            context.fillRect(x, y + 10, div.Bounds.width - 4, 5);
            context.fillStyle = "black";
            context.font = "8px serif";
            context.fillText(debugGetDurationName(div.Duration).name, x, y + 25);
            context.fillStyle = "black";
            context.fillText(div.Beat.toString(), x, y + 40);
        }
    });
    if (index === 0) {
        if (renderDurations) {
            context.fillStyle = "black";
            context.fillText("Dur:", fDiv.Bounds.x + camera.x - 30, fDiv.Bounds.y + camera.y + fDiv.Bounds.height + 25);
            context.fillText("Beat:", fDiv.Bounds.x + camera.x - 30, fDiv.Bounds.y + camera.y + fDiv.Bounds.height + 40);
        }
    }
    const renderNoteBounds = false;
    if (renderNoteBounds) {
        measure.Notes.forEach(n => {
            context.fillStyle = "rgba(0 ,0, 255, 0.8)";
            context.fillRect(n.Bounds.x + camera.x, n.Bounds.y + camera.y, n.Bounds.width, n.Bounds.height);
        });
    }
    // note details
    const selectedNotes = measure
        .Notes
        .filter(n => n.Selected);
    if (selectedNotes.length > 0) {
        const selNote = selectedNotes[0];
        context.fillStyle = "black";
        context.font = "8px serif";
        context.fillText('Beat: ' + selNote.Beat.toString(), 10, 10);
        context.fillText('Duration: ' + selNote.Duration.toString(), 10, 20);
        context.fillText('Line: ' + selNote.Line.toString(), 10, 30);
        context.fillText('Tied: ' + selNote.Tied.toString(), 10, 40);
        if (selNote.Tied) {
            context.fillText(selNote.TiedStart.toString(), 40, 40);
            context.fillText(selNote.TiedEnd.toString(), 60, 40);
        }
    }
    // line details
    // const lineY = measure.Bounds.y + (line.num * (line_space / 2) - (line_space / 4));
    // context.fillRect(line.bounds.x + camera.x, lineY + camera.y, line.bounds.width, line.bounds.height);
    // TODO: Line numbers for grand staff are wrong in debug
    // OR they are wrong in staff 0 if we don't add the top line number
    const line = Measure.GetLineHovered(mousePos.y, measure, camera);
    //    context.fillRect(line.bounds.x + camera.x,
    //                     line.bounds.y + camera.y,
    //                     line.bounds.width,
    //                     line.bounds.height);
    context.fillStyle = "black";
    context.font = "8px serif";
    let lineNum = line.num + measure.SALineTop;
    context.fillText("Line Hovered: " + lineNum.toString(), 130, 10);
    context.fillStyle = "rgba(0, 0, 50, 0.2)";
    const div1 = measure.Divisions.filter(d => d.Staff === 0)[0];
    const div2 = measure.Divisions.filter(d => d.Staff === 1)[0];
    context.fillRect(div1.Bounds.x + camera.x, div1.Bounds.y + camera.y, div1.Bounds.width, div1.Bounds.height);
    context.fillStyle = "rgba(0, 50, 0, 0.2)";
    context.fillRect(div2.Bounds.x + camera.x, div2.Bounds.y + camera.y, div2.Bounds.width, div2.Bounds.height);
    context.strokeStyle = "black";
    context.strokeRect(measure.Bounds.x + measure.XOffset + camera.x, measure.Bounds.y + camera.y, measure.Bounds.width, measure.Bounds.height);
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
        // context.fillStyle = "rgb(0, 0, 255, 0.1)"; 
        // const lineY = measure.Bounds.y + (line.num * (line_space / 2) - (line_space / 4));
        // context.fillRect(line.bounds.x + camera.x, lineY + camera.y, line.bounds.width, line.bounds.height);
    }
    // now we are going to test "Sections" as they were in v2
    const divisions = measure.Divisions.concat(measure.BDivisions);
    divisions.forEach(s => {
        if (s.Bounds.IsHovered(mousePos.x, mousePos.y, camera)) {
            if (noteInput && !restInput) {
                context.fillStyle = debugGetDurationName(s.Duration, 0.2).colour;
                context.fillRect(s.Bounds.x + camera.x, s.Bounds.y + camera.y, s.Bounds.width, s.Bounds.height);
                const noteY = measure.Bounds.y + (line.num * (line_space / 2)); // + (line_space / 2));
                // temp note
                const tempNoteProps = {
                    Beat: s.Beat,
                    Duration: 0.25,
                    Line: line.num,
                    Rest: false,
                    Tied: false,
                    Staff: s.Staff
                };
                const tempNote = new Note(tempNoteProps);
                RenderNote(tempNote, renderProps, new Bounds(s.Bounds.x + noteXBuffer, line.bounds.y, 0, 0), true, false, StemDirection.Up);
            }
        }
    });
}
// Renders the basic lines and bar endings of the measure, no notes or clefs or time
// time signatures
function RenderMeasureBase(msr, renderProps, mousePos, lastMeasure) {
    const { canvas, context, camera } = renderProps;
    const msrMidLine = 15 - msr.SALineTop;
    const grndMsrMidLine = msr.GetGrandMeasureMidLine();
    context.fillStyle = "black";
    const lastEndThickness = lastMeasure ?
        endsWidth * 2 : endsWidth;
    const grandMsrHeight = msr.GetGrandMeasureHeight();
    const msrLineHeight = msr.Instrument.Staff === StaffType.Grand ?
        grandMsrHeight : msr.GetMeasureHeight();
    // TODO: Please clean this method up omg
    const lineTopStaff = msr.Bounds.y + (5 * msrMidLine - (line_space * 2));
    const lineBotStaff = msr.Bounds.y + msr.GetMeasureHeight() + (5 * grndMsrMidLine + (line_space * 2));
    const grandLineHeight = lineBotStaff - lineTopStaff;
    const measureBegin = `M${msr.Bounds.x + camera.x} 
          ${msr.Bounds.y + (5 * msrMidLine) - (line_space * 2) + camera.y} h 
          ${endsWidth} v ${grandLineHeight} h -${endsWidth} Z`;
    const measureEnd = `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x} 
        ${msr.Bounds.y + (5 * msrMidLine) - (line_space * 2) + camera.y} h 
        ${lastEndThickness} v ${grandLineHeight} h -${lastEndThickness} Z`;
    const measureDoubleEnd = `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x - 4} 
          ${msr.Bounds.y + (5 * msrMidLine) - (line_space * 2) + camera.y} h 
          ${endsWidth} v ${grandLineHeight} h -${endsWidth} Z`;
    for (let l = 0; l < 5; l++) {
        const lineString = `M${msr.Bounds.x + camera.x} ${msr.Bounds.y + (5 * msrMidLine) - (line_space * 2) + line_space * l + camera.y} h ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;
        const linePath = new Path2D(lineString);
        context.fill(linePath);
    }
    if (msr.Instrument.Staff === StaffType.Grand) {
        for (let l = 0; l < 5; l++) {
            const lineString = `M${msr.Bounds.x + camera.x} 
            ${msr.Bounds.y + msr.GetMeasureHeight() + (5 * msr.GetGrandMeasureMidLine()) - (line_space * 2) + line_space * l + camera.y} 
            h ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;
            const linePath = new Path2D(lineString);
            context.fill(linePath);
        }
    }
    context.fill(new Path2D(measureBegin));
    context.fill(new Path2D(measureEnd));
    if (lastMeasure) {
        context.fill(new Path2D(measureDoubleEnd));
    }
    if (msr.RenderClef) {
        RenderMeasureClef(renderProps, msr);
    }
    if (msr.RenderKey) {
        const key = "CMaj/Amin";
        if (key !== "CMaj/Amin") {
            const xOff = msr.RenderClef ? 24 : 4;
            RenderKeySignature(renderProps, msr, "CMaj/Amin", "treble", xOff);
        }
        else {
            msr.RenderKey = false;
            // This is a temporary fix for dev
        }
    }
    if (msr.RenderTimeSig) {
        const xOff = msr.RenderClef ? msr.RenderKey ? 48 : 36 : 4;
        RenderTimeSig(renderProps, msr, "4", "4", xOff);
    }
}
// TODO: Move this
const bassClef = 'm0 0c0-1.276 1.012-2.288 2.288-2.288s2.288 1.012 2.288 2.288-1.012 2.288-2.288 2.288-2.288-1.012-2.288-2.288zm0-11c0-1.276 1.012-2.288 2.288-2.288s2.288 1.012 2.288 2.288-1.012 2.288-2.288 2.288-2.288-1.012-2.288-2.288zm-14.212-5.984c7.524 0 12.848 3.784 12.848 10.912 0 11.572-11.616 18.26-22.748 22.924-.088.088-.22.132-.352.132-.264 0-.484-.22-.484-.484 0-.132.044-.264.132-.352 8.932-5.192 18.26-11.66 18.26-21.736 0-5.324-2.816-10.428-7.656-10.428-3.476 0-6.072 2.508-7.216 5.852.616-.352 1.232-.572 1.892-.572 2.42 0 4.4 1.98 4.4 4.4 0 2.552-1.936 4.708-4.4 4.708-2.64 0-4.928-2.112-4.928-4.708 0-5.808 4.532-10.648 10.252-10.648z';
const bassClefSmall = 'm0 0c0-1.0208.8096-1.8304 1.8304-1.8304s1.8304.8096 1.8304 1.8304-.8096 1.8304-1.8304 1.8304-1.8304-.8096-1.8304-1.8304zm0-8.8c0-1.0208.8096-1.8304 1.8304-1.8304s1.8304.8096 1.8304 1.8304-.8096 1.8304-1.8304 1.8304-1.8304-.8096-1.8304-1.8304zm-11.3696-4.7872c6.0192 0 10.2784 3.0272 10.2784 8.7296 0 9.2576-9.2928 14.608-18.1984 18.3392-.0704.0704-.176.1056-.2816.1056-.2112 0-.3872-.176-.3872-.3872 0-.1056.0352-.2112.1056-.2816 7.1456-4.1536 14.608-9.328 14.608-17.3888 0-4.2592-2.2528-8.3424-6.1248-8.3424-2.7808 0-4.8576 2.0064-5.7728 4.6816.4928-.2816.9856-.4576 1.5136-.4576 1.936 0 3.52 1.584 3.52 3.52 0 2.0416-1.5488 3.7664-3.52 3.7664-2.112 0-3.9424-1.6896-3.9424-3.7664 0-4.6464 3.6256-8.5184 8.2016-8.5184z';
function RenderMeasureClef(renderProps, msr) {
    const { canvas, context, camera } = renderProps;
    const msrMidLine = Measure.GetMeasureMidLine(msr);
    const gMsrMidLine = msr.GetGrandMeasureMidLine();
    msr.Clefs.forEach((clef) => {
        if (clef.Beat === 1) {
            if (clef.Type === "treble") {
                const clefPath = RenderTrebleClef(msr.Bounds.x + 16 + camera.x, msr.Bounds.y + camera.y + (5 * msrMidLine + (line_space * 2)));
                context.fill(new Path2D(clefPath));
            }
            else if (clef.Type === "bass") {
                const clefPath = `m ${msr.Bounds.x + 30 + camera.x} 
            ${msr.Bounds.y + camera.y + (msrMidLine * 5) - 2}` + bassClef;
                context.fill(new Path2D(clefPath));
            }
        }
        else {
            const div = msr.Divisions.find(d => d.Beat === clef.Beat);
            if (clef.Type === "treble") {
                const clefPath = RenderTrebleClef(div.Bounds.x + camera.x, msr.Bounds.y + camera.y + (5 * msrMidLine + (line_space * 2)));
                context.fill(new Path2D(clefPath));
            }
            else if (clef.Type === "bass") {
                const clefPath = `m ${div.Bounds.x + camera.x} 
            ${msr.Bounds.y + camera.y + (msrMidLine * 5) - 5}` + bassClefSmall;
                context.fill(new Path2D(clefPath));
            }
        }
    });
    msr.GrandClefs.forEach((clef) => {
        if (clef.Beat === 1) {
            if (clef.Type === "treble") {
                const clefPath = RenderTrebleClef(msr.Bounds.x + 16 + camera.x, msr.Bounds.y + camera.y + (5 * 45 + (line_space * 2)));
                context.fill(new Path2D(clefPath));
            }
            else if (clef.Type === "bass") {
                const clefPath = `m ${msr.Bounds.x + 30 + camera.x} 
            ${msr.Bounds.y + msr.GetMeasureHeight() + camera.y + (msr.GetGrandMeasureMidLine() * 5) - 2}` + bassClef;
                context.fill(new Path2D(clefPath));
            }
        }
        else {
            const div = msr.Divisions.find(d => d.Beat === clef.Beat);
            if (clef.Type === "treble") {
                const clefPath = RenderTrebleClef(div.Bounds.x + camera.x, msr.Bounds.y + camera.y + (5 * 45 + (line_space * 2)));
                context.fill(new Path2D(clefPath));
            }
            else if (clef.Type === "bass") {
                const clefPath = `m ${div.Bounds.x + camera.x} 
            ${msr.GetMeasureHeight() + camera.y + (msr.GetGrandMeasureMidLine() * 5) - 5}` + bassClefSmall;
                context.fill(new Path2D(clefPath));
            }
        }
    });
}
function RenderTimeSig(renderProps, msr, top, bottom, xOffset) {
    const msrMidLine = Measure.GetMeasureMidLine(msr);
    const gMsrY = msr.Bounds.y + msr.GetMeasureHeight() + renderProps.camera.y + (msr.GetGrandMeasureMidLine() * 5);
    const topString = RenderFourTop(msr.Bounds.x + xOffset + renderProps.camera.x, msr.Bounds.y + renderProps.camera.y + (msrMidLine * 5) - 5);
    const botString = RenderFourTop(msr.Bounds.x + xOffset + renderProps.camera.x, msr.Bounds.y + renderProps.camera.y + ((msrMidLine + 4) * 5) - 4);
    const topStringB = RenderFourTop(msr.Bounds.x + xOffset + renderProps.camera.x, gMsrY - 4);
    const botStringB = RenderFourTop(msr.Bounds.x + xOffset + renderProps.camera.x, gMsrY + (3 * 5) + 1);
    renderProps.context.fill(new Path2D(topString));
    renderProps.context.fill(new Path2D(botString));
    if (msr.Instrument.Staff === StaffType.Grand) {
        renderProps.context.fill(new Path2D(topStringB));
        renderProps.context.fill(new Path2D(botStringB));
    }
}
function RenderNotes(msr, renderProps, staff) {
    const { canvas, context, camera } = renderProps;
    const mDivs = msr.Divisions.filter(d => d.Staff === staff);
    mDivs.forEach((div, i) => {
        const divNotes = msr.Notes.filter((note) => note.Beat === div.Beat &&
            note.Staff === div.Staff);
        divNotes.sort((a, b) => {
            return a.Line - b.Line;
        });
        if (IsRestOnBeat(div.Beat, divNotes, div.Staff)) {
            RenderRest(context, div, camera, divNotes[0], msr);
            return;
        }
        renderLedgerLines(msr.Notes, div, renderProps, staff, msr);
    });
    const dGroups = GetDivisionGroups(msr, staff);
    dGroups.DivGroups.forEach((group, i) => {
        if (group.Divisions.length > 0) {
            const stemDir = DetermineStemDirection(group.Notes, group.Divisions);
            RenderStemRevise(renderProps, group.Notes, group.Divisions, staff, msr);
            group.Divisions.forEach(div => {
                let hasFlipped = false;
                const dN = msr.Notes.filter((note) => note.Beat === div.Beat &&
                    note.Staff === staff);
                dN.sort((a, b) => {
                    return a.Line - b.Line;
                });
                dN.forEach((n, i) => {
                    const yPos = msr.Bounds.y + (n.Line - msr.SALineTop) * 5;
                    const isFlipped = IsFlippedNote(dN, i, stemDir);
                    if (isFlipped) {
                        hasFlipped = true;
                    }
                    let flipNoteOffset = isFlipped ?
                        stemDir === StemDirection.Up ? 11 : -11 : 0;
                    if (n.Rest) {
                        RenderRest(context, div, camera, n, msr);
                    }
                    else {
                        RenderNote(n, renderProps, n.Bounds, n.Selected, isFlipped, stemDir);
                    }
                });
                // render dots
                dN.forEach((n) => {
                    let flipNoteOffset = hasFlipped ?
                        stemDir === StemDirection.Up ? 11 : 0 : 0;
                    RenderDots(renderProps, n, div.Bounds.x + noteXBuffer + flipNoteOffset);
                });
            });
        }
    });
    RenderTies(renderProps, msr.Divisions, msr.Notes, StaffType.Single, msr);
    if (msr.Instrument.Staff === StaffType.Grand) {
        RenderTies(renderProps, msr.Divisions, msr.Notes, StaffType.Grand, msr);
    }
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
