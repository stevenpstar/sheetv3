import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { GetStaffMiddleLine } from "../Core/Staff.js";
import { NoteValues } from "../Core/Values.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
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

const crotchetRest =
  "c-.2863.1212-.4577.5392-.326.8318.0397.0418.4556.5392.8736 1.0868.9551 1.0764 1.1182 1.3313 1.3292 1.8288.8339 1.7054.3762 3.877-1.0847 5.2501-.1233.163-.6625.6186-1.1683.9948-1.4525 1.2498-2.1214 1.9604-2.368 2.5874-.0899.1651-.0899.3281-.0899.581-.0397.5789 0 .6291 1.7159 2.6209 2.3262 2.7922 3.9919 4.7506 4.1215 4.8739l.1233.1212-.163-.0815c-2.2948-.9551-4.8739-1.4128-5.7475-.9948-.2947.1212-.4661.2926-.5873.5789-.3365.7106-.2466 1.7556.2529 3.2897.4556 1.3794 1.371 3.2082 2.2844 4.5813.3762.5873 1.0868 1.5006 1.1683 1.5424.1233.1233.2947.0815.4159 0 .1233-.163.1233-.2947-.1212-.5789-.8736-1.2498-1.2895-3.8372-.7921-5.2104.2027-.6186.4577-.9551.9133-1.1662 1.208-.5392 3.879.1296 4.9972 1.2477.0815.0836.2529.255.3344.2947.2947.1233.7106-.0397.8339-.3344.1714-.2947.0815-.4974-.2947-.9551-.7022-.8339-2.8257-3.3315-3.1183-3.7077-.7524-.8736-1.0868-1.7054-1.1683-2.7504-.0397-1.3313.4974-2.7421 1.5027-3.6659.1212-.163.6604-.6207 1.16-.9948 1.5424-1.2916 2.1715-2.0001 2.416-2.671.1714-.5392.0899-1.0366-.2863-1.4943-.1296-.1212-1.5842-1.9186-3.2897-3.9585-2.3345-2.7442-3.1684-3.7474-3.2897-3.7892-.1714-.0397-.3762-.0397-.5476.0418z";
const quaverRest =
  "c-.884.1666-1.5606.7769-1.8666 1.6201-.0663.272-.0663.3383-.0663.7106 0 .5117.0323.7837.272 1.1883.3383.6783 1.0489 1.2223 1.8598 1.4212.85.2397 2.2712.034 3.8981-.5049l.4046-.1394-1.9992 5.525-1.9652 5.5182c0 0 .0663.034.1734.1071.1989.1326.5372.2329.7769.2329.4046 0 .9163-.2329.9826-.4386 0-.0663.9486-3.2878 2.0978-7.1128l2.0315-7.0125-.0663-.0986c-.1649-.2057-.5032-.272-.7106-.1071-.0663.0663-.1717.2057-.238.306-.306.5117-1.0829 1.4212-1.4875 1.7595-.3723.306-.578.3383-.9163.2057-.306-.1666-.4063-.3383-.612-1.2546-.1989-.9095-.4369-1.3226-.9486-1.6609-.4726-.3043-1.0829-.4046-1.6201-.2652z";
const semiQuaverRest =
  "c-.6228.1176-1.1016.5484-1.3116 1.1436-.0516.192-.0516.2388-.0516.5016 0 .3612.0228.5532.192.8388.2388.4788.7404.8628 1.3176 1.0032.5952.1692 1.5504.0468 2.7-.3324.168-.0708.3084-.1224.3084-.0984 0 .0276-1.0728 3.516-1.1196 3.6372-.1224.3096-.5304.882-.8868 1.242-.3324.3336-.5016.408-.7632.2868-.216-.1176-.2868-.24-.432-.8868-.1212-.4776-.2148-.7404-.4068-.9276-.5016-.5532-1.3644-.624-2.0304-.192-.3144.2148-.5532.5484-.6936.9096-.0516.1872-.0516.2388-.0516.5004 0 .3564.0276.5496.192.8352.2388.4776.7404.8628 1.3176 1.0032.2628.0744.9324.0744 1.3872 0 .3792-.0708.834-.1884 1.2888-.3336.192-.0696.3612-.1164.3612-.0936 0 0-2.3436 7.6272-2.3904 7.7436 0 .024.1872.1692.3792.216.192.0756.3852.0756.5772 0 .1872-.0468.3792-.1644.3792-.2388.024-.024.9804-3.6324 2.1516-8.0112l2.1288-7.9596-.0468-.0696c-.0948-.1452-.2868-.1692-.4548-.0984-.0948.0468-.0948.0468-.3804.4776-.2388.384-.576.7872-.768.9792-.2628.216-.4032.2628-.6432.1692-.2148-.1176-.2904-.2388-.4308-.8856-.1452-.642-.3144-.9336-.6708-1.1724-.3324-.2148-.7632-.2856-1.1484-.1872z";
