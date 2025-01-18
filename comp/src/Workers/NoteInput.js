import { GetNoteClefType } from "../Core/Clef.js";
import { GetDivisionGroups } from "../Core/Division.js";
import { StaffType } from "../Core/Instrument.js";
import { Note } from "../Core/Note.js";
import { GetStaffMiddleLine } from "../Core/Staff.js";
import { GetLargestValues } from "../Core/Values.js";
import { IsFlippedNote } from "../Renderers/Measure.Renderer.js";
import { DetermineStemDirection, StemDirection, } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
const noteXBuffer = 9;
// added for automatic/generated notes from external UIs.
// eg. Generating a random rhythm in the music trainer app
function AddNoteOnMeasure(msr, noteValue, line, beat, rest) {
    InputNote(msr, noteValue, beat, { num: line, bounds: new Bounds(0, 0, 0, 0) }, rest);
}
function InputOnMeasure(msr, noteValue, x, y, cam, rest) {
    let inputtingNote = true;
    const beatOver = msr.Divisions.find((b) => b.Bounds.IsHovered(x, y, cam));
    if (!beatOver) {
        console.error("Beat Over Not Found");
        return;
    }
    let line = msr.GetLineHovered(y, beatOver.Staff);
    if (msr.Instrument.Staff === StaffType.Rhythm) {
        line.num = 15;
    }
    if (inputtingNote) {
        InputNote(msr, noteValue, beatOver, line, rest);
    }
}
function InputNote(msr, noteValue, division, line, rest, tupleCount = 1) {
    const notesInDiv = msr.Notes.filter((n) => n.Beat === division.Beat);
    if (notesInDiv.length < 1) {
        console.error("No notes found in division");
        return;
    }
    const addingToTuple = notesInDiv[0].Tuple;
    if (addingToTuple) {
        if (noteValue !== division.Duration) {
            //TODO: For now only same values can be added to tuplet grouping
            noteValue = noteValue / notesInDiv[0].TupleDetails.Count;
        }
    }
    const clefType = GetNoteClefType(msr, division.Beat, division.Staff);
    const noteProps = {
        Beat: division.Beat,
        Duration: noteValue,
        Line: line.num,
        Rest: rest,
        Tied: false,
        Staff: division.Staff,
        Tuple: addingToTuple,
        TupleDetails: notesInDiv[0].TupleDetails,
        Clef: clefType,
    };
    const newNote = new Note(noteProps);
    if (division.Duration === noteValue) {
        msr.ClearRestNotes(division.Beat, division.Staff);
        msr.AddNote(newNote, true);
    }
    else {
        if (MeasureHasRoom(noteProps.Beat, noteProps.Duration, msr)) {
            AddToDivision(msr, noteProps, division.Staff);
        }
    }
    msr.CreateDivisions(msr.Camera, true);
}
function UpdateNoteBounds(msr, staff) {
    // Maybe should go somewhere else
    // Maybe should be more optimised
    // For now seems to update bounds of notes properly
    const groups = GetDivisionGroups(msr, staff);
    groups.DivGroups.forEach((g) => {
        const { Divisions, Notes } = g;
        const stemDir = DetermineStemDirection(Notes, Divisions);
        Divisions.forEach((div) => {
            // Set Division values for stem direction and X Buffer here
            // TODO: This may need to be a function in the division file
            div.Direction = stemDir;
            const divNotes = msr.Notes.filter((n) => n.Beat === div.Beat && n.Staff === staff);
            divNotes.sort((a, b) => {
                return a.Line - b.Line;
            });
            let dynNoteXBuffer = noteXBuffer;
            const numOfAcc = divNotes.filter((n) => n.Accidental !== 0).length;
            if (numOfAcc > 0) {
                dynNoteXBuffer += noteXBuffer * numOfAcc - 1;
            }
            div.NoteXBuffer = dynNoteXBuffer;
            divNotes.forEach((n, i) => {
                const isFlipped = IsFlippedNote(divNotes, i, stemDir);
                let flipNoteOffset = isFlipped
                    ? stemDir === StemDirection.Up
                        ? 11
                        : -11
                    : 0;
                if (!n.Rest) {
                    n.Bounds.x = Math.floor(div.Bounds.x + dynNoteXBuffer + flipNoteOffset);
                    n.Bounds.y = msr.GetNotePositionOnLine(n.Line, n.Staff);
                }
            });
        });
    });
}
function MeasureHasRoom(beat, duration, msr, tuple = 1) {
    return (beat * duration <= msr.TimeSignature.top * (1 / msr.TimeSignature.bottom));
}
function IsRestOnBeat(msr, beat, notes, staff) {
    const notesOnBeat = notes.filter((n) => n.Beat === beat && n.Staff === staff);
    const restFound = notesOnBeat.find((n) => n.Rest);
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
        noteProps.Line = GetStaffMiddleLine(msr.Staves, staff);
    }
    let tying = false;
    let tStart = -1;
    let tEnd = -1;
    msr.Divisions.filter((d) => d.Staff === staff).forEach((div, i) => {
        if (tying && noteProps.Rest) {
            tying = false;
        }
        if (remainingValue >= div.Duration && beat === div.Beat) {
            // clear rests on beat regardless of what we are inputting
            msr.ClearRestNotes(beat, noteProps.Staff);
            // TODO: Add a method here to check if there's room for
            // Entire duration in oncoming divs (i.e. are they rests)
            let remVal = remainingValue;
            let room = false;
            let lastIndex = 0;
            for (let j = i; j < msr.Divisions.length; j++) {
                if (remVal <= 0 && !room) {
                    continue;
                }
                const notesOnBeat = msr.Notes.filter((n) => n.Beat == msr.Divisions[j].Beat);
                if (notesOnBeat.length > 0 && notesOnBeat[0].Rest) {
                    remVal -= msr.Divisions[j].Duration;
                    if (remVal <= 0) {
                        room = true;
                        lastIndex = j;
                    }
                }
            }
            // TODO: Probably separate this out somewhere else for readability
            if (room) {
                // Clear all rest notes
                for (let j = i; j <= lastIndex; j++) {
                    msr.ClearRestNotes(msr.Divisions[j].Beat, noteProps.Staff);
                }
                const newNoteProps = {
                    Beat: div.Beat,
                    Duration: remainingValue,
                    Line: noteProps.Line,
                    Rest: noteProps.Rest,
                    Tied: false,
                    Staff: div.Staff,
                    Tuple: false,
                    Clef: GetNoteClefType(msr, div.Beat, div.Staff),
                };
                const newNote = new Note(newNoteProps);
                msr.AddNote(newNote, true);
                remainingValue = 0;
                return;
            }
            if (remainingValue > div.Duration &&
                tying === false &&
                !noteProps.Rest) {
                tying = true;
                tStart = div.Beat;
                tEnd =
                    div.Beat +
                        (remainingValue - div.Duration) * msr.TimeSignature.bottom;
            }
            const newNoteProps = {
                Beat: div.Beat,
                Duration: div.Duration,
                Line: noteProps.Line,
                Rest: noteProps.Rest,
                Tied: tying,
                Staff: div.Staff,
                Tuple: false,
                Clef: GetNoteClefType(msr, div.Beat, div.Staff),
            };
            const newNote = new Note(newNoteProps);
            if (tying) {
                newNote.SetTiedStartEnd(tStart, tEnd);
                if (remainingValue - div.Duration <= 0) {
                    tying = false;
                }
            }
            remainingValue -= div.Duration;
            beat += div.Duration * msr.TimeSignature.bottom;
            msr.AddNote(newNote, true);
        }
        else if (remainingValue < div.Duration &&
            beat === div.Beat &&
            remainingValue > 0) {
            // Get other notes that will be effected
            const notesOnBeat = msr.Notes.filter((note) => {
                return note.Beat === div.Beat && note.Staff === div.Staff;
            });
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
                    Tuple: false,
                    Clef: GetNoteClefType(msr, div.Beat, div.Staff),
                };
                const newNote = new Note(newNoteProps);
                if (tying) {
                    newNote.SetTiedStartEnd(tStart, tEnd);
                    if (remainingValue - div.Duration <= 0) {
                        tying = false;
                    }
                }
                remainingValue = 0;
                msr.AddNote(newNote, true);
                return;
            }
            // This note is not tying, but existing notes will
            // need to be tied together
            const newNoteProps = {
                Beat: div.Beat,
                Duration: remainingValue,
                Line: noteProps.Line,
                Rest: noteProps.Rest,
                Tied: false,
                Staff: div.Staff,
                Tuple: noteProps.Tuple,
                TupleDetails: noteProps.TupleDetails,
                Clef: GetNoteClefType(msr, div.Beat, div.Staff),
            };
            const remValue = div.Duration - remainingValue;
            const tiedNoteValues = GetLargestValues(remValue).sort((a, b) => {
                return a - b;
            });
            const tiedStart = div.Beat;
            const tiedEnd = div.Beat + remValue * msr.TimeSignature.bottom;
            notesOnBeat.forEach((n) => {
                n.Duration = remainingValue;
                n.Tied = true;
                n.SetTiedStartEnd(tiedStart, tiedEnd);
                let nextBeat = div.Beat + remainingValue * msr.TimeSignature.bottom;
                tiedNoteValues.forEach((dur, i) => {
                    const shouldTie = i < tiedNoteValues.length - 1;
                    const tiedNote = {
                        Beat: nextBeat,
                        Duration: dur,
                        Line: n.Line,
                        Rest: false,
                        Tied: true,
                        Staff: n.Staff,
                        Tuple: n.Tuple,
                        TupleDetails: n.TupleDetails,
                        Clef: GetNoteClefType(msr, div.Beat, div.Staff),
                    };
                    const noteObj = new Note(tiedNote);
                    noteObj.SetTiedStartEnd(tiedStart, tiedEnd);
                    msr.AddNote(noteObj, true);
                    nextBeat = nextBeat + dur * msr.TimeSignature.bottom;
                });
            });
            msr.AddNote(new Note(newNoteProps), true);
        }
    });
}
function CreateTuplet(selNotes, count) {
    let duration = 0;
    for (let [measure, notes] of selNotes) {
        notes.forEach((sel) => {
            if (sel instanceof Note === false) {
                return;
            }
            const n = sel;
            const tupleDuration = n.Duration;
            const newDuration = n.Duration / count;
            duration = newDuration;
            let lastBeat = n.Beat;
            n.Duration = newDuration;
            n.Tuple = true;
            const details = {
                StartBeat: n.Beat,
                EndBeat: n.Beat + tupleDuration * measure.TimeSignature.bottom,
                Value: tupleDuration,
                Count: count,
            };
            n.TupleDetails = details;
            // add newly created tuplet notes
            for (let i = 1; i < count; i++) {
                const newNote = new Note({
                    Beat: lastBeat + newDuration * measure.TimeSignature.bottom,
                    Duration: newDuration,
                    Line: n.Line,
                    Rest: true,
                    Tied: false,
                    Staff: n.Staff,
                    Tuple: true,
                    TupleDetails: details,
                    Clef: GetNoteClefType(measure, lastBeat + newDuration * measure.TimeSignature.bottom, n.Staff),
                });
                lastBeat = newNote.Beat;
                measure.AddNote(newNote, true);
            }
        });
    }
    return duration;
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
export { InputOnMeasure, UpdateNoteBounds, CreateTuplet, AddNoteOnMeasure };
