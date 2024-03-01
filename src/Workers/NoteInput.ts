import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note, NoteProps } from "../Core/Note.js";
import { Bounds } from "../Types/Bounds.js";

function InputOnMeasure(msr: Measure,
                        noteValue: number,
                        x: number,
                        y: number,
                        cam: Camera,
                        rest: boolean): void {
  let inputtingNote = true;
  const line = Measure.GetLineHovered(y, msr, cam);
  const beatOver = msr
    .Divisions.find(b => b.Bounds.IsHovered(x, y, cam));
  if (beatOver === undefined) { inputtingNote = false; }
  if (inputtingNote) {
    InputNote(msr, noteValue, beatOver, line, rest);
  }
}

function InputNote(
  msr: Measure,
  noteValue: number,
  division: Division,
  line: { num: number, bounds: Bounds },
  rest: boolean
  ): void {
    const noteProps: NoteProps = {
      Beat: division.Beat,
      Duration: noteValue,
      Line: line.num,
      Rest: rest,
      Tied: false
    };
    const newNote: Note = new Note(noteProps);

    if (division.Duration === noteValue) {
      msr.AddNote(newNote);
    } else {
      if (MeasureHasRoom(noteProps.Beat, noteProps.Duration, msr)) {
        AddToDivision(msr, noteProps);
      }
    } 
    //FillRests(msr);
    msr.CreateDivisions();
}

function MeasureHasRoom(beat: number, duration: number, msr: Measure): boolean {
  return (beat * duration) <= msr.TimeSignature.top * (1 / msr.TimeSignature.bottom);
}

function FillRests(msr: Measure): void {
  const sortedNotes = AllNotesByBeat(msr);
  // this will need to do some stuff with standard values
  // eventually
  let lastBeat = 1;
  let lastDuration = 1;
  const restProperties: NoteProps = {
    Beat: 0,
    Duration: 0,
    Line: 15,
    Rest: true,
    Tied: false
  }
  sortedNotes.forEach((notes: Note[], i: number) => {
    if (notes[0].Rest) { return; }
    if (i === 0) {
      lastBeat = notes[0].Beat;
      lastDuration = notes[0].Duration * msr.TimeSignature.bottom;
    } else {
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
        const remaining = 
          (msr.TimeSignature.bottom + 1) - (lastBeat + lastDuration);
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

function AddToDivision(msr: Measure, noteProps: NoteProps): void {
  let remainingValue = noteProps.Duration;
  let beat = noteProps.Beat;
  msr.Divisions.forEach((div: Division, i: number) => {

    if (remainingValue >= div.Duration && beat === div.Beat) {

      const newNoteProps: NoteProps = {
        Beat: div.Beat,
        Duration: div.Duration,
        Line: noteProps.Line,
        Rest: noteProps.Rest,
        Tied: true
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
            Line: noteProps.Line,
            Rest: noteProps.Rest,
            Tied: false
          }
          remainingValue = 0;
          msr.AddNote(new Note(newNoteProps));
          return;
        } 

        const newNoteProps: NoteProps = {
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
          
          const newNoteProps: NoteProps = {
            Beat: div.Beat + remainingValue * msr.TimeSignature.bottom,
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
