import {
  DetermineStemDirection,
  StemDirection,
} from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { UpdateNoteBounds } from "../Workers/NoteInput.js";
import { Beam } from "./Beam.js";
import { Clef, GetNoteClefType } from "./Clef.js";
import { Flag } from "./Flag.js";
import { Measure } from "./Measure.js";
import { Note, NoteProps } from "./Note.js";
import {
  GetStaffHeight,
  GetStaffHeightUntil,
  GetStaffMiddleLine,
} from "./Staff.js";
import { Stem } from "./Stem.js";
import { GetLargestValues } from "./Values.js";
import { Voice } from "./Voice.js";

enum SubdivisionType {
  CLEF,
  GRACE_NOTE,
  NOTE,
  POST_CLEF, // Special subdivision for clef change in the following measure
}

type Subdivision = {
  Order: number;
  Type: SubdivisionType;
  Bounds: Bounds;
};

interface Division {
  Beat: number;
  Duration: number;
  Bounds: Bounds;
  Staff: number;
  StaffGroup: number;
  Direction: StemDirection;
  NoteXBuffer: number;
  Subdivisions: Subdivision[];
}

interface DivGroup {
  Divisions: Division[];
  Notes: Array<Note[]>;
  CrossStaff: boolean;
  Staff: number;
  Beams: Beam[];
  Stems: Stem[];
  Flags: Flag[];
  StemDir: StemDirection;
}

interface DivGroups {
  DivGroups: DivGroup[];
}

const DivisionMinWidth = 30;
const DivisionMaxWidth = 40;

function CreateDivisions(
  msr: Measure,
  notes: Note[],
  staff: number,
  voice: Voice,
  voiceIndex: number,
): Division[] {
  const divisions: Division[] = [];
  let nextBeat = 0;
  let runningValue = 0;

  notes.sort((a: Note, b: Note) => {
    return a.Beat - b.Beat;
  });

  if (
    notes.filter((n: Note) => n.Staff === staff && n.Grace === false).length ===
    0
  ) {
    const restProps: NoteProps = {
      Beat: 1,
      Duration: 1 * (msr.TimeSignature.top / msr.TimeSignature.bottom),
      Line: GetStaffMiddleLine(msr.Staves, staff),
      Rest: true,
      Tied: false,
      Staff: staff,
      Tuple: false,
      Clef: staff === 0 ? "treble" : "bass",
      Grace: false,
      Voice: voiceIndex,
      Accidental: 0,
    };
    // TODO: Clef should not be determined by staff that makes no sense
    msr.AddNote(new Note(restProps), false, voice);
  }
  notes
    .filter((n) => n.Staff === staff && n.Grace === false && n.Voice === voiceIndex)
    .forEach((n) => {
      // TODO: This should be somewhere else but testing
      if (n.Beat >= msr.TimeSignature.top + 1) {
        n.OutOfBounds = true;
      } else {
        n.OutOfBounds = false;
      }
      if (
        !divisions.find((div) => div.Beat === n.Beat && div.Staff === n.Staff)
      ) {
        divisions.push(CreateDivision(msr, n, staff, StemDirection.Up));
        if (!n.Tuple) {
          nextBeat = n.Beat + n.Duration * msr.TimeSignature.bottom;
        } else {
          nextBeat =
            n.Beat +
            (n.Duration / n.TupleDetails.Count) * msr.TimeSignature.bottom;
        }
        runningValue += n.Duration;
      }
    });
    GenerateMissingBeatDivisions(msr, divisions, staff, voice, voiceIndex);

// CREATING SUBDIVISIONS FOR DIVISION //
  
  divisions
    .filter((div: Division) => div.Staff === staff)
    .forEach((div: Division) => {
      const clef: Clef = msr
        .Clefs
        .find((c: Clef) => c.Staff === div.Staff &&
              c.Beat === div.Beat);
      CreateSubdivisions(
        div,
        notes.filter((n: Note) => n.Beat === div.Beat),
        clef,
      );
    });
  UpdateNoteBounds(msr, staff);
  return divisions;
}

function CreateDivision(
  msr: Measure,
  note: Note,
  staff: number,
  stemDir: StemDirection,
): Division {
  // clefs
  // grace notes
  // else
  var div: Division = {
    Beat: note.Beat,
    Duration: note.Duration,
    Bounds: CreateBeatBounds(msr, note.Beat, note.Duration, staff),
    Staff: staff,
    StaffGroup: note.StaffGroup,
    Direction: stemDir,
    NoteXBuffer: 0,
    Subdivisions: [],
  };

  return div;
}

