import { Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
function InputOnMeasure(msr, noteValue, x, y, cam, rest) {
    let inputtingNote = true;
    const line = Measure.GetLineHovered(y, msr, cam);
    const beatOver = msr
        .Divisions.find(b => b.Bounds.IsHovered(x, y, cam));
    if (beatOver === undefined) {
        inputtingNote = false;
    }
    if (inputtingNote) {
        InputNote(msr, noteValue, beatOver, line, rest);
    }
}
function InputNote(msr, noteValue, division, line, rest) {
    const noteProps = {
        Beat: division.Beat,
        Duration: noteValue,
        Line: line.num,
        Rest: rest,
        Tied: false
    };
    const newNote = new Note(noteProps);
    if (division.Duration === noteValue) {
        msr.ClearRestNotes(division.Beat);
        msr.AddNote(newNote);
    }
    else {
        if (MeasureHasRoom(noteProps.Beat, noteProps.Duration, msr)) {
            AddToDivision(msr, noteProps);
        }
    }
    msr.CreateDivisions();
}
function MeasureHasRoom(beat, duration, msr) {
    return (beat * duration) <= msr.TimeSignature.top * (1 / msr.TimeSignature.bottom);
}
function FillRests(msr) {
    const sortedNotes = AllNotesByBeat(msr);
    // this will need to do some stuff with standard values
    // eventually
    let lastBeat = 1;
    let lastDuration = 1;
    const restProperties = {
        Beat: 0,
        Duration: 0,
        Line: 15,
        Rest: true,
        Tied: false
    };
    sortedNotes.forEach((notes, i) => {
        if (notes[0].Rest) {
            return;
        }
        if (i === 0) {
            lastBeat = notes[0].Beat;
            lastDuration = notes[0].Duration * msr.TimeSignature.bottom;
        }
        else {
            let thisBeat = notes[0].Beat;
            let thisDuration = notes[0].Duration * msr.TimeSignature.bottom;
            const diff = thisBeat - (lastBeat + lastDuration);
            if (diff > 0) {
                restProperties.Beat = thisBeat - thisDuration;
                restProperties.Duration = diff / msr.TimeSignature.bottom;
                msr.AddNote(new Note(restProperties));
            }
            lastBeat = notes[0].Beat;
            lastDuration = notes[0].Duration * msr.TimeSignature.bottom;
            if (i === sortedNotes.length - 1) {
                // last note, we need to fill remaining measure with rests
                const remaining = (msr.TimeSignature.bottom + 1) - (lastBeat + lastDuration);
                if (remaining > 0) {
                    restProperties.Beat =
                        (msr.TimeSignature.bottom + 1) - remaining;
                    restProperties.Duration =
                        remaining / msr.TimeSignature.bottom;
                    msr.AddNote(new Note(restProperties));
                }
            }
        }
    });
}
function IsRestOnBeat(msr, beat, notes) {
    const notesOnBeat = notes.filter(n => n.Beat === beat);
    const restFound = notesOnBeat.find(n => n.Rest);
    if (restFound && notesOnBeat.length > 1) {
        console.error("Rest found on beat with multiple notes, beat: ", beat);
    }
    else if (restFound && notesOnBeat.length === 1) {
        msr.ClearRestNotes(beat);
    }
    return restFound !== undefined;
}
function AddToDivision(msr, noteProps) {
    let remainingValue = noteProps.Duration;
    let beat = noteProps.Beat;
    if (noteProps.Rest) {
        noteProps.Line = 15;
    }
    let tying = false;
    let tStart = -1;
    let tEnd = -1;
    msr.Divisions.forEach((div, i) => {
        if (tying && noteProps.Rest) {
            tying = false;
        }
        if (remainingValue >= div.Duration && beat === div.Beat) {
            // clear rests on beat regardless of what we are inputting
            msr.ClearRestNotes(beat);
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
                Tied: tying
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
                .filter((note) => note.Beat === div.Beat);
            if (IsRestOnBeat(msr, beat, notesOnBeat)) {
                // If it does not effect any other notes (only rests in div)
                // We can just add a note of our desired Duration.
                const newNoteProps = {
                    Beat: div.Beat,
                    Duration: remainingValue,
                    Line: noteProps.Line,
                    Rest: noteProps.Rest,
                    Tied: tying
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
            const newNoteProps = {
                Beat: div.Beat,
                Duration: remainingValue,
                Line: noteProps.Line,
                Rest: noteProps.Rest,
                Tied: false
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
export { InputOnMeasure };