const demiSemiQuaverRest =
  "m0 0c-.516.101-.918.461-1.094.957-.043.16-.043.199-.043.418 0 .218 0 .3.043.418.137.441.418.777.856.976.297.16.437.18.855.18.52 0 .957-.078 1.657-.297.179-.063.316-.102.316-.102.019 0-.16.7-.399 1.536-.296 1.175-.417 1.554-.457 1.671-.16.301-.5.758-.718.957-.2.18-.317.219-.516.141-.18-.098-.242-.199-.359-.738-.102-.399-.18-.617-.34-.778-.418-.457-1.137-.515-1.692-.156-.261.176-.46.457-.578.754-.043.16-.043.199-.043.418 0 .301.024.461.161.699.199.399.617.719 1.097.836.219.063.778.063 1.156 0 .317-.058.696-.16 1.075-.277.179-.059.32-.102.32-.102 0 .02-.797 3.051-.84 3.11-.156.34-.476.758-.715.996-.258.258-.398.301-.617.219-.18-.098-.242-.2-.359-.739-.102-.398-.18-.617-.34-.773-.418-.461-1.137-.52-1.692-.16-.261.179-.46.457-.578.758-.043.156-.043.199-.043.417 0 .219 0 .297.043.418.137.438.418.778.856.977.32.16.437.18.875.18.32 0 .422 0 .679-.043.36-.059.739-.176 1.157-.297l.258-.102v.063c-.02.078-1.696 6.375-1.715 6.414-.02.082.34.238.558.238.219 0 .539-.137.559-.238.019-.02.976-4.145 2.172-9.164 2.133-9.086 2.133-9.106 2.094-9.168-.063-.078-.161-.117-.282-.117-.14.019-.199.078-.34.316-.277.481-.597.898-.773 1.039-.121.078-.223.078-.379.02-.18-.102-.242-.2-.359-.739-.121-.539-.262-.777-.559-.976-.277-.18-.637-.238-.957-.16z";
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
  let y = msr.GetNotePositionOnLine(note.Line + 3.5, note.Staff);
  let path = `m${x} ${y}`;
  ctx.fillStyle = note.Selected ? theme.SelectColour : theme.NoteElements;
  console.log("div duration: ", div.Duration);
  if (div.Duration === 0.015625) {

  let y = msr.GetNotePositionOnLine(note.Line + 3.5, note.Staff);
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

  if (div.Duration === 0.03125) {

    let y = msr.GetNotePositionOnLine(note.Line + 5, note.Staff);
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
  } else if (div.Duration === 0.0625) {

    let y = msr.GetNotePositionOnLine(note.Line + 5, note.Staff);
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

    let y = msr.GetNotePositionOnLine(note.Line + 5, note.Staff);
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
    let y = msr.GetNotePositionOnLine(note.Line + 5.5, note.Staff);
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
    let y = msr.GetNotePositionOnLine(note.Line + 4.5, note.Staff);
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
    if (!notesInDiv[0].Tuple) {
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
      tupleCount = notesInDiv[0].TupleDetails.Count;
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
        console.log("note: ", note);
        console.log(nextDivNotes);
        return;
      }
      const nextNote = tiedTo;
      const x1 = div.Bounds.x + noteXBuffer + camera.x + 3;
      const y1 =
        msr.GetNotePositionOnLine(note.Line, note.Staff) + camera.y - 4;
      const x2 = divs[i + 1].Bounds.x + noteXBuffer + camera.x + 3;
      const y2 =
        msr.GetNotePositionOnLine(nextNote.Line, note.Staff) + camera.y;
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
  const numOfAcc = divNotes.filter((n) => n.Accidental !== 0).length;
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
    const ledgerY = msr.GetNotePositionOnLine(l, staff) + camera.y + 2.5;
    const path = `m ${ledgerX} ${ledgerY}` + ledgerString;
    context.fill(new Path2D(path));
  }
  for (let h = midLine + 6; h <= lowestLine.Line; h += 2) {
    const ledgerY = msr.GetNotePositionOnLine(h, staff) + camera.y + 2.5;
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
