import { GetDivisionGroups } from "../Core/Division.js";
import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { GetLargestValues } from "../Core/Values.js";
import { IsFlippedNote } from "../Renderers/Measure.Renderer.js";
import { DetermineStemDirection, StemDirection } from "../Renderers/Note.Renderer.js";
const noteXBuffer = 9;
function InputOnMeasure(msr, noteValue, x, y, cam, rest) {
    let inputtingNote = true;
    const line = Measure.GetLineHovered(y, msr);
    let beatOver = msr.Divisions.find(b => b.Bounds.IsHovered(x, y, cam));
    if (beatOver === undefined) {
        inputtingNote = false;
    }
    if (inputtingNote) {
        InputNote(msr, noteValue, beatOver, line, rest);
    }
}
function InputNote(msr, noteValue, division, line, rest, tupleCount = 1) {
    const notesInDiv = msr.Notes.filter(n => n.Beat === division.Beat);
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
    const noteProps = {
        Beat: division.Beat,
        Duration: noteValue,
        Line: line.num,
        Rest: rest,
        Tied: false,
        Staff: division.Staff,
        Tuple: addingToTuple,
        TupleDetails: notesInDiv[0].TupleDetails
    };
    const newNote = new Note(noteProps);
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
                    n.Bounds.x = Math.floor(div.Bounds.x + noteXBuffer + flipNoteOffset);
                    n.Bounds.y = Measure.GetNotePositionOnLine(msr, n.Line);
                }
            });
        });
    });
}
function MeasureHasRoom(beat, duration, msr, tuple = 1) {
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
                tEnd = div.Beat + (remainingValue - div.Duration) * msr.TimeSignature.bottom;
            }
            const newNoteProps = {
                Beat: div.Beat,
                Duration: div.Duration,
                Line: noteProps.Line,
                Rest: noteProps.Rest,
                Tied: tying,
                Staff: div.Staff,
                Tuple: false,
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
            // Get other notes that will be effected
            const notesOnBeat = msr.Notes
                .filter((note) => {
                return note.Beat === div.Beat &&
                    note.Staff === div.Staff;
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
                };
                const newNote = new Note(newNoteProps);
                if (tying) {
                    newNote.SetTiedStartEnd(tStart, tEnd);
                    if (remainingValue - div.Duration <= 0) {
                        tying = false;
                    }
                }
                remainingValue = 0;
                msr.AddNote(newNote);
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
                TupleDetails: noteProps.TupleDetails
            };
            const remValue = div.Duration - remainingValue;
            const tiedNoteValues = GetLargestValues(remValue).sort((a, b) => {
                return a - b;
            });
            const tiedStart = div.Beat;
            const tiedEnd = div.Beat + remValue * msr.TimeSignature.bottom;
            notesOnBeat.forEach(n => {
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
                        TupleDetails: n.TupleDetails
                    };
                    const noteObj = new Note(tiedNote);
                    noteObj.SetTiedStartEnd(tiedStart, tiedEnd);
                    msr.AddNote(noteObj);
                    nextBeat = nextBeat + dur * msr.TimeSignature.bottom;
                });
            });
            msr.AddNote(new Note(newNoteProps));
        }
    });
}
function CreateTuplet(selNotes, count) {
    let duration = 0;
    for (let [measure, notes] of selNotes) {
        notes.forEach((n) => {
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
                Count: count
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
                    TupleDetails: details
                });
                lastBeat = newNote.Beat;
                measure.AddNote(newNote);
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
export { InputOnMeasure, UpdateNoteBounds, CreateTuplet };
