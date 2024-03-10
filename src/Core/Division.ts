import { Bounds } from "../Types/Bounds.js";
import { Measure } from "./Measure.js";
import { Note, NoteProps } from "./Note.js";
import { GetLargestValues } from "./Values.js";

interface Division {
  Beat: number;
  Duration: number;
  Bounds: Bounds;
}

interface DivGroup {
  Divisions: Division[];
  Notes: Array<Note[]>;
};

interface DivGroups {
  DivGroups: DivGroup[];
}

const DivisionMinWidth = 30;
const DivisionMaxWidth = 40;

function CreateDivisions(msr: Measure, notes: Note[]): Division[] {
  const divisions: Division[] = [];
  let nextBeat = 0;
  let runningValue = 0; 

  notes.sort((a: Note, b: Note) => {
    return a.Beat - b.Beat;
  });

  if (notes.length === 0) {
    const restProps: NoteProps = {
      Beat: 1,
      Duration: 1,
      Line: 15,
      Rest: true,
      Tied: false
    };
    msr.AddNote(new Note(restProps));
  }
  notes.forEach(n => {
    if (!divisions.find(div => div.Beat === n.Beat)) {
      divisions.push(
        {
          Beat: n.Beat,
          Duration: n.Duration,
          Bounds: CreateBeatBounds(msr, n.Beat, n.Duration)
        });
        nextBeat = n.Beat + (n.Duration * msr.TimeSignature.bottom);
        runningValue += n.Duration;
    }
  });
  if (runningValue > 0 && (nextBeat - 1) < msr.TimeSignature.bottom) {
    GenerateMissingBeatDivisions(msr, divisions);
  }
  GenerateMissingBeatDivisions(msr, divisions);
  return divisions;
}

function CreateBeatBounds(msr: Measure, beat: number, duration: number): Bounds {
  const height = msr.Bounds.height; // height will always be max
  const width = msr.Bounds.width * duration; // value will max at 1 (entire measure)
  const y = msr.Bounds.y;
  const x = msr.Bounds.x + msr.XOffset + ((beat - 1) / msr.TimeSignature.bottom) * msr.Bounds.width;
  return new Bounds(x, y, width, height);
}

function ResizeDivisions(msr: Measure, divisions: Division[]): void {
  divisions.forEach((div: Division, i: number) => {
    if (div.Bounds.width < DivisionMinWidth || div.Duration < 0.25) {
      div.Bounds.width = DivisionMinWidth;
    }
    if (div.Bounds.width > DivisionMaxWidth || div.Duration >= 0.25) {
      div.Bounds.width = DivisionMaxWidth;
    }
    if (i > 0) {
      const lastDivEnd = divisions[i-1].Bounds.x + divisions[i-1].Bounds.width;
      if (lastDivEnd !== div.Bounds.x) {
        div.Bounds.x = lastDivEnd;
      }
    }

    if (i === 0 && divisions.length === 1) {
      div.Bounds.width = msr.Bounds.width;
    }
  });
}

