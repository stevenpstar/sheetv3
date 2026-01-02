import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { NoteValues } from "../Core/Values.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { GetNotePositionOnLine, Theme } from "../entry.js";
import {
  NoteHeads,
  RenderScaledNote,
  RenderSymbol,
  Rests,
  TupletNumbers,
  stdFontSize,
} from "./MusicFont.Renderer.js";

enum StemDirection {
  Up,
  Down,
}

enum BeamDirection {
  UpMax,
  UpDynamic,
  DownMax,
  DownDynamic,
  Flat,
}

const noteXBuffer = 9;

function RenderNote(
  note: Note,
  renderProps: RenderProperties,
  Bounds: Bounds,
  selected: boolean,
  flipNote: boolean,
  stemDir: StemDirection,
  theme: Theme,
  colour: string = "black",
): void {
  // TODO: This will be determined by key signature
  // if (note.Accidental !== 0) {
  //   RenderAccidental(renderProps, note, note.Accidental, theme);
  // }
  let { x, y, width, height } = Bounds;
  const { context, camera } = renderProps;
  // TODO: Move this offset somewhere else to be constant
  y = y + 3;
  //
  colour = note.Editable ? theme.NoteElements : theme.UneditableColour;
  colour = selected ? theme.SelectColour : colour;
  const noteScale = note.Grace ? Math.floor(stdFontSize * 0.6) : stdFontSize;
  switch (note.Duration) {
    case 0.125:
    case 0.25:
      //   noteString = posString + noteHead;
      if (note.Opacity < 1.0) {
        note.Opacity += 0.01;
      }
      RenderScaledNote(
        note,
        renderProps,
        NoteHeads.crotchet,
        x,
        y,
        theme,
        selected,
        noteScale,
      );
      break;
    case 0.5:
      RenderScaledNote(
        note,
        renderProps,
        NoteHeads.minim,
        x,
        y,
        theme,
        selected,
        noteScale,
      );
      break;
    case 1:
      RenderScaledNote(
        note,
        renderProps,
        NoteHeads.whole,
        x - 2.5,
        y,
        theme,
        selected,
        noteScale,
      );
      break;
    default:
      RenderScaledNote(
        note,
        renderProps,
        NoteHeads.crotchet,
        x,
        y,
        theme,
        selected,
        noteScale,
      );
  }
  context.fillStyle = theme.NoteElements;
  if (selected) {
    context.fillStyle = theme.SelectColour;
  }

  let debug = false;
  if (debug) {
    context.fillStyle = "rgba(200, 0, 0, 0.5)";
    context.fillRect(x + camera.x, y + camera.y - 5, width, height);
    context.fillStyle = theme.NoteElements;
  }
}

function RenderDots(
  renderProps: RenderProperties,
  note: Note,
  dotXStart: number,
): void {
  const { context, camera } = renderProps;

  let dotCount = 0;
  //doing two separate switches for now
  switch (note.Duration) {
    case NoteValues.n32d:
    case NoteValues.n16d:
    case NoteValues.n8d:
    case NoteValues.n4d:
    case NoteValues.n2d:
    case NoteValues.n1d:
      dotCount = 1;
      break;
    case NoteValues.n32dd:
    case NoteValues.n16dd:
    case NoteValues.n8dd:
    case NoteValues.n4dd:
    case NoteValues.n2dd:
    case NoteValues.n1dd:
      dotCount = 2;
      break;
    case NoteValues.n32ddd:
    case NoteValues.n16ddd:
    case NoteValues.n8ddd:
    case NoteValues.n4ddd:
    case NoteValues.n2ddd:
    case NoteValues.n1ddd:
      dotCount = 3;
      break;
    default:
      dotCount = 0;
  }
  const circle = "a1.485 1.485 90 10-2.97 0 1.485 1.485 90 102.97 0";
  for (let d = 0; d < dotCount; d++) {
    let lineY = note.Line * 5;
    if (note.Line % 2 !== 0) {
      lineY = (note.Line - 1) * 5;
    }
    const cpath =
      `m${dotXStart + camera.x + 17 + d * 5} 
      ${lineY + camera.y}` + circle;
    context.fill(new Path2D(cpath));
  }
}