function CreateSubdivisions(div: Division, notes: Note[], clef: Clef): void {
  div.Subdivisions = [];

  // Add Clef subdivision, set width to 0 if no clef detected for now.
  const clefInDivision = clef !== undefined;
  let clefSubDivWidth = clefInDivision && clef.PostClef === false ? 30 : 0;
  let postClefSubDivWidth = clefInDivision && clef.PostClef === true ? 30 : 0;
  if (div.Beat === 1)
  {
    // Clefs on beat 1 are not rendered in the subdivision
    clefSubDivWidth = 0;
  }
  let clefSubDiv: Subdivision = {
    Order: 1,
    Type: SubdivisionType.CLEF,
    Bounds: new Bounds(div.Bounds.x, div.Bounds.y, clefSubDivWidth, div.Bounds.height),
  };

  div.Subdivisions.push(clefSubDiv);

  notes.forEach((note) => {
    if (
      note.Grace &&
      !div.Subdivisions.find(
        (sd: Subdivision) => sd.Type === SubdivisionType.GRACE_NOTE,
      )
    ) {
      const graceSubdiv: Subdivision = {
        Order: 2,
        Type: SubdivisionType.GRACE_NOTE,
        Bounds: new Bounds(div.Bounds.x + clefSubDivWidth, div.Bounds.y, 15, div.Bounds.height),
      };

      // TODO: Add multiple/infinite(?) grace note subdivisions
//      const graceSubdiv2: Subdivision = {
//        Order: 2,
//        Type: SubdivisionType.GRACE_NOTE,
//        Bounds: new Bounds(
//          div.Bounds.x + 15,
//          div.Bounds.y,
//          15,
//          div.Bounds.height,
//        ),
//      };

      div.Subdivisions.push(graceSubdiv);
//      div.Subdivisions.push(graceSubdiv2);
    }
  });
  var xBuffer = 0;
  div.Subdivisions.forEach((sd: Subdivision) => {
    xBuffer += sd.Bounds.width;
  });
  const noteSubdiv: Subdivision = {
    Order: 3,
    Type: SubdivisionType.NOTE,
    Bounds: new Bounds(
      div.Bounds.x + xBuffer,
      div.Bounds.y,
      div.Bounds.width - xBuffer - postClefSubDivWidth,
      div.Bounds.height,
    ),
  };

  div.Subdivisions.push(noteSubdiv);

  let postClefSubDiv: Subdivision = {
    Order: 4,
    Type: SubdivisionType.POST_CLEF,
    Bounds: new Bounds(div.Bounds.x + div.Bounds.width - postClefSubDivWidth, 
                       div.Bounds.y, postClefSubDivWidth, div.Bounds.height),
  };

  div.Subdivisions.push(postClefSubDiv);

  div.Subdivisions.sort((a: Subdivision, b: Subdivision) => {
    return b.Order - a.Order;
  });
}

function CreateBeatBounds(
  msr: Measure,
  beat: number,
  duration: number,
  staff: number,
): Bounds {
  // single height
  const maxDuration = msr.TimeSignature.GetMaxDuration();
  const durationPercentage = duration / maxDuration;
  const width = msr.Bounds.width * durationPercentage;
  const height = GetStaffHeight(msr.Staves, staff);
  const x =
    msr.Bounds.x +
    msr.XOffset +
    ((beat - 1) / msr.TimeSignature.bottom) * msr.Bounds.width;
  const y = msr.Bounds.y + GetStaffHeightUntil(msr.Staves, staff);
  return new Bounds(x, y, width, height);
}

function ResizeDivisions(
  msr: Measure,
  divisions: Division[],
  staff: number,
): void {
  const divs = divisions.filter((d) => d.Staff === staff);
  divs.sort((a: Division, b: Division) => {
    return a.Beat - b.Beat;
  });
  divs.forEach((div: Division, i: number) => {
    div.Bounds.width = div.Duration * msr.Bounds.width;
    if (i > 0) {
      const lastDivEnd = divs[i - 1].Bounds.x + divs[i - 1].Bounds.width;
      if (lastDivEnd !== div.Bounds.x) {
        div.Bounds.x = lastDivEnd;
      }
    }

    if (i === 0 && divs.length === 1) {
      div.Bounds.width = msr.Bounds.width;
    }
  });
}

