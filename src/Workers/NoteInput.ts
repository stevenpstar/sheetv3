import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note, NoteProps } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";

function InputOnMeasure(msr: Measure, noteValue: number, x: number, y: number, cam: Camera): void {
  let inputtingNote = true;
  const line = Measure.GetLineHovered(y, msr, cam);
  const beatOver = msr
    .Divisions.find(b => b.Bounds.IsHovered(x, y, cam));
  if (beatOver === undefined) { inputtingNote = false; }
  if (inputtingNote) {
    InputNote(msr, noteValue, beatOver, line);
  }
}

function InputNote(
  msr: Measure,
  noteValue: number,
  division: Division,
  line: { num: number, bounds: Bounds } 
  ): void {
    const noteProps: NoteProps = {
      Beat: division.Beat,
      Duration: noteValue,
      Line: line.num
    };
    const newNote: Note = new Note(noteProps);

    if (division.Duration === noteValue) {
      msr.AddNote(newNote);
    } else if (noteValue > division.Duration) {
      AddToSmallerDivision(msr, noteProps);
    } else {
      AddToSmallerDivision(msr, noteProps);
    }

    msr.CreateDivisions();
}

function AddPartial(msr: Measure, noteProps: NoteProps, div: Division, remVal: number, beat: number): { remainingValue: number, beat: number } {

      return { remainingValue: remVal, beat: beat };
}

function AddToSmallerDivision(msr: Measure, noteProps: NoteProps): void {
  let remainingValue = noteProps.Duration;
  let beat = noteProps.Beat;
  msr.Divisions.forEach(div => {

    if (remainingValue >= div.Duration && beat === div.Beat) {

      const newNoteProps: NoteProps = {
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
          .filter((note: Note) => note.Beat === div.Beat);

        if (notesOnBeat.length === 0) {
          // If it does not effect any other notes (only rests in div)
          // We can just add a note of our desired Duration.
          const newNoteProps: NoteProps = {
            Beat: div.Beat,
            Duration: remainingValue,
            Line: noteProps.Line
          }
          remainingValue = 0;
          msr.AddNote(new Note(newNoteProps));
          return;
        } 

        const newNoteProps: NoteProps = {
          Beat: div.Beat,
          Duration: remainingValue,
          Line: noteProps.Line
        };
        msr.AddNote(new Note(newNoteProps));

        notesOnBeat.forEach(n => {
          let remValue = n.Duration - remainingValue;
          n.Duration = remainingValue;
          
          const newNoteProps: NoteProps = {
            Beat: div.Beat + remainingValue * msr.TimeSignature.bottom,
            Duration: remValue,
            Line: n.Line
          };
          msr.AddNote(new Note(newNoteProps));
        });
      }
  });
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
  return notes;
}

export { InputOnMeasure }