function RenderRest(
  renderProps: RenderProperties,
  ctx: CanvasRenderingContext2D,
  div: Division,
  cam: Camera,
  note: Note,
  msr: Measure,
  theme: Theme,
): void {
  if (!note) {
    return;
  }
  ctx.fillStyle = theme.NoteElements;

  let x = div.Bounds.x + noteXBuffer;
  //    let y = div.Bounds.y + cam.y + ((note.Line - 3 - msr.SALineTop) * 5);
  let y = GetNotePositionOnLine(msr, note.Line + 3.5, note.Staff);
  let path = `m${x} ${y}`;
  ctx.fillStyle = note.Selected ? theme.SelectColour : theme.NoteElements;
  if (div.Duration === 0.015625) {

  let y = GetNotePositionOnLine(msr, note.Line + 3.5, note.Staff);
    RenderScaledNote(
      note,
      renderProps,
      Rests.HemiDemiSemiQuaver,
      x,
      y + 1,
      theme,
      note.Selected,
      stdFontSize
    );
  }

  if (div.Duration > 0.015625 && div.Duration <= 0.03125) {

    let y = GetNotePositionOnLine(msr, note.Line + 5, note.Staff);
    RenderScaledNote(
      note,
      renderProps,
      Rests.DemiSemiQuaver,
      x,
      y + 1,
      theme,
      note.Selected,
      stdFontSize
    );

//    y += 7;
//    path = `m ${x} ${y}` + demiSemiQuaverRest;
//    ctx.fill(new Path2D(path));
  } else if (div.Duration > 0.03125 && div.Duration <= 0.0625) {

    let y = GetNotePositionOnLine(msr, note.Line + 5, note.Staff);
    RenderScaledNote(
      note,
      renderProps,
      Rests.SemiQuaver,
      x,
      y + 1,
      theme,
      note.Selected,
      stdFontSize
    );

//    y += 9;
//    path = `m ${x} ${y}` + semiQuaverRest;
//    ctx.fill(new Path2D(path));
  } else if (div.Duration > 0.0625 && div.Duration <= 0.125) {

    let y = GetNotePositionOnLine(msr, note.Line + 5, note.Staff);
    RenderScaledNote(
      note,
      renderProps,
      Rests.Quaver,
      x,
      y + 1,
      theme,
      note.Selected,
      stdFontSize
    );
  //  y = y + 10;
  //  path = `m${x} ${y}` + quaverRest;
  //  ctx.fill(new Path2D(path));
  } else if (div.Duration === 0.25) {
    let y = GetNotePositionOnLine(msr, note.Line + 5.5, note.Staff);
    RenderScaledNote(
      note,
      renderProps,
      Rests.Crotchet,
      x,
      y + 1,
      theme,
      note.Selected,
      stdFontSize,
    );
  } else if (div.Duration === 0.5) {
    let y = GetNotePositionOnLine(msr, note.Line + 4.5, note.Staff);
    RenderScaledNote(
      note,
      renderProps,
      Rests.Minim,
      x,
      y + 1,
      theme,
      note.Selected,
      stdFontSize
    );
  } else if (div.Duration >= 1) {
    x = div.Bounds.x + div.Bounds.width / 2;
    RenderScaledNote(
      note,
      renderProps,
      Rests.Whole,
      x,
      y + 1,
      theme,
      note.Selected, // This will not be a constant
      stdFontSize,
    );
 }
}

function RenderTupletAnnotation(
  renderProps: RenderProperties,
  coords: { x1: number; y1: number; x2: number; y2: number },
  count: string,
  theme: Theme,
): void {
  const { context, camera } = renderProps;

  const width = coords.x2 - coords.x1;

  // TODO: Add this to theme maybe
  context.fillStyle = "#75757";
  context.fillRect(coords.x1 + camera.x, coords.y1 - 12 + camera.y, 1, 6);
  context.fillRect(
    coords.x1 + camera.x,
    coords.y1 - 12 + camera.y,
    width / 2 - 14,
    1,
  );

  context.fillRect(
    coords.x1 + width + camera.x,
    coords.y1 - 12 + camera.y,
    1,
    6,
  );
  context.fillRect(
    coords.x1 + width / 2 + 14 + camera.x,
    coords.y1 - 12 + camera.y,
    width / 2 - 14,
    1,
  );

  RenderSymbol(
    renderProps,
    GetTupletGlyph(count),
    coords.x1 + width / 2 - 7,
    coords.y1 - 5,
    theme,
    false,
  );
}

