import { Division } from "../Core/Division.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import {
  BeamDirection,
  DetermineStemDirection,
  StemDirection,
} from "./Note.Renderer.js";
import { Note } from "../Core/Note.js";
import { Measure } from "../Core/Measure.js";
import { Theme } from "../Types/Config.js";
import { Stem } from "../Core/Stem.js";
import { Camera } from "../Core/Camera.js";
import { Bounds } from "../Types/Bounds.js";
import { DetermineBeamDirection } from "../Core/Beam.js";
import {
  GetStaffActualMidLine,
  GetStaffHeightUntil,
  GetStaffMiddleLine,
} from "../Core/Staff.js";
import { CreateBeams } from "../Factory/Beam.Fact.js";
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
  midLine: number,
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
  camera: Camera,
): Stem[] {
  const stems: Stem[] = [];
  let dynNoteXBuffer = 9;
  const stemDir: StemDirection = DetermineStemDirection(
    notes,
    divisions,
    staff,
    measure,
  );

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
  const xBuffer = stemDir === StemDirection.Up ? 11.5 : 0.25;
  const beamDir = DetermineBeamDirection(
    measure,
    { Divisions: divisions, Notes: notes },
    stemDir,
  );
  const shouldBeam = divisions.length > 1 && divisions[0].Duration <= 0.25;

  divisions.forEach((div: Division, i: number) => {
    const beamAlt = i * (10 / divisions.length - 1);
    const divNotes = notes[i];
    const numOfAcc = divNotes.filter((n) => n.Accidental !== 0).length;
    if (numOfAcc > 0) {
      dynNoteXBuffer += dynNoteXBuffer * numOfAcc - 1;
    }
    divNotes.sort((a: Note, b: Note) => a.Line - b.Line);
    // TODO: Was alternating between 11 and 12 causing mismatch, may need to be
    // adjusted later not sure.
    let stemX =
      stemDir === StemDirection.Up
        ? divNotes[0].Bounds.x + 10.25
        : divNotes[0].Bounds.x + 0.0; //Math.floor( div.Bounds.x + xBuffer + dynNoteXBuffer);
    if (IsFlippedNote(divNotes, 0, stemDir)) {
      stemX = divNotes[0].Bounds.x + 0.0;
    }
    // stem Y set to 0 for now, is updated later.
    const stem: Stem = new Stem(new Bounds(stemX, 0, 1.5, 0));

    if (stemDir === StemDirection.Up) {
      stem.Bounds.y = divNotes[divNotes.length - 1].Bounds.y + 2.0;
      stem.Bounds.height =
        hNote.Bounds.y - divNotes[divNotes.length - 1].Bounds.y - 35;
    } else {
      stem.Bounds.y = divNotes[0].Bounds.y + 4.0;
      stem.Bounds.height = lNote.Bounds.y - divNotes[0].Bounds.y + 35;
    }

    const diff =
      measure.Staves[staff].TopLine < 0
        ? Math.abs(measure.Staves[staff].TopLine)
        : measure.Staves[staff].TopLine;
    const staffRelativeMid =
      GetStaffActualMidLine(measure.Staves, staff) + diff;
    if (StemToCenter(stemDir, lowestLine, highestLine, staffRelativeMid)) {
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
    stems.push(stem);
  });
  return stems;
}

// v3 of this bloody function
function RenderStem(
  renderProps: RenderProperties,
  notes: Array<Note[]>,
  divisions: Division[],
  staff: number,
  msr: Measure,
  beamDir: BeamDirection,
  theme: Theme,
) {
  const { canvas, context, camera } = renderProps;
  let dynNoteXBuffer = 9;

  const stemDir: StemDirection = DetermineStemDirection(
    notes,
    divisions,
    staff,
    msr,
  );

  const xBuffer = stemDir === StemDirection.Up ? 11.5 : 0.25;

  divisions.forEach((div: Division, i: number) => {
    const divNotes = notes[i];
    divNotes.sort((a: Note, b: Note) => a.Line - b.Line);
    let lowestNote: Note = divNotes[divNotes.length - 1];
    let highestNote: Note = divNotes[0];
    const stemX = Math.floor(
      div.Bounds.x + xBuffer + camera.x + dynNoteXBuffer,
    );
  });
}

export { CreateStems };
