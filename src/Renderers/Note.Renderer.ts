import { Beam, DetermineBeamDirection } from "../Core/Beam.js";
import { Camera } from "../Core/Camera.js";
import { Division, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { Stem } from "../Core/Stem.js";
import { NoteValues } from "../Core/Values.js";
import { Bounds } from "../Types/Bounds.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { RenderAccidental } from "./Accidentals.Renderer.js";
import { NoteHeads, RenderSymbol } from "./MusicFont.Renderer.js";

enum StemDirection {
  Up,
  Down
};

enum BeamDirection {
  UpMax,
  UpDynamic,
  DownMax,
  DownDynamic,
  Flat
}

const noteHead = 'a6.7692 4.5128-33 1011.3543-7.3735 6.7692 4.5128-33 10-11.3543 7.3735'
const minimHead = 'm3.4871-7.6c-2.8881 1.8199-4.4271 5.1146-3.4804 7.593 1.0097 2.6437 4.4796 3.3897 7.7452 1.6654 3.2656-1.7244 5.0963-5.2694 4.0866-7.9131-1.0097-2.6437-4.4796-3.3897-7.7452-1.6654-.204.1077-.4136.1988-.6062.3201zm.9439 2.2422c.2051-.1244.4129-.218.6304-.3328 2.7838-1.47 5.4723-1.5391 6.0012-.1543.5289 1.3847-1.3011 3.7016-4.0849 5.1715-2.7838 1.47-5.4723 1.5391-6.0012.1543-.4876-1.2766 1.0334-3.3716 3.4545-4.8387z';
const semibreveHead = 'm0 0c-2.179-.517-3.7343-1.6332-4.4105-2.9419-.318-.592-.5063-1.2374-.5487-1.9093-.0007-.0102-.0006-.0193-.0007-.029-.0128-.7505.1884-1.4593.8037-2.2597.5643-.7381 1.4281-1.3704 2.5451-1.856 1.181-.5156 2.5808-.7711 4.0893-.7245.3068.0095.6093.031.9064.0639.323.033.6396.0795.9486.1387.6004.0987 1.172.2482 1.7053.4418.5244.1828 1.0055.4021 1.4786.6854.4184.2506.7446.4966 1.0648.7943.1604.1552.3095.3169.4462.4843.1078.1364.2081.2756.3003.4172.1023.1647.1927.3226.2769.5013.276.5854.4212 1.2499.4362 1.8122.0004 1.1138-.5653 2.1155-1.5114 2.9056-.6972.6075-1.5323 1.061-2.6135 1.4-.8055.2526-1.6452.389-2.4791.4131-.2762.014-.4894.0039-.7702.0012-.9463-.0305-1.8431-.1476-2.6674-.3388zm4.6894-1.4125c.1447-.112.2444-.2154.3968-.3951.2638-.3111.4388-.6218.5482-1.0313.0123-.0401.0234-.0804.0333-.1209.0239-.0946.0412-.1898.0523-.2852.0225-.3115.0052-.678-.0879-1.0312-.0237-.1025-.0463-.1983-.0684-.2898-.0952-.4243-.1871-.7491-.343-1.1885-.0092-.0247-.0211-.0619-.0306-.0867-.3292-.8566-.6698-1.4414-1.1513-1.8769-.6564-.6199-1.6233-.9665-2.6554-.65-.4133.1268-.7576.3414-.9859.5741-.133.1331-.2626.2983-.3633.4591-.2553.4107-.3782.722-.4192 1.1595-.009.1543-.0192.3419 0 .5216.0318.2014.0512.3701.0921.5643.1142.586.2765 1.1208.4055 1.5224.0015.0046.0027.0092.0041.0138.0616.206.1359.4023.2209.5881.0699.1605.1565.3438.24.4882.0562.1014.1153.2001.1764.2934.1048.1612.2045.2734.3178.4019.1792.197.3674.3563.5621.4824.3055.1864.621.2991.9378.3535.5811.1199 1.23.0175 1.572-.1447.2268-.1075.3484-.1694.5455-.322z';

const crotchetRest = 'c-.2863.1212-.4577.5392-.326.8318.0397.0418.4556.5392.8736 1.0868.9551 1.0764 1.1182 1.3313 1.3292 1.8288.8339 1.7054.3762 3.877-1.0847 5.2501-.1233.163-.6625.6186-1.1683.9948-1.4525 1.2498-2.1214 1.9604-2.368 2.5874-.0899.1651-.0899.3281-.0899.581-.0397.5789 0 .6291 1.7159 2.6209 2.3262 2.7922 3.9919 4.7506 4.1215 4.8739l.1233.1212-.163-.0815c-2.2948-.9551-4.8739-1.4128-5.7475-.9948-.2947.1212-.4661.2926-.5873.5789-.3365.7106-.2466 1.7556.2529 3.2897.4556 1.3794 1.371 3.2082 2.2844 4.5813.3762.5873 1.0868 1.5006 1.1683 1.5424.1233.1233.2947.0815.4159 0 .1233-.163.1233-.2947-.1212-.5789-.8736-1.2498-1.2895-3.8372-.7921-5.2104.2027-.6186.4577-.9551.9133-1.1662 1.208-.5392 3.879.1296 4.9972 1.2477.0815.0836.2529.255.3344.2947.2947.1233.7106-.0397.8339-.3344.1714-.2947.0815-.4974-.2947-.9551-.7022-.8339-2.8257-3.3315-3.1183-3.7077-.7524-.8736-1.0868-1.7054-1.1683-2.7504-.0397-1.3313.4974-2.7421 1.5027-3.6659.1212-.163.6604-.6207 1.16-.9948 1.5424-1.2916 2.1715-2.0001 2.416-2.671.1714-.5392.0899-1.0366-.2863-1.4943-.1296-.1212-1.5842-1.9186-3.2897-3.9585-2.3345-2.7442-3.1684-3.7474-3.2897-3.7892-.1714-.0397-.3762-.0397-.5476.0418z'
const quaverRest = 'c-.884.1666-1.5606.7769-1.8666 1.6201-.0663.272-.0663.3383-.0663.7106 0 .5117.0323.7837.272 1.1883.3383.6783 1.0489 1.2223 1.8598 1.4212.85.2397 2.2712.034 3.8981-.5049l.4046-.1394-1.9992 5.525-1.9652 5.5182c0 0 .0663.034.1734.1071.1989.1326.5372.2329.7769.2329.4046 0 .9163-.2329.9826-.4386 0-.0663.9486-3.2878 2.0978-7.1128l2.0315-7.0125-.0663-.0986c-.1649-.2057-.5032-.272-.7106-.1071-.0663.0663-.1717.2057-.238.306-.306.5117-1.0829 1.4212-1.4875 1.7595-.3723.306-.578.3383-.9163.2057-.306-.1666-.4063-.3383-.612-1.2546-.1989-.9095-.4369-1.3226-.9486-1.6609-.4726-.3043-1.0829-.4046-1.6201-.2652z';
const semiQuaverRest = 'c-.6228.1176-1.1016.5484-1.3116 1.1436-.0516.192-.0516.2388-.0516.5016 0 .3612.0228.5532.192.8388.2388.4788.7404.8628 1.3176 1.0032.5952.1692 1.5504.0468 2.7-.3324.168-.0708.3084-.1224.3084-.0984 0 .0276-1.0728 3.516-1.1196 3.6372-.1224.3096-.5304.882-.8868 1.242-.3324.3336-.5016.408-.7632.2868-.216-.1176-.2868-.24-.432-.8868-.1212-.4776-.2148-.7404-.4068-.9276-.5016-.5532-1.3644-.624-2.0304-.192-.3144.2148-.5532.5484-.6936.9096-.0516.1872-.0516.2388-.0516.5004 0 .3564.0276.5496.192.8352.2388.4776.7404.8628 1.3176 1.0032.2628.0744.9324.0744 1.3872 0 .3792-.0708.834-.1884 1.2888-.3336.192-.0696.3612-.1164.3612-.0936 0 0-2.3436 7.6272-2.3904 7.7436 0 .024.1872.1692.3792.216.192.0756.3852.0756.5772 0 .1872-.0468.3792-.1644.3792-.2388.024-.024.9804-3.6324 2.1516-8.0112l2.1288-7.9596-.0468-.0696c-.0948-.1452-.2868-.1692-.4548-.0984-.0948.0468-.0948.0468-.3804.4776-.2388.384-.576.7872-.768.9792-.2628.216-.4032.2628-.6432.1692-.2148-.1176-.2904-.2388-.4308-.8856-.1452-.642-.3144-.9336-.6708-1.1724-.3324-.2148-.7632-.2856-1.1484-.1872z';
const demiSemiQuaverRest = 'm0 0c-.516.101-.918.461-1.094.957-.043.16-.043.199-.043.418 0 .218 0 .3.043.418.137.441.418.777.856.976.297.16.437.18.855.18.52 0 .957-.078 1.657-.297.179-.063.316-.102.316-.102.019 0-.16.7-.399 1.536-.296 1.175-.417 1.554-.457 1.671-.16.301-.5.758-.718.957-.2.18-.317.219-.516.141-.18-.098-.242-.199-.359-.738-.102-.399-.18-.617-.34-.778-.418-.457-1.137-.515-1.692-.156-.261.176-.46.457-.578.754-.043.16-.043.199-.043.418 0 .301.024.461.161.699.199.399.617.719 1.097.836.219.063.778.063 1.156 0 .317-.058.696-.16 1.075-.277.179-.059.32-.102.32-.102 0 .02-.797 3.051-.84 3.11-.156.34-.476.758-.715.996-.258.258-.398.301-.617.219-.18-.098-.242-.2-.359-.739-.102-.398-.18-.617-.34-.773-.418-.461-1.137-.52-1.692-.16-.261.179-.46.457-.578.758-.043.156-.043.199-.043.417 0 .219 0 .297.043.418.137.438.418.778.856.977.32.16.437.18.875.18.32 0 .422 0 .679-.043.36-.059.739-.176 1.157-.297l.258-.102v.063c-.02.078-1.696 6.375-1.715 6.414-.02.082.34.238.558.238.219 0 .539-.137.559-.238.019-.02.976-4.145 2.172-9.164 2.133-9.086 2.133-9.106 2.094-9.168-.063-.078-.161-.117-.282-.117-.14.019-.199.078-.34.316-.277.481-.597.898-.773 1.039-.121.078-.223.078-.379.02-.18-.102-.242-.2-.359-.739-.121-.539-.262-.777-.559-.976-.277-.18-.637-.238-.957-.16z';

const quaverFlag = 'c11.7122 2.9669 6.3069 13.252 5.2534 16.885 9.622-13.142-5.1221-18.5026-5.2534-26.47z';
const quaverFlagInverted = 'c10.7362-2.7197 5.7813-12.1477 4.8156-15.4779 8.8202 12.0469-4.6953 16.9607-4.8156 24.2642z';
const noteXBuffer = 9;
// TODO: This is because we are using temporary SVG files for rendering, will need to
// create custom SVGs so our note heads are consistent (but we can do that much later in dev)
const mHeadXOffset = 3.4871;
const mHeadYOffset = -7.6;

function RenderNote(note: Note,
                    renderProps: RenderProperties,
                    Bounds: Bounds,
                    selected: boolean,
                    flipNote: boolean,
                    stemDir: StemDirection,
                    colour: string = "black"): void {
  
  // TODO: This will be determined by key signature
  if (note.Accidental !== 0) { 
    RenderAccidental(renderProps, note, note.Accidental); 
  }
  let { x, y, width, height } = Bounds;
  const { canvas, context, camera } = renderProps;
  let flipNoteOffset = flipNote ? 
    stemDir === StemDirection.Up ? 11 : -11 : 0;
  let posString = `m ${x + camera.x} ${y + 7.5 - 1 + camera.y}`;
  // TODO: Move this offset somewhere else to be constant
  y = y + 3;
  //
  colour = selected ? "blue" : "black";
  let noteString = '';
  switch (note.Duration) {
    case 0.125:
    case 0.25:
   //   noteString = posString + noteHead;
      RenderSymbol(
        renderProps,
        NoteHeads.crotchet,
        x, y, colour);
      break;
    case 0.5:
      RenderSymbol(
        renderProps,
        NoteHeads.minim,
        x, y, colour);
      break;
    case 1:
      RenderSymbol(
        renderProps,
        NoteHeads.whole,
        x, y, colour);
      break;
    default:
      RenderSymbol(
        renderProps,
        NoteHeads.crotchet,
        x, y, colour);
  }
  context.fillStyle = "black";
  if (selected) {
    context.fillStyle = "blue";
  }
 // context.fill(new Path2D(noteString));


  let debug = false;
  if (debug) {
    context.fillStyle = "rgba(200, 0, 0, 0.5)";
    context.fillRect(x + camera.x, y + camera.y - 5, width, height);
    context.fillStyle = "black";
  }
}

function RenderDots(
  renderProps: RenderProperties,
  note: Note,
  dotXStart: number,
  ): void {

  const { canvas, context, camera } = renderProps;

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
  const circle = 'a1.485 1.485 90 10-2.97 0 1.485 1.485 90 102.97 0';
  for (let d = 0; d < dotCount; d++) {
    let lineY = note.Line * 5;
    if (note.Line % 2 !== 0) {
      lineY = (note.Line - 1) * 5;
    }
    const cpath = `m${dotXStart + camera.x + 17 + (d * 5)} 
      ${lineY + camera.y}` + circle;
    context.fill(new Path2D(cpath));
  }

}

function RenderRest(
  ctx: CanvasRenderingContext2D,
  div: Division,
  cam: Camera,
  note: Note,
  msr: Measure): void {

    let x = div.Bounds.x + cam.x + noteXBuffer;
//    let y = div.Bounds.y + cam.y + ((note.Line - 3 - msr.SALineTop) * 5);
    let y = Measure.GetNotePositionOnLine(msr, note.Line - 3) + cam.y;
    let path = `m${x} ${y}`;
    ctx.fillStyle = note.Selected ? "blue" : "black";

    if (div.Duration === 0.3125) {
      y += 7;
      path = `m ${x} ${y}` + demiSemiQuaverRest;
      ctx.fill(new Path2D(path));
    }
    else if (div.Duration === 0.0625) {
      y += 9;
      path = `m ${x} ${y}` + semiQuaverRest;
      ctx.fill(new Path2D(path));
    }
    else if (div.Duration > 0.0625 && div.Duration <= 0.125) {
      y = y + 10;
      path = `m${x} ${y}` + quaverRest;
      ctx.fill(new Path2D(path));
    }
    else if (div.Duration === 0.25) {
      path = path + crotchetRest;
      ctx.fill(new Path2D(path));
    }
    else if (div.Duration === 0.5) {
      y = Measure.GetNotePositionOnLine(msr, note.Line) - 6 + cam.y;
      ctx.fillRect(x, y, 14, 6);
    }
    else if (div.Duration === 1) {
        y = Measure.GetNotePositionOnLine(msr, note.Line - 2) + cam.y;
        x = div.Bounds.x + cam.x + (div.Bounds.width / 2) - 7;
        ctx.fillRect(x, y, 14, 6);
    }

//    switch (div.Duration) {
//      case 0.03125:
//        y += 7;
//        path = `m ${x} ${y}` + demiSemiQuaverRest;
//        ctx.fill(new Path2D(path));
//        break;
//      case 0.0625:
//        y += 9;
//        path = `m ${x} ${y}` + semiQuaverRest;
//        ctx.fill(new Path2D(path));
//        break;
//      case 0.125:
//        y = y + 10;
//        path = `m${x} ${y}` + quaverRest;
//        ctx.fill(new Path2D(path));
//        break;
//      case 0.25:
//        path = path + crotchetRest;
//        ctx.fill(new Path2D(path));
//        break;
//      case 0.5:
////        y = div.Bounds.y + cam.y + ((note.Line - msr.SALineTop) * 5) - 6;
//        y = Measure.GetNotePositionOnLine(msr, note.Line) - 6 + cam.y;
//        ctx.fillRect(x, y, 14, 6);
//        break;
//      case 1:
//        //y = div.Bounds.y + cam.y + ((note.Line - 2 - msr.SALineTop) * 5);
//        y = Measure.GetNotePositionOnLine(msr, note.Line - 2) + cam.y;
//        x = div.Bounds.x + cam.x + (div.Bounds.width / 2) - 7;
//        ctx.fillRect(x, y, 14, 6);
//        break;
//      default:
//        path = path + crotchetRest;
//        ctx.fill(new Path2D(path));
//    }
  }

function RenderTupleAnnotation(
  renderProps: RenderProperties,
  coords: {x1: number, y1: number, x2: number, y2: number },
  count: string): void {
    const { canvas, context, camera } = renderProps;
    const width = coords.x2 - coords.x1;
    context.font = "14px serif";
    context.fillStyle = "black";
    context.fillRect(coords.x1 + camera.x, coords.y1 + camera.y, width, 2);
    context.fillText(count, coords.x1 + width / 2 - 7 + camera.x, coords.y1 - 5 + camera.y)
  }

function RenderTuples(
  renderProps: RenderProperties,
  divisions: Division[],
  notes: Note[],
  staff: number,
  msr: Measure): void {
    const { canvas, context, camera } = renderProps;
    const divs = divisions.filter(d => d.Staff === staff);
    divs.sort((a: Division, b: Division) => {
      return a.Beat - b.Beat;
    });
    let foundTuplet = false;
    let tupleX = 0;
    let tupleXEnd = 0;
    let tupleY = 0;
    let tupleCount = 0;

    divs.forEach((div: Division, i: number) => {
      const notesInDiv = notes.filter(n => n.Beat === div.Beat
                                      && n.Staff === staff);
      if (!notesInDiv[0].Tuple) {
        if (foundTuplet) {
          foundTuplet = false;
          RenderTupleAnnotation(
            renderProps,
            {x1: tupleX, y1: tupleY, x2: tupleXEnd, y2: tupleY},
            tupleCount.toString());
          tupleX = 0;
          tupleXEnd = 0;
          tupleY = 0;
          tupleCount = 0;
        }
        return;
      }
      if (!foundTuplet) {
        foundTuplet = true;
        tupleX = div.Bounds.x + 19;
        tupleCount = notesInDiv[0].TupleDetails.Count;
        tupleY = div.Bounds.y;
        tupleXEnd = div.Bounds.x + 19;
      } else {
        tupleXEnd = div.Bounds.x + 19;
      }
    });
  }

function RenderTies(renderProps: RenderProperties, divisions: Division[], notes: Note[], staff: number,msr: Measure): void {
  const { canvas, context, camera } = renderProps;
  const divs = divisions.filter(d => d.Staff === staff);
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
    const nextDivNotes = notes.filter((note: Note) => note.Beat === divs[i+1].Beat);
    nextDivNotes.sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    });

    divNotes.forEach(note => {
      if (!note.Tied || note.Rest || note.Tied && 
         note.Beat + note.Duration * msr.TimeSignature.bottom > note.TiedEnd) {
        return;
      }
      const tiedTo = nextDivNotes.find(n => 
        n.Line === note.Line &&
        n.Tied &&
        n.Beat <= n.TiedEnd);
      if (tiedTo === undefined) { console.error("No tied note found: ", note); return; }
      const nextNote = tiedTo;
      const x1 = div.Bounds.x + noteXBuffer + camera.x;
      const y1 = Measure.GetNotePositionOnLine(msr, note.Line) + camera.y;
      const x2 = divs[i+1].Bounds.x + noteXBuffer + camera.x;
      const y2 = Measure.GetNotePositionOnLine(msr, nextNote.Line) + camera.y
      const curveOffset = (note.Line < 15) ? -15 : 15;
      const curveStartOffset = (note.Line < 15) ? -8 : 8;
      //TODO: This is a temporary representation of a tie or slur
      context.fillStyle = "black";
      context.strokeStyle = "black";
      context.setLineDash([]);
      context.beginPath();
      context.moveTo(x1 + (noteXBuffer / 2), y1 + curveStartOffset);
      context.quadraticCurveTo((x1 + (noteXBuffer / 2)) + ((x2 - x1) / 2),
                               y1 + curveOffset,
                               x2 + (noteXBuffer / 2),
                               y2 + curveStartOffset);
      context.stroke();
    })
  })
}

