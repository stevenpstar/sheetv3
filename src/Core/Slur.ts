import { RenderProperties } from "../Types/RenderProperties.js";
import { Note } from "./Note.js";

class Slur {
  NoteStart: Note;
  NoteEnd: Note;
  constructor() {}

  render(renderProps: RenderProperties) {
    const x1 = this.NoteStart.Bounds.x + renderProps.camera.x;
    const y1 = this.NoteStart.Bounds.y + renderProps.camera.x;
    const x2 = this.NoteEnd.Bounds.x + renderProps.camera.x;
    const y2 = this.NoteEnd.Bounds.y + renderProps.camera.x;
    const distanceX = x2 - x1;
    const distanceY = Math.abs(y2 - y1);

    let context = renderProps.context;
  //  context.beginPath();
  //  context.moveTo(x1, y1);
  //  context.bezierCurveTo(x1 + distanceX / 2.0,
  //                        y1 - 50,
  //                        x1 + distanceX / 2.0,
  //                        y1 - 50,
  //                        x2, y2);
  //  context.stroke();
    //  const curveHighPoint = -20;
  //  const curveLowPoint = -17;
  //  const slurPath = `m ${x1} ${y1} 
  //    q ${distanceX / 2} ${curveHighPoint} ${distanceX} ${distanceY} 
  //    q -${distanceX / 2} ${curveLowPoint} -${distanceX} -${distanceY} z`;
  //  renderProps.context.fill(new Path2D(slurPath));
  }
}

function RenderTie(renderProps: RenderProperties, start: Note, end: Note): void {
  let context = renderProps.context;
//  let camera = renderProps.camera;
  let x1 = start.Bounds.x + renderProps.camera.x + 4;
  let y1 = start.Bounds.y + renderProps.camera.y - 6;
  let x2 = end.Bounds.x + renderProps.camera.x + 4;
  let y2 = end.Bounds.y + renderProps.camera.y - 6;
  const distanceX = x2 - x1;
 // const distanceY = Math.abs(y2 - y1);
  const ctrlXBuffer = distanceX / 4;
  let ctrlYBuffer = distanceX / 6;
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  let crescentAmount = 3;
  context.setLineDash([0, 0]);
  if (start.Line <= 15) {
    ctrlYBuffer = -ctrlYBuffer;
  } else {
    x1 = start.Bounds.x + renderProps.camera.x + 8;
    y1 = start.Bounds.y + renderProps.camera.y + 10;
    x2 = end.Bounds.x + renderProps.camera.x + 8;
    y2 = end.Bounds.y + renderProps.camera.y + 10;
  }
  for (let i = 0; i < crescentAmount; ++i) {
  context.moveTo(x1, y1);
  context.bezierCurveTo(x1 + (distanceX / 2.0) - ctrlXBuffer,
                        y1 + ctrlYBuffer - i,
                        x1 + (distanceX / 2.0) + ctrlXBuffer,
                        y1 + ctrlYBuffer - i,
                        x2, y2);
  }
  context.stroke();
}
function RenderSlur(renderProps: RenderProperties, start: Note, end: Note): void {
  let context = renderProps.context;
  let camera = renderProps.camera;
  const x1 = start.Bounds.x + renderProps.camera.x + 4;
  const y1 = start.Bounds.y + renderProps.camera.y - 6;
  const x2 = end.Bounds.x + renderProps.camera.x + 4;
  const y2 = end.Bounds.y + renderProps.camera.y - 6;
  const distanceX = x2 - x1;
  const distanceY = Math.abs(y2 - y1);
  const ctrlXBuffer = distanceX / 4;
  const ctrlYBuffer = distanceX / 6;
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  let crescentAmount = 4;
  context.setLineDash([0, 0]);
  for (let i = 0; i < crescentAmount; ++i) {
  context.moveTo(x1, y1);
  context.bezierCurveTo(x1 + (distanceX / 2.0) - ctrlXBuffer,
                        y1 - ctrlYBuffer - i,
                        x1 + (distanceX / 2.0) + ctrlXBuffer,
                        y1 - ctrlYBuffer - i,
                        x2, y2);
  }
  context.stroke();
}

export { Slur, RenderSlur, RenderTie };