function GetTupletGlyph(count: string): TupletNumbers {
  switch (count) {
    case "0":
      return TupletNumbers.Zero;
    case "1":
      return TupletNumbers.One;
    case "2":
      return TupletNumbers.Two;
    case "3":
      return TupletNumbers.Three;
    case "4":
      return TupletNumbers.Four;
    case "5":
      return TupletNumbers.Five;
    case "6":
      return TupletNumbers.Six;
    case "7":
      return TupletNumbers.Seven;
    case "8":
      return TupletNumbers.Eight;
    case "9":
      return TupletNumbers.Nine;
    default:
      return TupletNumbers.Three;
  }
}

function RenderTuplets(
  renderProps: RenderProperties,
  divisions: Division[],
  notes: Note[],
  staff: number,
  msr: Measure,
  theme: Theme,
): void {
  const { context, camera } = renderProps;
  const divs = divisions.filter((d) => d.Staff === staff);
  divs.sort((a: Division, b: Division) => {
    return a.Beat - b.Beat;
  });
  let foundTuplet = false;
  let tupleX = 0;
  let tupleXEnd = 0;
  let tupleY = 0;
  let tupleCount = 0;

  divs.forEach((div: Division, i: number) => {
    const notesInDiv = notes.filter(
      (n) => n.Beat === div.Beat && n.Staff === staff,
    );
    let nArray = [...notesInDiv];
    const stemDir = DetermineStemDirection([notesInDiv], [div]);
    if (!notesInDiv[0].Tuplet) {
      if (foundTuplet) {
        foundTuplet = false;
        RenderTupletAnnotation(
          renderProps,
          { x1: tupleX, y1: tupleY, x2: tupleXEnd, y2: tupleY },
          tupleCount.toString(),
          theme,
        );
        tupleX = 0;
        tupleXEnd = 0;
        tupleY = 0;
        tupleCount = 0;
      }
      return;
    }
    if (!foundTuplet) {
      foundTuplet = true;
      tupleX = div.Bounds.x + 9;
      tupleCount = notesInDiv[0].TupletDetails.Count;
      tupleY = div.Bounds.y;
      tupleXEnd = div.Bounds.x + 19;
    } else {
      tupleXEnd = div.Bounds.x + 19;
    }
  });
}

function RenderTies(
  renderProps: RenderProperties,
  divisions: Division[],
  notes: Note[],
  staff: number,
  msr: Measure,
): void {
  const { context, camera } = renderProps;
  const divs = divisions.filter((d) => d.Staff === staff);
  divs.sort((a: Division, b: Division) => {
    return a.Beat - b.Beat;
  });
  divs.forEach((div: Division, i: number) => {
    if (i === divs.length - 1) {
      return;
    }
    const divNotes = notes.filter((note: Note) => note.Beat === div.Beat);
    divNotes.sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    });
    const nextDivNotes = notes.filter(
      (note: Note) => note.Beat === divs[i + 1].Beat,
    );
    nextDivNotes.sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    });

    divNotes.forEach((note) => {
      if (
        !note.Tied ||
        note.Rest ||
        (note.Tied &&
          note.Beat + note.Duration * msr.TimeSignature.bottom > note.TiedEnd)
      ) {
        return;
      }
      const tiedTo = nextDivNotes.find(
        (n) => n.Line === note.Line && n.Tied && n.Beat <= n.TiedEnd,
      );
      if (tiedTo === undefined) {
        console.error("No tied note found: ", note);
        return;
      }
      const nextNote = tiedTo;
      const x1 = div.Bounds.x + noteXBuffer + camera.x + 3;
      const y1 =
        GetNotePositionOnLine(msr, note.Line, note.Staff) + camera.y - 4;
      const x2 = divs[i + 1].Bounds.x + noteXBuffer + camera.x + 3;
      const y2 =
        GetNotePositionOnLine(msr, nextNote.Line, note.Staff) + camera.y;
      const midPointX = x2 - (x2 - x1) / 2;
      const distanceX = x2 - x1;
      const curveOffset = note.Line < 15 ? -15 : 15;
      const curveStartOffset = note.Line < 15 ? -8 : 8;
      // TODO: This is temporary, will get more complicated if we do things like
      // collision avoidance probably
      const curveHighPoint = note.Line < 15 ? -20 : 20;
      const curveLowPoint = note.Line < 15 ? -17 : 17;
      // TODO: Testing slurs/ties as svg path
      const slurPath = `
      m ${x1} ${y1} q ${distanceX / 2} ${curveHighPoint} ${distanceX} 0 q -${distanceX / 2} ${curveLowPoint} -${distanceX} 0 z
      //      `;
      context.fill(new Path2D(slurPath));
    });
  });
}