// This will replace some parts of renderStemRevise eventually
function DetermineStemDirection(
  notes: Array<Note[]>,
  divisions: Division[],
  staff: number,
  measure: Measure): StemDirection {
    let dir = StemDirection.Up;
    // TODO: Not sure we will actually need this, seems like it shouldn't come
    // out of order in the first place.
    notes.sort((a: Note[], b: Note[]) => {
      return a[0].Beat - b[0].Beat;
    })

    let match = true;
    divisions.forEach((div: Division, i: number) => {
      if (div.Beat !== notes[i][0].Beat) {
        console.error("Index: ", i);
        console.error("Match failed on div: ", div);
        console.error("Match failed on beat: ", div.Beat);
        console.error("Match fail note: ", notes[i][0])
        match = false;
      }
    });

    if (!match) {
      console.error("Divisions and note array do not match");
      return;
    }

    const middleLine = staff === 0 ?
      measure.SALineMid : measure.SBLineMid;
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

function RenderStemRevise(
  renderProps: RenderProperties,
  notes: Array<Note[]>,
  divisions: Division[],
  staff: number,
  msr: Measure,
  beamDir: BeamDirection): void {

    // Check that divisions and note arrays match
    let match = true;
    divisions.forEach((div: Division, i: number) => {
      if (div.Beat !== notes[i][0].Beat) {
        match = false;
      }
    });

    if (!match) {
      console.error("Divisions and note array do not match");
      return;
    }

    const { canvas, context, camera } = renderProps;

    let highestLine: number = Number.MAX_SAFE_INTEGER;
    let lowestLine: number = Number.MIN_SAFE_INTEGER;

    let stemDirection = StemDirection.Up;  
    let stemToMidLine = false;
    //TODO: We are just going to see what happens with up
    let beamDirection = BeamDirection.UpMax;

    let stemEndY = 0; // end y position of stem

    let beamStartX = 0;
    let beamEndX = 0;

    const middleLine = staff === 0 ? Measure.GetMeasureMidLine(msr) : msr.GetGrandMeasureMidLine(); // TODO: Magiccccc (number should be removed)
    const yLineBuffer = staff === 0 ? 0 + msr.SALineTop : msr.SBLineTop;
    const staffTopLine = staff === 0 ? msr.SALineTop : msr.SBLineTop;
    const midStemThreshHold = 7;
    const lineHeight = 5;

    // Highest line has a lower number (lines start at 0 from the top 
    // of the measure and go down
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
    // TODO: Beam Direction

    if (middleLine - highestLine + staffTopLine < lowestLine - middleLine - staffTopLine) {
      stemDirection = StemDirection.Up;
      stemEndY = divisions[0].Bounds.y + ((highestLine - yLineBuffer) * lineHeight) - 35 + camera.y;
      if (highestLine - staffTopLine >= middleLine + midStemThreshHold) {
        stemToMidLine = true;
        stemEndY = divisions[0].Bounds.y + (middleLine * lineHeight) + camera.y;
      }

    } else {
      stemDirection = StemDirection.Down;
      stemEndY = divisions[0].Bounds.y + ((lowestLine - yLineBuffer) * lineHeight) + 35 + camera.y;
      if (lowestLine - staffTopLine <= middleLine - midStemThreshHold) {
        stemToMidLine = true;
        stemEndY = divisions[0].Bounds.y + (middleLine * lineHeight) + camera.y;
      }
    }

    // Render stems TODO: Move stem creation logic elsewhere
    divisions.forEach((div: Division, i: number) => {
      if (div.Duration === 1) { return; }
      const xBuffer = stemDirection === StemDirection.Up ? 10 : 0;
      const stemX = Math.floor(div.Bounds.x + xBuffer + camera.x + noteXBuffer);

      if (i === 0) {
        beamStartX = stemX;
      } else if (i === divisions.length - 1) {
        beamEndX = stemX;
        if (stemDirection === StemDirection.Down) {
          // beam end x position needs to account for the stem thickness
          beamEndX += 2;
        }
     }

      const sortedNotes = notes[i].sort((a: Note, b: Note) => {
        return a.Line - b.Line
      })

      const highLine = sortedNotes[0].Line;
      const lowLine = sortedNotes[sortedNotes.length-1].Line;
      const startPos = (stemDirection === StemDirection.Up) ? 
                      div.Bounds.y + ((lowLine - yLineBuffer) * lineHeight) + camera.y :
                      div.Bounds.y + ((highLine - yLineBuffer) * lineHeight) + camera.y;
//      const diff = stemEndY - startPos;
//      const newStem = new Stem(new Bounds(stemX, startPos, 2, diff));
//      newStem.Render(context, camera);
//      context.fillStyle = "black";
//      context.fillRect(stemX, (startPos),
//               2, diff);
      if (divisions.length === 1 && divisions[0].Duration < 0.25) {
        const flagLoop = GetFlagCount(div.Duration);
        if (stemDirection === StemDirection.Up) {
          for (let i = 0; i < flagLoop; i++ ) {
            let flagString = `m${stemX} ${stemEndY + (i * 8)}`;// + quaverFlag; // rough testing for flag
            context.fill(new Path2D(flagString + quaverFlag));
          }
        } else {
          for (let i = 0; i < flagLoop; i++ ) {
            let flagString = `m${stemX} ${stemEndY - (i * 8)}`;// + quaverFlag; // rough testing for flag
            context.fill(new Path2D(flagString + quaverFlagInverted));
          }
        }
      } else if (divisions.length > 1 && divisions[0].Duration < 0.25) {
        context.fillStyle = "black";
//        const nextDiv = divisions[i+1];
//        const beamLoop = GetFlagCount(nextDiv.Duration);
//        const yBuffer = (stemDirection === StemDirection.Up) ?
//          0 : -5;
//        const nextStemX = nextDiv.Bounds.x + camera.x + xBuffer + noteXBuffer; 
        // getting highest line in division 0
        let startY = 0;
        let endY = 0;
        let xB = stemDirection === StemDirection.Up ? 19 : 9;
        stemEndY = stemDirection === StemDirection.Up ?
          Measure.GetNotePositionOnLine(msr, highestLine) - 35 + camera.y :
          Measure.GetNotePositionOnLine(msr, lowestLine) + 35 + camera.y;
        if (beamDir === BeamDirection.UpMax) {
//          stemEndY = Measure.GetNotePositionOnLine(msr, highestLine) - 35 + camera.y;
          if (stemDirection === StemDirection.Up) {
            stemEndY -= i * (10 / (divisions.length - 1));
            endY = stemEndY - 10;
          } else {
            stemEndY += i * (10 / (divisions.length - 1));
            endY = stemEndY + 10;
          }
        } else if (beamDir === BeamDirection.DownMax) {
          if (stemDirection === StemDirection.Up) {
            stemEndY += i * (10 / (divisions.length - 1));
            endY = stemEndY + 10;
          } else {
            stemEndY -= i * (10 / (divisions.length - 1));
            endY = stemEndY - 10;
          }
        } else {
          endY = stemEndY;
        }
        if (i === 0) {
          const newBeam = new Beam(
            new Bounds(divisions[0].Bounds.x + 19,
                       stemEndY, 5, 5),
                       { x: divisions[0].Bounds.x + xB, y: stemEndY - camera.y},
                       { x: divisions[divisions.length-1].Bounds.x + xB, y: endY - camera.y});
          newBeam.Render(context, camera, GetFlagCount(divisions[0].Duration), stemDirection);
        }
//        for (let i = 0; i < beamLoop; i++) {
//          const beamY = stemDirection === StemDirection.Up ?
//            stemEndY + yBuffer + (7 * i) : stemEndY + yBuffer - (7 * i);
//          context.fillRect(stemX, beamY, nextStemX - stemX, 5); 
//        }
      }
      const diff = stemEndY - startPos;
      const newStem = new Stem(new Bounds(stemX, startPos, 2, diff));
      newStem.Render(context, camera);
    });
    //TODO: Actual prototype code here
}

// TODO: TEST FUNCTION
function TEST_GetBeamDirection(): BeamDirection {
  return BeamDirection.Flat;
}

function GetFlagCount(value: number): number {
  let count = 1;
  switch (value) {
    case 0.03125:
      count = 3;
      break;
    case 0.0625:
      count = 2;
      break;
    default:
  }
  return count;
}

function renderLedgerLines(
  notes: Note[],
  division: Division,
  renderProps: RenderProperties,
  staff: number,
  msr: Measure): void {

    const { canvas, context, camera } = renderProps;

    const ledgerX = (division.Bounds.x + noteXBuffer) - 6 + camera.x;

    //const ledgerString = `m ${x - 6} ${y - 5} h 22 v 2 h-20 v-2 Z`;
    const ledgerString = `h 22 v 2 h-20 v-2 Z`;

    const bdNotes = notes.filter((note: Note) => note.Beat === division.Beat &&
                                note.Staff === division.Staff);
    const yLineBuffer = staff === 0 ? Measure.GetMeasureMidLine(msr) : msr.GetGrandMeasureMidLine();
    const midLine = staff === 0 ? msr.SALineMid : msr.SBLineMid;
    if (bdNotes.length === 0) { return; }
    bdNotes.sort((a: Note, b: Note) => {
      return a.Line - b.Line;
    });

    const highestLine = bdNotes[0];
    const lowestLine = bdNotes[bdNotes.length-1];
    context.fillStyle = "black";

    for (let l=midLine - 6; l >= highestLine.Line; l -= 2) {
      const ledgerY = Measure.GetNotePositionOnLine(msr, l) + camera.y + 2.5;
      const path = `m ${ledgerX} ${ledgerY}` + ledgerString;
      context.fill(new Path2D(path));
    }
    for (let h=midLine + 6; h <= lowestLine.Line; h += 2) {
      const ledgerY = Measure.GetNotePositionOnLine(msr, h) + camera.y + 2.5;
      const path = `m ${ledgerX} ${ledgerY}` + ledgerString;
      context.fill(new Path2D(path));
    }
  }

export { 
  RenderNote,
  RenderRest,
  renderLedgerLines,
  RenderStemRevise, 
  RenderTies,
  DetermineStemDirection,
  RenderDots,
  StemDirection,
  BeamDirection,
  RenderTuples
};