function GenerateMissingBeatDivisions(
  msr: Measure,
  divisions: Division[],
  staff: number,
  voice: Voice,
  voiceIndex: number,
): void {
  const sortedDivs = divisions.sort((divA: Division, divB: Division) => {
    return divA.Beat - divB.Beat;
  });
  let startingBeat = 1; // always start at the beginning
  const divisionsToAdd: Division[] = [];
  sortedDivs
    .filter((d) => d.Staff === staff)
    .forEach((div: Division) => {
      const notesOnDiv = voice.Notes.filter((n) => n.Beat === div.Beat);
      if (div.Beat === startingBeat) {
        // there is a div for this beat, set the startingBeat to the next
        // expected division
        startingBeat = div.Beat + div.Duration * msr.TimeSignature.bottom;
        if (notesOnDiv[0].Tuple) {
          // TODO: This is not finished, currently skipping tuplet divisions
          // But there may be cases where we need to generate missing divisions
          // within a tuplet group (maybe), and this will need to be revisited
          startingBeat = notesOnDiv[0].TupleDetails.EndBeat;
        }
      } else if (div.Beat >= startingBeat) {
        let val = (div.Beat - startingBeat) / msr.TimeSignature.bottom;
        let newDivs = GetLargestValues(val);
        let sBeat = startingBeat;
        newDivs.sort();
        newDivs.forEach((v) => {
          divisionsToAdd.push({
            Beat: sBeat,
            Duration: v,
            Bounds: CreateBeatBounds(msr, sBeat, v, div.Staff),
            Staff: div.Staff,
            StaffGroup: notesOnDiv[0].StaffGroup,
            Direction: StemDirection.Up,
            NoteXBuffer: 0,
            Subdivisions: [],
          });
          sBeat += v * msr.TimeSignature.bottom;
        });
        startingBeat = div.Beat + div.Duration * msr.TimeSignature.bottom;
      }
    });

  // Add divisions created above and then empty
  divisions.push(...divisionsToAdd);
  // add RESTS to division gaps
  divisionsToAdd.forEach((div) => {
    const notesOnBeat = voice.Notes.find((n) => n.Beat === div.Beat && n.Staff === div.Staff);
    if (notesOnBeat !== undefined) {
      console.error("Note found in division gap");
    }
    const clefType = GetNoteClefType(msr, div.Beat, staff);
    const restProps: NoteProps = {
      Beat: div.Beat,
      Duration: div.Duration,
      Line: GetStaffMiddleLine(msr.Staves, staff),
      Rest: true,
      Tied: false,
      Staff: div.Staff,
      Tuple: false,
      Clef: clefType,
      Grace: false,
      Voice: voiceIndex,
      Accidental: 0,
    };
    msr.AddNote(new Note(restProps), false, voice);
  });

  // check remaining measure for empty divisions
  const msrDuration =
    (msr.TimeSignature.top / msr.TimeSignature.bottom) *
      msr.TimeSignature.bottom +
    1;
  let reSortedDivs = divisions.filter((div) => div.Staff === staff);
  reSortedDivs = divisions.sort((divA: Division, divB: Division) => {
    return divA.Beat - divB.Beat;
  });
  const lastDiv = reSortedDivs[reSortedDivs.length - 1];
  const lastBeat = lastDiv.Beat + lastDiv.Duration * msr.TimeSignature.bottom;

  const lastDivisionsToAdd = [];
  const rem = msrDuration - lastBeat;
  if (rem > 0) {
    let val = rem / msr.TimeSignature.bottom;
    let newDivs = GetLargestValues(val);
    let sBeat = lastBeat;
    newDivs.sort();
    newDivs.forEach((v) => {
      lastDivisionsToAdd.push({
        Beat: sBeat,
        Duration: v,
        Bounds: CreateBeatBounds(msr, sBeat, v, lastDiv.Staff),
        Staff: staff,
      });
      sBeat += v * msr.TimeSignature.bottom;
    });
  }
  divisions.push(...lastDivisionsToAdd);
  lastDivisionsToAdd.forEach((div) => {
    const notesOnBeat = msr.Voices[msr.ActiveVoice].Notes.find(
      (n) => n.Beat === div.Beat && n.Staff === div.Staff,
    );
    if (notesOnBeat !== undefined) {
      console.error("Note found in division gap");
    }

    const clefType = GetNoteClefType(msr, div.Beat, staff);
    const restProps: NoteProps = {
      Beat: div.Beat,
      Duration: div.Duration,
      Line: GetStaffMiddleLine(msr.Staves, staff),
      Rest: true,
      Tied: false,
      Staff: div.Staff,
      Tuple: false,
      Clef: clefType,
      Grace: false,
      Voice: msr.ActiveVoice,
      Accidental: 0,
    };
    msr.AddNote(new Note(restProps));
  });
}

function GetDivisionTotalWidth(divisions: Division[]): number {
  let width = 0;
  let staff0w = 0;
  let staff1w = 0;
  divisions
    .filter((d) => d.Staff === 0)
    .forEach((div) => {
      staff0w += div.Bounds.width;
    });
  divisions
    .filter((d) => d.Staff === 1)
    .forEach((div) => {
      staff1w += div.Bounds.width;
    });

  width = staff0w > staff1w ? staff0w : staff1w;

  return width;
}

