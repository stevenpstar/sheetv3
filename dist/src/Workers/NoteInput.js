import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
function InputOnMeasure(msr, noteValue, x, y, cam) {
    let inputtingNote = true;
    const line = Measure.GetLineHovered(y, msr, cam);
    const beatOver = msr
        .BeatDistribution.find(b => b.bounds.IsHovered(x, y, cam));
    if (beatOver === undefined) {
        inputtingNote = false;
    }
    if (inputtingNote) {
        InputNote(msr, noteValue, beatOver, line);
    }
}
function InputNote(msr, noteValue, division, line) {
    const noteProps = {
        Beat: division.startNumber,
        Duration: noteValue,
        Line: line.num
    };
    const newNote = new Note(noteProps);
    if (division.value === noteValue) {
        msr.AddNote(newNote);
    }
    else if (noteValue > division.value) {
        AddToSmallerDivision(msr, noteProps);
    }
    else {
        AddToSmallerDivision(msr, noteProps);
    }
    msr.CreateBeatDistribution();
}
function AddPartial(msr, noteProps, div, remVal, beat) {
    return { remainingValue: remVal, beat: beat };
}
function AddToSmallerDivision(msr, noteProps) {
    let remainingValue = noteProps.Duration;
    let beat = noteProps.Beat;
    msr.BeatDistribution.forEach(div => {
        if (remainingValue >= div.value && beat === div.startNumber) {
            const newNoteProps = {
                Beat: div.startNumber,
                Duration: div.value,
                Line: noteProps.Line
            };
            remainingValue -= div.value;
            beat += (remainingValue * msr.TimeSignature.bottom);
            msr.AddNote(new Note(newNoteProps));
            console.log("Should go here");
        }
        else if (remainingValue < div.value && beat === div.startNumber) {
            // Get other notes that will be effected
            const notesOnBeat = msr.Notes
                .filter((note) => note.Beat === div.startNumber);
            if (notesOnBeat.length === 0) {
                // If it does not effect any other notes (only rests in div)
                // We can just add a note of our desired value.
                const newNoteProps = {
                    Beat: div.startNumber,
                    Duration: remainingValue,
                    Line: noteProps.Line
                };
                remainingValue = 0;
                msr.AddNote(new Note(newNoteProps));
                return;
            }
            const newNoteProps = {
                Beat: div.startNumber,
                Duration: remainingValue,
                Line: noteProps.Line
            };
            msr.AddNote(new Note(newNoteProps));
            notesOnBeat.forEach(n => {
                let remValue = n.Duration - remainingValue;
                n.Duration = remainingValue;
                const newNoteProps = {
                    Beat: div.startNumber + remainingValue * msr.TimeSignature.bottom,
                    Duration: remValue,
                    Line: n.Line
                };
                msr.AddNote(new Note(newNoteProps));
            });
        }
    });
    console.log(msr.Notes);
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
    console.log(notes);
    return notes;
}
export { InputOnMeasure };
