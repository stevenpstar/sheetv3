import { Camera } from "../Core/Camera.js";
import { GetNoteClefType } from "../Core/Clef.js";
import {
  DivGroup,
  GetDivisionGroups,
  Subdivision,
  SubdivisionType,
} from "../Core/Division.js";
import { CreateFlags } from "../Core/Flag.js";
import { StaffType } from "../Core/Instrument.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note, NoteProps, TupleDetails } from "../Core/Note.js";
import { GetStaffMiddleLine, Staff } from "../Core/Staff.js";
import { GetLargestValues } from "../Core/Values.js";
import { CreateBeamsRevise } from "../Factory/Beam.Fact.js";
import { IsFlippedNote } from "../Renderers/Measure.Renderer.js";
import { NoteHeads } from "../Renderers/MusicFont.Renderer.js";
import {
  DetermineStemDirection,
  StemDirection,
} from "../Renderers/Note.Renderer.js";
import { CreateStems } from "../Renderers/Stem.Fact.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable } from "../Types/ISelectable.js";

const noteXBuffer = 9;

// added for automatic/generated notes from external UIs.
// eg. Generating a random rhythm in the music trainer app
function AddNoteOnMeasure(
  msr: Measure,
  noteValue: number,
  line: number,
  beat: Division,
  rest: boolean,
  grace: boolean,
): void {
  const subDivision: Subdivision = beat.Subdivisions.find(
    (sd: Subdivision) => sd.Type === SubdivisionType.NOTE,
  );
  InputNote(
    msr,
    noteValue,
    beat,
    subDivision,
    { num: line, bounds: new Bounds(0, 0, 0, 0) },
    rest,
    grace,
  );
}

function InputOnMeasure(
  msr: Measure,
  noteValue: number,
  x: number,
  y: number,
  cam: Camera,
  rest: boolean,
  grace: boolean,
): void {
  const beatOver = msr.Voices[msr.ActiveVoice].Divisions.find((b) =>
    b.Bounds.IsHovered(x, y, cam),
  );
  if (!beatOver) {
    console.error("Beat Over Not Found");
    return;
  }
  const subDivision = beatOver.Subdivisions.find((sd: Subdivision) => {
    return sd.Bounds.IsHovered(x, y, cam);
  });
  if (!subDivision) {
    console.error("Subdivision on beat not found");
    return;
  }
  let line = msr.GetLineHovered(y, beatOver.Staff);
  if (msr.Instrument.Staff === StaffType.Rhythm) {
    line.num = 15;
  }
  InputNote(msr, noteValue, beatOver, subDivision, line, rest, grace);
}

function InputNote(
  msr: Measure,
  noteValue: number,
  division: Division,
  subDivision: Subdivision,
  line: { num: number; bounds: Bounds },
  rest: boolean,
  grace: boolean,
  tupleCount: number = 1,
): void {
  const notesInDiv = msr.Voices[msr.ActiveVoice].Notes.filter(
    (n) => n.Beat === division.Beat,
  );
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
  const clefType: string = GetNoteClefType(msr, division.Beat, division.Staff);
  const noteProps: NoteProps = {
    Beat: division.Beat,
    Duration: noteValue,
    Line: line.num,
    Rest: rest,
    Tied: false,
    Staff: division.Staff,
    Tuple: addingToTuple,
    TupleDetails: notesInDiv[0].TupleDetails,
    Clef: clefType,
    Grace: grace,
  };
  const newNote: Note = new Note(noteProps);

  if (grace) {
    let order = subDivision.Order;
    if (subDivision.Type !== SubdivisionType.GRACE_NOTE) {
      order = 1;
    }
    newNote.Order = order;
  }

  if (division.Duration === noteValue || grace) {
    msr.ClearRestNotes(division.Beat, division.Staff);
    msr.AddNote(newNote, true);
  } else {
    if (MeasureHasRoom(noteProps.Beat, noteProps.Duration, msr)) {
      AddToDivision(msr, noteProps, division.Staff);
    }
  }
  RecreateDivisionGroups(msr);
  msr.CreateDivisions();
  RecreateStemAndBeams(msr);
}

function RecreateStemAndBeams(msr: Measure): void {
  msr.Voices[msr.ActiveVoice].DivisionGroups.forEach((g: DivGroup) => {
    g.Stems = [];
    g.Beams = [];
    g.Flags = [];
    g.Stems.push(...CreateStems(g.Notes, g.Divisions, g.Staff, msr));
    g.Beams.push(...CreateBeamsRevise(g, g.Stems, false));
    if (g.Divisions.length === 0) { return; }
    if (g.Beams.length === 0 && g.Divisions[0].Duration < 0.25) {
      g.Flags.push(...CreateFlags(g));
    }
  });
}

function RecreateDivisionGroups(msr: Measure): void {
  var groups = [];
  msr.Staves.forEach((staff: Staff) => {
    const group = GetDivisionGroups(msr, staff.Num);
    groups.push(...group);
  });

  msr.Voices[msr.ActiveVoice].DivisionGroups = groups;
}