// This will replace some parts of renderStemRevise eventually
function DetermineStemDirection(
  notes: Array<Note[]>,
  divisions: Division[],
): StemDirection {
  let dir = StemDirection.Up;
  // TODO: Not sure we will actually need this, seems like it shouldn't come
  // out of order in the first place.
  notes.sort((a: Note[], b: Note[]) => {
    return a[0].Beat - b[0].Beat;
  });

  let match = true;
  divisions.forEach((div: Division, i: number) => {
    if (div.Beat !== notes[i][0].Beat) {
      console.error("Index: ", i);
      console.error("Match failed on div: ", div);
      console.error("Match failed on beat: ", div.Beat);
      console.error("Match fail note: ", notes[i][0]);
      match = false;
    }
  });

  if (!match) {
    console.error("Divisions and note array do not match");
    return;
  }

  const middleLine = 15;
  let highestLine: number = Number.MAX_SAFE_INTEGER;
  let lowestLine: number = Number.MIN_SAFE_INTEGER;

  notes.forEach((na: Note[]) => {
    na.forEach((n: Note) => {
      if (n.Line < highestLine) {
        highestLine = n.Line;
      }
      if (n.Line > lowestLine) {
        lowestLine = n.Line;
      }
    });
  });

  if (middleLine - highestLine < lowestLine - middleLine) {
    dir = StemDirection.Up;
  } else {
    dir = StemDirection.Down;
  }

  return dir;
}

function renderLedgerLines(
  notes: Note[],
  division: Division,
  renderProps: RenderProperties,
  staff: number,
  msr: Measure,
  theme: Theme,
  colour?: string,
): void {
  const { context, camera } = renderProps;
  // TODO: This code is repeated (search for dynNoteXBuffer)
  // Could be a good idea to make it a function
  let dynNoteXBuffer = noteXBuffer;
  const divNotes = msr.Voices[msr.ActiveVoice].Notes.filter(
    (n) => n.Beat === division.Beat && n.Staff === division.Staff,
  );
  const numOfAcc = divNotes.filter((n) => n.Alter !== 0 || n.Accidental !== "").length;
  if (numOfAcc > 0) {
    dynNoteXBuffer += noteXBuffer * numOfAcc - 1;
  }

  const ledgerX = division.Bounds.x + dynNoteXBuffer - 6 + camera.x;

  //const ledgerString = `m ${x - 6} ${y - 5} h 22 v 2 h-20 v-2 Z`;
  const ledgerString = `h 22 v 1.5 h-20 v-1.5 Z`;

  const bdNotes = notes.filter(
    (note: Note) =>
      note.Beat === division.Beat && note.Staff === division.Staff,
  );
  const midLine = 15;
  if (bdNotes.length === 0) {
    return;
  }
  bdNotes.sort((a: Note, b: Note) => {
    return a.Line - b.Line;
  });

  const highestLine = bdNotes[0];
  const lowestLine = bdNotes[bdNotes.length - 1];
  context.fillStyle = theme.NoteElements;

  for (let l = midLine - 6; l >= highestLine.Line; l -= 2) {
    const ledgerY = GetNotePositionOnLine(msr, l, staff) + camera.y + 2.5;
    const path = `m ${ledgerX} ${ledgerY}` + ledgerString;
    context.fill(new Path2D(path));
  }
  for (let h = midLine + 6; h <= lowestLine.Line; h += 2) {
    const ledgerY = GetNotePositionOnLine(msr, h, staff) + camera.y + 2.5;
    const path = `m ${ledgerX} ${ledgerY}` + ledgerString;
    context.fill(new Path2D(path));
  }
}

export {
  RenderNote,
  RenderRest,
  renderLedgerLines,
  RenderTies,
  DetermineStemDirection,
  RenderDots,
  StemDirection,
  BeamDirection,
  RenderTuplets,
};
