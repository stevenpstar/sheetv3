import { Division } from "../Core/Division.js";
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

  divisions.forEach((div: Division, i: number) => {
    const beamAlt = i * (10 / divisions.length - 1);
    const divNotes = notes[i];
    const isGraceStem = divNotes[0].Grace ? true : false;
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
    const stem: Stem = new Stem(new Bounds(stemX, 0, 1.5, 0), div);

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
    // scale
    if (notes.length > 0 && notes[0][0].Grace) {
      stem.Bounds.height *= 0.6;
      stem.Bounds.width *= 0.6;
    }
    stem.Staff = staff;
    stems.push(stem);
  });
  return stems;
}

export { CreateStems };