function GenerateMissingBeatDivisions(msr: Measure, divisions: Division[]): void {
  const sortedDivs = divisions.sort((divA: Division, divB: Division) => {
    return divA.Beat - divB.Beat;
  });
  let startingBeat = 1; // always start at the beginning
  const divisionsToAdd: Division[] = [];
  sortedDivs.forEach((div: Division, i: number) => {
    if (div.Beat === startingBeat) {
      // there is a div for this beat, set the startingBeat to the next
      // expected division
      startingBeat = div.Beat + div.Duration * msr.TimeSignature.bottom;
    } else {
      let val = (div.Beat - startingBeat) / msr.TimeSignature.bottom;
      let newDivs = GetLargestValues(val);
      let sBeat = startingBeat;
      newDivs.sort();
      newDivs.forEach(v => {
        divisionsToAdd.push(
          {
            Beat: sBeat,
            Duration: v,
            Bounds: CreateBeatBounds(msr, sBeat, v)
          });
          sBeat += v * msr.TimeSignature.bottom;
      });
      startingBeat = div.Beat + div.Duration * msr.TimeSignature.bottom;
    }
  });

  // Add divisions created above and then empty
  divisions.push(...divisionsToAdd);
  // add RESTS to division gaps
  divisionsToAdd.forEach(div => {
    const notesOnBeat = msr.Notes.find(n => n.Beat === div.Beat);
    if (notesOnBeat !== undefined) {
      console.error("Note found in division gap");
    }
    const restProps: NoteProps = {
      Beat: div.Beat,
      Duration: div.Duration,
      Line: 15,
      Rest: true,
      Tied: false
    };
    msr.AddNote(new Note(restProps));
  });

  // check remaining measure for empty divisions
  const msrDuration = (msr.TimeSignature.top / msr.TimeSignature.bottom) * msr.TimeSignature.bottom + 1;

  const reSortedDivs = divisions.sort((divA: Division, divB: Division) => {
    return divA.Beat - divB.Beat;
  });
  const lastDiv = reSortedDivs[reSortedDivs.length-1];
  const lastBeat = lastDiv.Beat +
    lastDiv.Duration * msr.TimeSignature.bottom;

  const lastDivisionsToAdd = [];
  const rem = (msrDuration - lastBeat);
  if (rem > 0) {
    let val = rem / msr.TimeSignature.bottom;
    let newDivs = GetLargestValues(val);
    let sBeat = lastBeat;
    newDivs.sort();
    newDivs.forEach(v => {
      lastDivisionsToAdd.push(
        {
          Beat: sBeat,
          Duration: v,
          Bounds: CreateBeatBounds(msr, sBeat, v)
        });
        sBeat += v * msr.TimeSignature.bottom;
    });
  }
  divisions.push(...lastDivisionsToAdd);
  lastDivisionsToAdd.forEach(div => {
    const notesOnBeat = msr.Notes.find(n => n.Beat === div.Beat);
    if (notesOnBeat !== undefined) {
      console.error("Note found in division gap");
    }
    const restProps: NoteProps = {
      Beat: div.Beat,
      Duration: div.Duration,
      Line: 15,
      Rest: true,
      Tied: false
    };
    msr.AddNote(new Note(restProps));
  });

}

function GetDivisionTotalWidth(divisions: Division[]): number {
  let width = 0;
  divisions.forEach(div => {
    width += div.Bounds.width;
  });
  return width;
}

function GetDivisionGroups(msr: Measure): DivGroups {
  const divGroups: DivGroups = { DivGroups: [] };
  let divs: Division[] = [];
  let notes: Array<Note[]> = [];
  // started creating a div group or not
  let startFlag = false;

  msr.Divisions.forEach((div: Division, i: number) => {
    const divNotes = msr.Notes.filter(n => n.Beat === div.Beat);
    divNotes.sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    });

    const restBeat = IsRestOnBeat(div.Beat, divNotes);

    // this can definitely be cleaned up but it seems to
    // work for now, add tests later and then refactor
    if (restBeat && startFlag) {
      divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
      divs = [];
      notes = [];
      startFlag = false;
    } else if (!restBeat) {
      if (!startFlag) {
        divs.push(div);
        notes.push(divNotes);
        if (div.Duration > 0.125) {
          divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
          divs = [];
          notes = [];
        } else {
          startFlag = true;
          if (i === msr.Divisions.length - 1) {
            // end of measure
            divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
            divs = [];
            notes = [];
          }
        }
      } else {
        if (div.Duration > 0.125) {
          startFlag = false;
          divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
          divs = [];
          notes = [];

          divs.push(div);
          notes.push(divNotes);
          divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
          divs = [];
          notes = [];
        } else {
          divs.push(div);
          notes.push(divNotes);
          if (i === msr.Divisions.length - 1) {
            divGroups.DivGroups.push({ Divisions: divs, Notes: notes });
            divs = [];
            notes = [];
          }
        }
      }
    }
  });
  return divGroups;
}

function IsRestOnBeat(beat: number, notes: Note[]): boolean {
  const notesOnBeat = notes.filter(n => n.Beat === beat);
  const restFound = notesOnBeat.find(n => n.Rest);
  if (restFound && notesOnBeat.length > 1) { 
    console.error("Rest found on beat with multiple notes, beat: ", beat);
  }
  return restFound !== undefined;
}


export { Division,
  CreateDivisions,
  ResizeDivisions,
  GetDivisionTotalWidth,
  DivGroups,
  DivGroup,
  IsRestOnBeat,
  GetDivisionGroups}