function UpdateNoteBounds(msr: Measure, staff: number): void {
  // Maybe should go somewhere else
  // Maybe should be more optimised
  // For now seems to update bounds of notes properly
  msr.Voices[msr.ActiveVoice].DivisionGroups.forEach((g: DivGroup) => {
    const { Divisions, Notes } = g;
    const stemDir = DetermineStemDirection(Notes, Divisions);
    Divisions.forEach((div: Division) => {
      // Set Division values for stem direction and X Buffer here
      // TODO: This may need to be a function in the division file
      div.Direction = stemDir;

      const divNotes = msr.Voices[msr.ActiveVoice].Notes.filter(
        (n) => n.Beat === div.Beat && n.Staff === staff,
      );
      divNotes.sort((a: Note, b: Note) => {
        return a.Line - b.Line;
      });
      let dynNoteXBuffer = noteXBuffer;
      const numOfAcc = divNotes.filter((n) => n.Accidental !== 0).length;
      if (numOfAcc > 0) {
        dynNoteXBuffer += noteXBuffer * numOfAcc - 1;
      }
      const noteSubDiv = div.Subdivisions.find(
        (sd: Subdivision) => sd.Type === SubdivisionType.NOTE,
      );
      var subDivBuffer = 0;
      if (noteSubDiv) {
        subDivBuffer = noteSubDiv.Bounds.x - div.Bounds.x;
      }
      div.NoteXBuffer = dynNoteXBuffer + subDivBuffer;

      divNotes.forEach((n: Note, i: number) => {
        const isFlipped = IsFlippedNote(divNotes, i, stemDir);
        let flipNoteOffset = isFlipped
          ? stemDir === StemDirection.Up
            ? 11
            : -11
          : 0;

        if (!n.Rest) {
          n.Bounds.x = Math.floor(
            div.Bounds.x + dynNoteXBuffer + subDivBuffer + flipNoteOffset,
          );
          if (n.Grace) {
            let graceDiv = div.Subdivisions.find(
              (sd: Subdivision) =>
                sd.Order === n.Order && sd.Type === SubdivisionType.GRACE_NOTE,
            );
            if (!graceDiv) {
              graceDiv = div.Subdivisions.find(
                (sd: Subdivision) =>
                  sd.Order === 1 && sd.Type === SubdivisionType.GRACE_NOTE,
              );
            }
            if (!graceDiv) {
              // TODO:
              // Note bounds get updated multiple times, sometimes it is before
              // the subdivisions have been generated. This is probably a minor
              // issue / can be optimised. For now, we have a guard.
            } else {
              n.Bounds.x = graceDiv.Bounds.x + 4;
            }
          }
          n.Bounds.y = msr.GetNotePositionOnLine(n.Line, n.Staff);
        }
      });
    });
  });
  RecreateStemAndBeams(msr);
}

function MeasureHasRoom(
  beat: number,
  duration: number,
  msr: Measure,
  tuple: number = 1,
): boolean {
  return (
    beat * duration <= msr.TimeSignature.top * (1 / msr.TimeSignature.bottom)
  );
}

function IsRestOnBeat(
  msr: Measure,
  beat: number,
  notes: Note[],
  staff: number,
): boolean {
  const notesOnBeat = notes.filter((n) => n.Beat === beat && n.Staff === staff);
  const restFound = notesOnBeat.find((n) => n.Rest);
  if (restFound && notesOnBeat.length > 1) {
    console.error("Rest found on beat with multiple notes, beat: ", beat);
  } else if (restFound && notesOnBeat.length === 1) {
    msr.ClearRestNotes(beat, notesOnBeat[0].Staff);
  }
  return restFound !== undefined;
}

