import { Division, Subdivision, SubdivisionType } from "../Core/Division.js";
import {
  BeamDirection,
  DetermineStemDirection,
  StemDirection,
} from "./Note.Renderer.js";
import { Note } from "../Core/Note.js";
import { Measure } from "../Core/Measure.js";
import { Stem } from "../Core/Stem.js";
import { Bounds } from "../Types/Bounds.js";
import { DetermineBeamDirection } from "../Core/Beam.js";
import { GetStaffHeightUntil, GetStaffMiddleLine } from "../Core/Staff.js";
import { IsFlippedNote } from "./Measure.Renderer.js";

// TODO: Temporary (? I always write that) DivGroup metadata object for passing
// to functions, should not be here

type DivGroupMetaData = {
  highestLine: number;
  lowestLine: number;
  hNote: Note;
  lNote: Note;
  shouldBeam: boolean;
  beamDir: BeamDirection;
  stemDir: StemDirection;
};

function AlterHeightForBeam(
  stemDir: StemDirection,
  beamDir: BeamDirection,
  height: number,
  alterAmount: number,
): number {
  if (
    (stemDir === StemDirection.Up && beamDir === BeamDirection.UpMax) ||
    (stemDir === StemDirection.Down && beamDir === BeamDirection.DownMax)
  ) {
    height -= alterAmount;
  } else if (
    (stemDir === StemDirection.Down && beamDir === BeamDirection.UpMax) ||
    (stemDir === StemDirection.Up && beamDir === BeamDirection.DownMax)
  ) {
    height += alterAmount;
  }
  return height;
}

function StemToCenter(
  stemDir: StemDirection,
  lowestLine: number,
  highestLine: number,
): boolean {
  const lineDist = 7;
  if (stemDir === StemDirection.Up) {
    return highestLine > 15 + lineDist;
  } else {
    return lowestLine < 15 - lineDist;
  }
}

// Create Stem Objects (Separate from render, allow to be selectable)
function CreateStems(
  notes: Array<Note[]>,
  divisions: Division[],
  staff: number,
  measure: Measure,
): Stem[] {
  const stems: Stem[] = [];
  let dynNoteXBuffer = 9;
  const stemDir: StemDirection = DetermineStemDirection(notes, divisions);

  let highestLine: number = Number.MAX_SAFE_INTEGER;
  let lowestLine: number = Number.MIN_SAFE_INTEGER;
  let hNote: Note;
  let lNote: Note;

  notes.forEach((na: Note[]) => {
    na.forEach((n: Note) => {
      if (n.Line < highestLine) {
        highestLine = n.Line;
        hNote = n;
      }
      if (n.Line > lowestLine) {
        lowestLine = n.Line;
        lNote = n;
      }
    });
  });

  const staffMidLinePos =
    GetStaffHeightUntil(measure.Staves, staff) +
    GetStaffMiddleLine(measure.Staves, staff) * 5;
  const beamDir = DetermineBeamDirection(
    measure,
    {
      Divisions: divisions,
      Notes: notes,
      CrossStaff: false,
      Staff: staff,
      Stems: [],
      Flags: [],
      Beams: [],
      StemDir: stemDir,
    },
    stemDir,
  );
  const shouldBeam = divisions.length > 1 && divisions[0].Duration <= 0.25;
  const divGroupMetaData: DivGroupMetaData = {
    highestLine: highestLine,
    lowestLine: lowestLine,
    hNote: hNote,
    lNote: lNote,
    shouldBeam: shouldBeam,
    beamDir: beamDir,
    stemDir: stemDir,
  };
  divisions.forEach((_: Division, i: number) => {
    CreateNoteStem(
      measure,
      divGroupMetaData,
      stems,
      notes[i],
      i,
      divisions,
      staffMidLinePos,
      staff,
    );
  });
  return stems;
}

function CreateNoteStem(
  measure: Measure,
  metaData: DivGroupMetaData,
  stems: Stem[],
  notes: Note[],
  i: number,
  divisions: Division[],
  staffMidLinePos: number,
  staff: number,
): void {
  let dynNoteXBuffer = 9;
  let { highestLine, lowestLine, hNote, lNote, shouldBeam, beamDir, stemDir } =
    metaData;
  const beamAlt = i * (10 / divisions.length - 1);
  const divNotes = notes; //[i];
  const isGraceStem = false; //subDiv.Type === SubdivisionType.GRACE_NOTE;
  const scale = isGraceStem ? 0.6 : 1.0;
  const numOfAcc = divNotes.filter((n) => n.Accidental !== 0).length;
  if (numOfAcc > 0) {
    dynNoteXBuffer += dynNoteXBuffer * numOfAcc - 1;
  }
  divNotes.sort((a: Note, b: Note) => a.Line - b.Line);
  let stemX =
    stemDir === StemDirection.Up
      ? divNotes[0].Bounds.x + 10.25 * scale
      : divNotes[0].Bounds.x + 0.0 * scale;
  if (IsFlippedNote(divNotes, 0, stemDir)) {
    stemX = divNotes[0].Bounds.x + 0.0;
  }
  // stem Y set to 0 for now, is updated later.
  const stem: Stem = new Stem(new Bounds(stemX, 0, 1.5, 0), divisions[i]);

  if (stemDir === StemDirection.Up) {
    stem.Bounds.y = divNotes[divNotes.length - 1].Bounds.y + 2.0;
    stem.Bounds.height =
      hNote.Bounds.y - divNotes[divNotes.length - 1].Bounds.y - 35;
  } else {
    stem.Bounds.y = divNotes[0].Bounds.y + 4.0;
    stem.Bounds.height = lNote.Bounds.y - divNotes[0].Bounds.y + 35;
  }

  if (StemToCenter(stemDir, lowestLine, highestLine)) {
    stem.Bounds.height = staffMidLinePos - stem.Bounds.y + measure.Bounds.y;
  }
  if (shouldBeam) {
    stem.Bounds.height = AlterHeightForBeam(
      stemDir,
      beamDir,
      stem.Bounds.height,
      beamAlt,
    );
  }
  stem.Staff = staff;
  stems.push(stem);
}
//function CreateGraceNoteStems(): void;

export { CreateStems };
