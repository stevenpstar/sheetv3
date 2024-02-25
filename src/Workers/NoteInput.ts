import { Camera } from "../Core/Camera.js";
import { BeatDistribution, Measure } from "../Core/Measure.js";
import { Note, NoteProps } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";

function InputOnMeasure(msr: Measure, noteValue: number, x: number, y: number, cam: Camera): void {
  let inputtingNote = true;
  const line = Measure.GetLineHovered(y, msr, cam);
  const beatOver = msr
    .BeatDistribution.find(b => b.bounds.IsHovered(x, y, cam));
  if (beatOver === undefined) { inputtingNote = false; }
  if (inputtingNote) {
    InputNote(msr, noteValue, beatOver as BeatDistribution, line);
  }
}

function InputNote(
  msr: Measure,
  noteValue: number,
  division: BeatDistribution,
  line: { num: number, bounds: Bounds } 
  ): void {
    const noteProps: NoteProps = {
      Beat: division.startNumber,
      Duration: noteValue,
      Line: line.num
    };
    const newNote: Note = new Note(noteProps);

    if (division.value === noteValue) {
      msr.AddNote(newNote);
    } else if (noteValue > division.value) {
      AddToSmallerDivision(msr, noteProps);
    } else {
      AddToSmallerDivision(msr, noteProps);
    }

    msr.CreateBeatDistribution();
}

function AddPartial(msr: Measure, noteProps: NoteProps, div: BeatDistribution, remVal: number, beat: number): { remainingValue: number, beat: number } {

      return { remainingValue: remVal, beat: beat };
}

function AddToSmallerDivision(msr: Measure, noteProps: NoteProps): void {
  let remainingValue = noteProps.Duration;
  let beat = noteProps.Beat;
  msr.BeatDistribution.forEach(div => {

    if (remainingValue >= div.value && beat === div.startNumber) {

      const newNoteProps: NoteProps = {
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
          .filter((note: Note) => note.Beat === div.startNumber);

        if (notesOnBeat.length === 0) {
          // If it does not effect any other notes (only rests in div)
          // We can just add a note of our desired value.
          const newNoteProps: NoteProps = {
            Beat: div.startNumber,
            Duration: remainingValue,
            Line: noteProps.Line
          }
          remainingValue = 0;
          msr.AddNote(new Note(newNoteProps));
          return;
        } 

        const newNoteProps: NoteProps = {
          Beat: div.startNumber,
          Duration: remainingValue,
          Line: noteProps.Line
        };
        msr.AddNote(new Note(newNoteProps));

        notesOnBeat.forEach(n => {
          let remValue = n.Duration - remainingValue;
          n.Duration = remainingValue;
          
          const newNoteProps: NoteProps = {
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

function AddToGreaterDivision(msr: Measure, noteProps: NoteProps): void {
  let beat = noteProps.Beat; // starting beat

}

function AllNotesByBeat(msr: Measure): Array<Note[]> {
  const notes: Array<Note[]> = [];
  notes.push([]);
  let currentBeat = 1;
  let nIndex = 0;
  msr.Notes.sort((a: Note, b: Note) => {
    return a.Beat - b.Beat;
  });
  msr.Notes.forEach((n: Note) => {
    if (n.Beat === currentBeat) {
      notes[nIndex].push(n);
    } else {
      notes.push([]);
      nIndex++;
      currentBeat = n.Beat;
      notes[nIndex].push(n);
    }
  });
  console.log(notes);
  return notes;
}

export { InputOnMeasure }
