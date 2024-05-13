import { GetDivisionGroups } from "../Core/Division.js";
import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { IsFlippedNote } from "../Renderers/Measure.Renderer.js";
import { DetermineStemDirection, StemDirection } from "../Renderers/Note.Renderer.js";
const noteXBuffer = 9;
function InputOnMeasure(msr, noteValue, x, y, cam, rest) {
    let inputtingNote = true;
    const line = Measure.GetLineHovered(y, msr);
    const tupleCount = 3; // TODO: Prototype code here, testing triplets.
    let beatOver = msr.Divisions.find(b => b.Bounds.IsHovered(x, y, cam));
    if (beatOver === undefined) {
        inputtingNote = false;
    }
    if (inputtingNote) {
        InputNote(msr, noteValue, beatOver, line, rest, tupleCount);
    }
}
function InputNote(msr, noteValue, division, line, rest, tupleCount = 1) {
    const noteProps = {
        Beat: division.Beat,
        Duration: noteValue,
        Line: line.num,
        Rest: rest,
        Tied: false,
        Staff: division.Staff,
        Tuple: tupleCount > 1,
        TupleIndex: 0,
        TupleCount: tupleCount
    };
    const newNote = new Note(noteProps);
    if (tupleCount > 1) {
        noteProps.Duration = (noteValue * 2) / tupleCount;
    }
    if (division.Duration === noteValue) {
        msr.ClearRestNotes(division.Beat, division.Staff);
        msr.AddNote(newNote);
    }
    else {
        if (MeasureHasRoom(noteProps.Beat, noteProps.Duration, msr)) {
            AddToDivision(msr, noteProps, division.Staff);
        }
    }
    msr.CreateDivisions(msr.Camera, true);
    UpdateNoteBounds(msr, division.Staff);
}
function UpdateNoteBounds(msr, staff) {
    // Maybe should go somewhere else
    // Maybe should be more optimised
    // For now seems to update bounds of notes properly
    const groups = GetDivisionGroups(msr, staff);
    groups.DivGroups.forEach((g) => {
        const { Divisions, Notes } = g;
        const stemDir = DetermineStemDirection(Notes, Divisions, staff, msr);
        Divisions.forEach((div) => {
            const divNotes = msr.Notes.filter(n => n.Beat === div.Beat &&
                n.Staff === staff);
            divNotes.sort((a, b) => {
                return a.Line - b.Line;
            });
            divNotes.forEach((n, i) => {
                const isFlipped = IsFlippedNote(divNotes, i, stemDir);
                let flipNoteOffset = isFlipped ?
                    stemDir === StemDirection.Up ? 11 : -11 : 0;
                if (!n.Rest) {
                    const lineSubt = n.Staff === 0 ?
                        0 + msr.SALineTop :
                        msr.SBLineTop;
                    n.Bounds.x = div.Bounds.x + noteXBuffer + flipNoteOffset;
                    n.Bounds.y = Measure.GetNotePositionOnLine(msr, n.Line);
                }
            });
        });
    });
}
function MeasureHasRoom(beat, duration, msr, tuple = 1) {
    // Temporary prototype code working on groupings/triplets/tuples
    if (tuple === 3) {
        duration *= 2;
    }
    return (beat * duration) <= msr.TimeSignature.top * (1 / msr.TimeSignature.bottom);
}
function IsRestOnBeat(msr, beat, notes, staff) {
    const notesOnBeat = notes.filter(n => n.Beat === beat && n.Staff === staff);
    const restFound = notesOnBeat.find(n => n.Rest);
    if (restFound && notesOnBeat.length > 1) {
        console.error("Rest found on beat with multiple notes, beat: ", beat);
    }
    else if (restFound && notesOnBeat.length === 1) {
        msr.ClearRestNotes(beat, notesOnBeat[0].Staff);
    }
    return restFound !== undefined;
}
function AddToDivision(msr, noteProps, staff) {
    let remainingValue = noteProps.Duration;
    let beat = noteProps.Beat;
    if (noteProps.Rest) {
        noteProps.Line = staff === 0 ? msr.SALineMid : msr.SBLineMid;
    }
    let tying = false;
    let tStart = -1;
    let tEnd = -1;
    const isTuple = noteProps.Tuple;
    msr.Divisions.filter(d => d.Staff === staff).forEach((div, i) => {
        if (tying && noteProps.Rest) {
            tying = false;
        }
        if (remainingValue >= div.Duration && beat === div.Beat) {
            // clear rests on beat regardless of what we are inputting
            msr.ClearRestNotes(beat, noteProps.Staff);
            if (remainingValue > div.Duration && tying === false && !noteProps.Rest) {
                tying = true;
                tStart = div.Beat;
                tEnd = div.Beat + remainingValue * msr.TimeSignature.bottom;
            }
            const newNoteProps = {
                Beat: div.Beat,
                Duration: div.Duration,
                Line: noteProps.Line,
                Rest: noteProps.Rest,
                Tied: tying,
                Staff: div.Staff,
                Tuple: noteProps.Tuple,
                TupleIndex: noteProps.TupleIndex,
                TupleCount: noteProps.TupleCount
            };
            const newNote = new Note(newNoteProps);
            if (tying) {
                newNote.SetTiedStartEnd(tStart, tEnd);
                if (remainingValue - div.Duration <= 0) {
                    tying = false;
                }
            }
            remainingValue -= div.Duration;
            beat += (div.Duration * msr.TimeSignature.bottom);
            msr.AddNote(newNote);
        }
        else if (remainingValue < div.Duration && beat === div.Beat
            && remainingValue > 0) {
            console.log("We are here but we prob aren't");
            // Get other notes that will be effected
            const notesOnBeat = msr.Notes
                .filter((note) => note.Beat === div.Beat);
            if (IsRestOnBeat(msr, beat, notesOnBeat, div.Staff)) {
                // If it does not effect any other notes (only rests in div)
                // We can just add a note of our desired Duration.
                const newNoteProps = {
                    Beat: div.Beat,
                    Duration: remainingValue,
                    Line: noteProps.Line,
                    Rest: noteProps.Rest,
                    Tied: tying,
                    Staff: div.Staff,
                    Tuple: noteProps.Tuple,
                    TupleIndex: noteProps.TupleIndex,
                    TupleCount: noteProps.TupleCount
                };
                const newNote = new Note(newNoteProps);
                // prototype code
                const nextBeat = div.Beat + remainingValue * msr.TimeSignature.bottom;
                const tuple2 = new Note({
                    Beat: nextBeat,
                    Duration: remainingValue,
                    Line: noteProps.Line,
                    Rest: noteProps.Rest,
                    Tied: tying,
                    Staff: div.Staff,
                    Tuple: noteProps.Tuple,
                    TupleIndex: (noteProps.TupleIndex + 1),
                    TupleCount: noteProps.TupleCount
                });
                const beat3 = tuple2.Beat + remainingValue * msr.TimeSignature.bottom;
                const tuple3 = new Note({
                    Beat: beat3,
                    Duration: remainingValue,
                    Line: noteProps.Line,
                    Rest: noteProps.Rest,
                    Tied: tying,
                    Staff: div.Staff,
                    Tuple: noteProps.Tuple,
                    TupleIndex: (noteProps.TupleIndex + 2),
                    TupleCount: noteProps.TupleCount
                });
                console.log("tuple3: ", tuple3);
                //
                if (tying) {
                    newNote.SetTiedStartEnd(tStart, tEnd);
                    if (remainingValue - div.Duration <= 0) {
                        tying = false;
                    }
                }
                remainingValue = 0;
                msr.AddNote(newNote);
                msr.AddNote(tuple2);
                msr.AddNote(tuple3);
                console.log(msr.Notes);
                return;
            }
            const newNoteProps = {
                Beat: div.Beat,
                Duration: remainingValue,
                Line: noteProps.Line,
                Rest: noteProps.Rest,
                Tied: false,
                Staff: div.Staff,
                Tuple: noteProps.Tuple,
                TupleIndex: noteProps.TupleIndex,
                TupleCount: noteProps.TupleCount
            };
            msr.AddNote(new Note(newNoteProps));
            notesOnBeat.forEach(n => {
                let remValue = n.Duration - remainingValue;
                n.Duration = remainingValue;
                const newNoteProps = {
                    Beat: div.Beat + remValue * msr.TimeSignature.bottom,
                    Duration: remValue,
                    Line: n.Line,
                    Rest: false,
                    Tied: false,
                    Staff: div.Staff,
                    Tuple: false,
                    TupleIndex: 0,
                    TupleCount: 1
                };
                msr.AddNote(new Note(newNoteProps));
            });
        }
    });
}
function AllNotesByBeat(msr) {
    const notes = [];
    notes.push([]);
    let currentBeat = 1;
    let nIndex = 0;
    msr.Notes.sort((a, b) => {
        return a.Beat - b.Beat;
    });
    msr.Notes.forEach((n) => {
        if (n.Beat === currentBeat) {
            notes[nIndex].push(n);
        }
        else {
            notes.push([]);
            nIndex++;
            currentBeat = n.Beat;
            notes[nIndex].push(n);
        }
    });
    return notes;
}
export { InputOnMeasure, UpdateNoteBounds };
