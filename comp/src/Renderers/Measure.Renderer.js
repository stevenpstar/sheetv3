import { Beam, DetermineBeamDirection } from "../Core/Beam.js";
import { GetDivisionGroups, IsRestOnBeat } from "../Core/Division.js";
import { Dynamic } from "../Core/Dynamic.js";
import { StaffType } from "../Core/Instrument.js";
import { KeySignatures } from "../Core/KeySignatures.js";
import { Note } from "../Core/Note.js";
import { RenderMeasureLines, RenderStaffLines } from "../Core/Staff.js";
import { CreateBeams } from "../Factory/Beam.Fact.js";
import { Bounds } from "../Types/Bounds.js";
import { ReturnAccidentalOffset } from "../Workers/Accidentaler.js";
import { RenderAccidental } from "./Accidentals.Renderer.js";
import { RenderKeySignature } from "./KeySignature.Renderer.js";
import { DetermineStemDirection, RenderDots, RenderNote, RenderRest, RenderTies, RenderTuplets, StemDirection, renderLedgerLines, } from "./Note.Renderer.js";
import { CreateStems } from "./Stem.Fact.js";
const line_space = 10;
const line_width = 1;
const endsWidth = 2;
const debug = true;
const noteXBuffer = 9;
function RenderMeasure(measure, renderProps, hovId, mousePos, lastMeasure, noteInput, index, restInput, noteValue, config) {
    //    if (hovId === measure.ID)
    RenderHovered(measure, renderProps, hovId, mousePos, noteInput, restInput, noteValue, config.Theme);
    //    if (debug)
    // RenderDebug(measure, renderProps, index, mousePos);
    RenderMeasureBase(measure, renderProps, mousePos, lastMeasure, config.Theme);
    measure.Staves.forEach((s) => {
        RenderNotes(measure, renderProps, s.Num, config.Theme);
        // TODO: Temporary for testing dynamics rendering
        measure.Divisions.filter((div) => div.Staff === s.Num && div.Beat === 1).forEach((div) => {
            const tempDyn = new Dynamic("ppppp", div.Staff, div.Beat);
            //RenderDynamic(renderProps, measure, tempDyn, config.Theme);
            // temp msr no
            renderProps.context.fillStyle = `rgba(0, 0, 0, ${1.0})`;
            renderProps.context.font = `${12}px Bravura`;
            renderProps.context.fillText(measure.Num.toString(), measure.Bounds.x + 8 + renderProps.camera.x - 8, measure.Bounds.y + 10 + renderProps.camera.y);
        });
    });
}
// TODO: move this function elsewhere
function MiddleLineBounds(measure) {
    // Temporary
    // This is really bad TODO: Remove this method
    if (measure.Staves.length === 0) {
        return new Bounds(0, 0, 0, 0);
    }
    let b = new Bounds(measure.Bounds.x, 0, measure.GetBoundsWithOffset().width, 5);
    let actualLine = 15; // middle line number
    const diff = actualLine - measure.Staves[0].BotLine;
    b.y = measure.Bounds.y + measure.GetMeasureHeight() + (diff * 5 - 2.5);
    return b;
}
function RenderHovered(measure, renderProps, hovId, mousePos, noteInput, restInput, noteValue, theme) {
    const { canvas, context, camera } = renderProps;
    if (noteInput) {
        // context.fillStyle = "rgb(0, 0, 255, 0.1)";
        // const lineY = measure.Bounds.y + (line.num * (line_space / 2) - (line_space / 4));
        // context.fillRect(line.bounds.x + camera.x, lineY + camera.y, line.bounds.width, line.bounds.height);
    }
    // now we are going to test "Sections" as they were in v2
    const divisions = measure.Divisions;
    divisions.forEach((s) => {
        if (s.Bounds.IsHovered(mousePos.x, mousePos.y, camera)) {
            let line = measure.GetLineHovered(mousePos.y, s.Staff);
            if (measure.Instrument.Staff === StaffType.Rhythm) {
                line.num = 15;
                line.bounds = MiddleLineBounds(measure);
            }
            line.bounds.y = measure.GetNotePositionOnLine(line.num, s.Staff);
            // context.fillStyle="rgb(0, 0, 255, 0.1)";
            // context.fillRect(s.Bounds.x + camera.x,
            //                  s.Bounds.y + camera.y,
            //                  s.Bounds.width,
            //                  s.Bounds.height);
            if (noteInput) {
                // temp note
                const tempNoteProps = {
                    Beat: s.Beat,
                    Duration: noteValue,
                    Line: line.num,
                    Rest: restInput,
                    Tied: false,
                    Staff: s.Staff,
                    Tuple: false,
                    TupleIndex: 0,
                    TupleCount: 1,
                    Clef: "treble",
                };
                const tempNote = new Note(tempNoteProps);
                if (!restInput) {
                    RenderNote(tempNote, renderProps, new Bounds(s.Bounds.x + noteXBuffer, line.bounds.y, 0, 0), true, false, StemDirection.Up, theme);
                    // RenderStemRevise(
                    //   renderProps,
                    //   [[tempNote]],
                    //   [s],
                    //   s.Staff,
                    //   measure,
                    //   BeamDirection.Flat,
                    //   theme);
                    renderLedgerLines([tempNote], s, renderProps, s.Staff, measure, theme);
                }
                else {
                    RenderRest(renderProps.context, s, renderProps.camera, tempNote, measure, theme);
                }
            }
        }
    });
}
// Renders the basic lines and bar endings of the measure, no notes or clefs or time
// time signatures
function RenderMeasureBase(msr, renderProps, mousePos, lastMeasure, theme) {
    const { canvas, context, camera } = renderProps;
    // prob move elsewhere I don't know
    if (msr.Selected) {
        context.fillStyle = theme.SelectColour;
        context.fillRect(msr.Bounds.x + camera.x, msr.Bounds.y + camera.y, msr.Bounds.width + msr.XOffset, msr.Bounds.height);
    }
    context.fillStyle = theme.NoteElements;
    RenderMeasureLines(renderProps, msr, lastMeasure, theme);
    msr.Staves.forEach((s) => {
        RenderStaffLines(renderProps, msr, s);
    });
    if (msr.RenderClef) {
        RenderMeasureClef(renderProps, msr, theme);
    }
    if (msr.RenderKey) {
        let key = msr.KeySignature; //"CMaj/Amin";
        if (key === undefined) {
            key = "CMaj/Amin";
            msr.RenderKey = false;
            console.error("Measure Key Signature is undefined");
        }
        if (key !== "CMaj/Amin") {
            const xOff = msr.RenderClef ? 34 : 4;
            msr.Staves.forEach((s) => {
                RenderKeySignature(renderProps, msr, key, msr.Clefs[0].Type, xOff, theme, s.Num);
            });
        }
        else {
            msr.RenderKey = false;
            // This is a temporary fix for dev
        }
    }
    if (msr.RenderTimeSig) {
        let xOff = msr.RenderClef ? 36 : 4;
        if (msr.RenderKey && msr.KeySignature !== "CMaj/Amin") {
            xOff += KeySignatures.get(msr.KeySignature).length * 10;
        }
        RenderTimeSig(renderProps, msr, "4", "4", xOff, theme);
    }
}
function RenderMeasureClef(renderProps, msr, theme) {
    // TODO: Rewrite clef rendering code
    const { canvas, context, camera } = renderProps;
    msr.Clefs.forEach((clef) => {
        if (clef.Beat === 1) {
            clef.render(renderProps, theme);
        }
        else {
            const div = msr.Divisions.find((d) => d.Beat === clef.Beat);
            if (clef.Type === "treble") {
                // const clefPath = RenderTrebleClef(
                //     div.Bounds.x + camera.x,
                //     msr.Bounds.y + camera.y + (5 * msrMidLine + (line_space * 2)));
                //   context.fill(new Path2D(clefPath));
            }
            else if (clef.Type === "bass") {
            }
        }
    });
}
function RenderTimeSig(renderProps, msr, top, bottom, xOffset, theme) {
    msr.TimeSignature.render(renderProps, msr, theme);
}
function RenderNotes(msr, renderProps, staff, theme) {
    const { canvas, context, camera } = renderProps;
    const mDivs = msr.Divisions.filter((d) => d.Staff === staff);
    mDivs.forEach((div, i) => {
        const divNotes = msr.Notes.filter((note) => note.Beat === div.Beat && note.Staff === div.Staff);
        divNotes.sort((a, b) => {
            return a.Line - b.Line;
        });
        if (IsRestOnBeat(div.Beat, divNotes, div.Staff)) {
            RenderRest(context, div, camera, divNotes[0], msr, theme);
            return;
        }
        renderLedgerLines(msr.Notes, div, renderProps, staff, msr, theme);
    });
    const dGroups = GetDivisionGroups(msr, staff);
    dGroups.DivGroups.forEach((group, i) => {
        if (group.Divisions.length > 0) {
            const stemDir = DetermineStemDirection(group.Notes, group.Divisions, staff, msr);
            const beamAngle = DetermineBeamDirection(msr, group, stemDir);
            const stems = CreateStems(group.Notes, group.Divisions, staff, msr, camera);
            let beams = [];
            let tuplet = group.Notes[0][0].Tuple;
            if (group.Divisions.length > 1 && group.Divisions[0].Duration < 0.25) {
                beams = CreateBeams(group, stems, msr);
                beams.forEach((b) => b.Render(context, camera, Beam.BeamCount(group.Divisions[0].Duration, tuplet), stemDir, theme));
            }
            stems.forEach((s) => s.Render(context, camera, theme));
            group.Divisions.forEach((div) => {
                let hasFlipped = false;
                const dN = msr.Notes.filter((note) => note.Beat === div.Beat && note.Staff === staff);
                dN.sort((a, b) => {
                    return a.Line - b.Line;
                });
                dN.forEach((n, i) => {
                    const isFlipped = IsFlippedNote(dN, i, stemDir);
                    if (isFlipped) {
                        hasFlipped = true;
                    }
                    let flipNoteOffset = isFlipped
                        ? stemDir === StemDirection.Up
                            ? 11
                            : -11
                        : 0;
                    if (n.Rest) {
                        RenderRest(context, div, camera, n, msr, theme);
                    }
                    else {
                        RenderNote(n, renderProps, n.Bounds, n.Selected, isFlipped, stemDir, theme);
                        const accNotes = dN.filter((n) => n.Accidental !== 0);
                        accNotes.sort((a, b) => {
                            return a.Line - b.Line;
                        });
                        const offsets = ReturnAccidentalOffset(accNotes);
                        accNotes.forEach((n, i) => {
                            RenderAccidental(renderProps, n, n.Accidental, offsets[i], theme);
                        });
                    }
                });
                // render dots
                dN.forEach((n) => {
                    let flipNoteOffset = hasFlipped
                        ? stemDir === StemDirection.Up
                            ? 11
                            : 0
                        : 0;
                    RenderDots(renderProps, n, div.Bounds.x + noteXBuffer + flipNoteOffset);
                });
            });
        }
    });
    RenderTies(renderProps, msr.Divisions, msr.Notes, StaffType.Single, msr);
    RenderTuplets(renderProps, msr.Divisions, msr.Notes, StaffType.Single, msr, theme);
    if (msr.Instrument.Staff === StaffType.Grand) {
        RenderTies(renderProps, msr.Divisions, msr.Notes, StaffType.Grand, msr);
        RenderTuplets(renderProps, msr.Divisions, msr.Notes, StaffType.Grand, msr, theme);
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
        if (line - nLine === b - index || line - nLine === index - index) {
            countBelow++;
        }
        else {
            break;
        }
    }
    for (let a = index - 1; a >= 0; a--) {
        const line = notes[a].Line;
        if (nLine - line === index - a || nLine - line === index - index) {
            countAbove++;
        }
        else {
            break;
        }
    }
    const totalCount = countAbove + countBelow + 1;
    const notePos = countAbove + 1;
    if (totalCount % 2 === 0) {
        flipped = dir === StemDirection.Up ? notePos % 2 !== 0 : notePos % 2 === 0;
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