function GetDivisionGroups(msr: Measure, staff: number, voice: number): DivGroup[] {
  const divGroups: DivGroups = { DivGroups: [] };
  let divs: Division[] = [];
  let notes: Array<Note[]> = [];
  let crossStaff: boolean = false;
  // started creating a div group or not
  let startFlag = false;

  const mDivs = msr.Voices[voice].Divisions.filter(
    (d) => d.Staff === staff || d.StaffGroup === staff,
  ).sort((a: Division, b: Division) => {
    return a.Beat - b.Beat;
  });

  // only looking for grace notes, eventually refactor below and only need one
  // loop with functions/branching
  // TODO: Grace note stems/divgroups not being generated properly. Revisit.
  mDivs.forEach((div: Division) => {
    const divNotes = msr.Voices[voice].Notes.filter(
      (n: Note) =>
        n.Beat === div.Beat &&
        (n.Staff === staff || n.StaffGroup === staff) &&
        n.Grace,
    );
    if (divNotes.length > 0) {
      divGroups.DivGroups.push(
        CreateDivisionGroup([div], [divNotes], staff, crossStaff),
      );
    }
  });

  mDivs.forEach((div: Division, i: number) => {
    if (div.Staff !== staff) {
      crossStaff = true;
    }
    const divNotes = msr.Voices[voice].Notes.filter(
      (n) =>
        n.Beat === div.Beat &&
        (n.Staff === staff || n.StaffGroup === staff) &&
        !n.Grace,
    );
    divNotes.sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    });

    const restBeat = IsRestOnBeat(div.Beat, divNotes, staff);

    // this can definitely be cleaned up but it seems to
    // work for now, add tests later and then refactor
    if (restBeat && startFlag) {
      divGroups.DivGroups.push(
        CreateDivisionGroup(divs, notes, staff, crossStaff),
      );
      divs = [];
      notes = [];
      startFlag = false;
    } else if (!restBeat) {
      if (!startFlag) {
        divs.push(div);
        notes.push(divNotes);
        if (div.Duration > 0.125) {
          divGroups.DivGroups.push(
            CreateDivisionGroup(divs, notes, staff, crossStaff),
          );
          divs = [];
          notes = [];
        } else {
          startFlag = true;

          if ( i === msr.Voices[voice].Divisions.filter(
              (d) => d.Staff === staff || d.StaffGroup === staff,
            ).length - 1) {
            // end of measure

            divGroups.DivGroups.push(
              CreateDivisionGroup(divs, notes, staff, crossStaff),
            );
            divs = [];
            notes = [];
          }
        }
      } else {
        if (div.Duration > 0.125) {
          startFlag = false;
          divGroups.DivGroups.push(
            CreateDivisionGroup(divs, notes, staff, crossStaff),
          );
          divs = [];
          notes = [];

          divs.push(div);
          notes.push(divNotes);
          divGroups.DivGroups.push(
            CreateDivisionGroup(divs, notes, staff, crossStaff),
          );
          divs = [];
          notes = [];
        } else {
          if (msr.TimeSignature.Breakpoints.includes(div.Beat)) {
            divGroups.DivGroups.push(
              CreateDivisionGroup(divs, notes, staff, crossStaff),
            );
            divs = [];
            notes = [];
          }
          divs.push(div);
          notes.push(divNotes);
          if (
            i ===
            msr.Voices[voice].Divisions.filter(
              (d) => d.Staff === staff || d.StaffGroup === staff,
            ).length -
              1
          ) {
            divGroups.DivGroups.push(
              CreateDivisionGroup(divs, notes, staff, crossStaff),
            );
            divs = [];
            notes = [];
          }
        }
      }
    }
  });
  return divGroups.DivGroups;
}

function CreateDivisionGroup(
  divs: Division[],
  notes: Note[][],
  staff: number,
  crossStaff: boolean,
): DivGroup {
  const stemDir = DetermineStemDirection(notes, divs);
  return {
    Divisions: divs,
    Notes: notes,
    CrossStaff: crossStaff,
    Staff: staff,
    Stems: [],
    Flags: [],
    Beams: [],
    StemDir: stemDir,
  };
}

function IsRestOnBeat(beat: number, notes: Note[], staff: number): boolean {
  const notesOnBeat = notes.filter(
    (n) => n.Beat === beat && (n.Staff === staff || n.StaffGroup === staff),
  );
  var restFound = !notesOnBeat.find((n) => !n.Rest);
  if (restFound === undefined) {
    restFound = false;
  }
  //  if (restFound && notesOnBeat.length > 1) {
  //    console.error("Rest found on beat with multiple notes, beat: ", beat);
  //  }
  return restFound;
}

export {
  Division,
  CreateDivisions,
  ResizeDivisions,
  GetDivisionTotalWidth,
  DivGroups,
  DivGroup,
  Subdivision,
  SubdivisionType,
  IsRestOnBeat,
  GetDivisionGroups,
  DivisionMinWidth,
  DivisionMaxWidth,
};
