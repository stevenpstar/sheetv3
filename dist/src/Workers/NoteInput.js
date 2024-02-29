import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
function InputOnMeasure(msr, noteValue, x, y, cam) {
    let inputtingNote = true;
    const line = Measure.GetLineHovered(y, msr, cam);
    const beatOver = msr
        .Divisions.find(b => b.Bounds.IsHovered(x, y, cam));
    if (beatOver === undefined) {
        inputtingNote = false;
    }
    if (inputtingNote) {
        InputNote(msr, noteValue, beatOver, line);
    }
}
function InputNote(msr, noteValue, division, line) {
    const noteProps = {
        Beat: division.Beat,
        Duration: noteValue,
        Line: line.num
    };
    const newNote = new Note(noteProps);
    if (division.Duration === noteValue) {
        msr.AddNote(newNote);
    }
    else if (noteValue > division.Duration) {
        AddToSmallerDivision(msr, noteProps);
    }
    else {
        AddToSmallerDivision(msr, noteProps);
    }
    msr.CreateDivisions();
}
function AddPartial(msr, noteProps, div, remVal, beat) {
    return { remainingValue: remVal, beat: beat };
}
function AddToSmallerDivision(msr, noteProps) {
    let remainingValue = noteProps.Duration;
    let beat = noteProps.Beat;
    msr.Divisions.forEach(div => {
        if (remainingValue >= div.Duration && beat === div.Beat) {
            const newNoteProps = {
                Beat: div.Beat,
                Duration: div.Duration,
                Line: noteProps.Line
            };
            remainingValue -= div.Duration;
            beat += (remainingValue * msr.TimeSignature.bottom);
            msr.AddNote(new Note(newNoteProps));
        }
        else if (remainingValue < div.Duration && beat === div.Beat) {
            // Get other notes that will be effected
            const notesOnBeat = msr.Notes
                .filter((note) => note.Beat === div.Beat);
            if (notesOnBeat.length === 0) {
                // If it does not effect any other notes (only rests in div)
                // We can just add a note of our desired Duration.
                const newNoteProps = {
                    Beat: div.Beat,
                    Duration: remainingValue,
                    Line: noteProps.Line
                };
                remainingValue = 0;
                msr.AddNote(new Note(newNoteProps));
                return;
            }
            const newNoteProps = {
                Beat: div.Beat,
                Duration: remainingValue,
                Line: noteProps.Line
            };
            msr.AddNote(new Note(newNoteProps));
            notesOnBeat.forEach(n => {
                let remValue = n.Duration - remainingValue;
                n.Duration = remainingValue;
                const newNoteProps = {
                    Beat: div.Beat + remainingValue * msr.TimeSignature.bottom,
                    Duration: remValue,
                    Line: n.Line
                };
                msr.AddNote(new Note(newNoteProps));
            });
        }
    });
}
function AddToGreaterDivision(msr, noteProps) {
    let beat = noteProps.Beat; // starting beat
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
export { InputOnMeasure };