function AddToDivision(
  msr: Measure,
  noteProps: NoteProps,
  staff: number,
): void {
  let remainingValue = noteProps.Duration;
  let beat = noteProps.Beat;
  if (noteProps.Rest) {
    noteProps.Line = GetStaffMiddleLine(msr.Staves, staff);
  }
  let tying = false;
  let tStart = -1;
  let tEnd = -1;
  msr.Voices[msr.ActiveVoice].Divisions.filter(
    (d) => d.Staff === staff,
  ).forEach((div: Division, i: number) => {
    if (tying && noteProps.Rest) {
      tying = false;
    }

    if (remainingValue >= div.Duration && beat === div.Beat) {
      // clear rests on beat regardless of what we are inputting
      msr.ClearRestNotes(beat, noteProps.Staff);
      let remVal = remainingValue;
      let room: boolean = false;
      let lastIndex: number = 0;
      for (let j = i; j < msr.Voices[msr.ActiveVoice].Divisions.length; j++) {
        if (remVal <= 0 && !room) {
          continue;
        }
        const notesOnBeat = msr.Voices[msr.ActiveVoice].Notes.filter(
          (n: Note) => n.Beat == msr.Voices[msr.ActiveVoice].Divisions[j].Beat,
        );
        if (notesOnBeat.length > 0 && notesOnBeat[0].Rest) {
          remVal -= msr.Voices[msr.ActiveVoice].Divisions[j].Duration;
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
          msr.ClearRestNotes(
            msr.Voices[msr.ActiveVoice].Divisions[j].Beat,
            noteProps.Staff,
          );
        }
        const newNoteProps: NoteProps = {
          Beat: div.Beat,
          Duration: remainingValue,
          Line: noteProps.Line,
          Rest: noteProps.Rest,
          Tied: false,
          Staff: div.Staff,
          Tuple: false,
          Clef: GetNoteClefType(msr, div.Beat, div.Staff),
          Grace: noteProps.Grace,
        };

        const newNote = new Note(newNoteProps);
        msr.AddNote(newNote, true);
        remainingValue = 0;
        return;
      }

      if (remainingValue > div.Duration && tying === false && !noteProps.Rest) {
        tying = true;
        tStart = div.Beat;
        tEnd =
          div.Beat + (remainingValue - div.Duration) * msr.TimeSignature.bottom;
      }

      const newNoteProps: NoteProps = {
        Beat: div.Beat,
        Duration: div.Duration,
        Line: noteProps.Line,
        Rest: noteProps.Rest,
        Tied: tying,
        Staff: div.Staff,
        Tuple: false,
        Clef: GetNoteClefType(msr, div.Beat, div.Staff),
        Grace: noteProps.Grace,
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
    } else if (
      remainingValue < div.Duration &&
      beat === div.Beat &&
      remainingValue > 0
    ) {
      // Get other notes that will be effected
      const notesOnBeat = msr.Voices[msr.ActiveVoice].Notes.filter(
        (note: Note) => {
          return note.Beat === div.Beat && note.Staff === div.Staff;
        },
      );
      if (IsRestOnBeat(msr, beat, notesOnBeat, div.Staff)) {
        // If it does not effect any other notes (only rests in div)
        // We can just add a note of our desired Duration.
        const newNoteProps: NoteProps = {
          Beat: div.Beat,
          Duration: remainingValue,
          Line: noteProps.Line,
          Rest: noteProps.Rest,
          Tied: tying,
          Staff: div.Staff,
          Tuple: false,
          Clef: GetNoteClefType(msr, div.Beat, div.Staff),
          Grace: noteProps.Grace,
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
      const newNoteProps: NoteProps = {
        Beat: div.Beat,
        Duration: remainingValue,
        Line: noteProps.Line,
        Rest: noteProps.Rest,
        Tied: false,
        Staff: div.Staff,
        Tuple: noteProps.Tuple,
        TupleDetails: noteProps.TupleDetails,
        Clef: GetNoteClefType(msr, div.Beat, div.Staff),
        Grace: noteProps.Grace,
      };

      const remValue = div.Duration - remainingValue;
      const tiedNoteValues = GetLargestValues(remValue).sort(
        (a: number, b: number) => {
          return a - b;
        },
      );
      const tiedStart = div.Beat;
      const tiedEnd = div.Beat + remValue * msr.TimeSignature.bottom;

      notesOnBeat.forEach((n) => {
        n.Duration = remainingValue;
        n.Tied = true;
        n.SetTiedStartEnd(tiedStart, tiedEnd);
        let nextBeat = div.Beat + remainingValue * msr.TimeSignature.bottom;
        tiedNoteValues.forEach((dur: number, i: number) => {
          const shouldTie = i < tiedNoteValues.length - 1;
          const tiedNote: NoteProps = {
            Beat: nextBeat,
            Duration: dur,
            Line: n.Line,
            Rest: false,
            Tied: true,
            Staff: n.Staff,
            Tuple: n.Tuple,
            TupleDetails: n.TupleDetails,
            Clef: GetNoteClefType(msr, div.Beat, div.Staff),
            Grace: n.Grace,
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

function CreateTuplet(
  selNotes: Map<Measure, ISelectable[]>,
  count: number,
): number {
  let duration = 0;
  for (let [measure, notes] of selNotes) {
    notes.forEach((sel: ISelectable) => {
      if (sel instanceof Note === false) {
        return;
      }
      const n = sel as Note;
      const tupleDuration = n.Duration;
      const newDuration = n.Duration / count;
      duration = newDuration;
      let lastBeat = n.Beat;
      n.Duration = newDuration;
      n.Tuple = true;
      const details: TupleDetails = {
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
          Clef: GetNoteClefType(
            measure,
            lastBeat + newDuration * measure.TimeSignature.bottom,
            n.Staff,
          ),
          Grace: n.Grace,
        });
        lastBeat = newNote.Beat;
        measure.AddNote(newNote, true);
      }
    });
  }
  return duration;
}

function AllNotesByBeat(msr: Measure): Array<Note[]> {
  const notes: Array<Note[]> = [];
  notes.push([]);
  let currentBeat = 1;
  let nIndex = 0;
  msr.Voices[msr.ActiveVoice].Notes.sort((a: Note, b: Note) => {
    return a.Beat - b.Beat;
  });
  msr.Voices[msr.ActiveVoice].Notes.forEach((n: Note) => {
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

export {
  InputOnMeasure,
  UpdateNoteBounds,
  CreateTuplet,
  AddNoteOnMeasure,
  RecreateDivisionGroups,
};
