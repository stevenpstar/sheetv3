import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
import { GetStaffHeightUntil, GetStaffMiddleLine, Staff } from "./Staff.js";

enum BarlineType {
  SINGLE,
  DOUBLE,
  END,
  REPEAT_BEGIN,
  REPEAT_END,
}

enum BarlinePos {
  START,
  END,
}

class Barline implements ISelectable {
  ID: number;
  Selected: boolean;
  SelType: SelectableTypes;
  Bounds: Bounds;
  Editable: boolean;
  Position: BarlinePos;
  Type: BarlineType;

  constructor(pos: BarlinePos, type: BarlineType) {
    this.ID = 0; // no id for now
    this.Selected = false;
    this.SelType = SelectableTypes.Barline;
    this.Bounds = new Bounds(0, 0, 0, 0);
    this.Editable = false;
    this.Position = pos;
    this.Type = type;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }
}

function RenderBounds(renderProps: RenderProperties, barline: Barline): void {
  renderProps.context.strokeStyle = "green";
  renderProps.context.strokeRect(
    barline.Bounds.x + renderProps.camera.x,
    barline.Bounds.y + renderProps.camera.y,
    barline.Bounds.width,
    barline.Bounds.height,
  );
}

// Rendering barlines requires us to consider the end and start of two measures
function RenderBarline(
  renderProps: RenderProperties,
  endMeasure: Measure,
  beginMeasure: Measure,
  cam: Camera,
): void {
  if (!endMeasure) {
    if (beginMeasure.Barlines[0].Selected) {
      renderProps.context.fillStyle = "blue";
    }
    switch (beginMeasure.Barlines[0].Type) {
      case BarlineType.SINGLE:
        RenderStandardBarline(
          renderProps,
          beginMeasure,
          cam,
          beginMeasure.Barlines[0].Position,
        );
        break;
      case BarlineType.REPEAT_END:
        RenderRepeatEnd(renderProps, beginMeasure, cam);
        break;
      default:
        RenderStandardBarline(
          renderProps,
          beginMeasure,
          cam,
          beginMeasure.Barlines[0].Position,
        );
    }
    return;
  } else if (!beginMeasure) {
    if (endMeasure.Barlines[1].Selected) {
      renderProps.context.fillStyle = "blue";
    }

    switch (endMeasure.Barlines[1].Type) {
      case BarlineType.SINGLE:
        RenderStandardBarline(
          renderProps,
          endMeasure,
          cam,
          endMeasure.Barlines[1].Position,
        );
        break;
      case BarlineType.REPEAT_END:
        RenderRepeatEnd(renderProps, endMeasure, cam);
        break;
      case BarlineType.END:
        RenderFinalBarline(renderProps, endMeasure, cam);
        break;
      default:
        RenderStandardBarline(
          renderProps,
          endMeasure,
          cam,
          endMeasure.Barlines[1].Position,
        );
    }

    renderProps.context.fillStyle = "black";
    return;
  }
  if (
    endMeasure.Barlines[1].Type == BarlineType.SINGLE &&
    beginMeasure.Barlines[0].Type == BarlineType.SINGLE
  ) {
    if (endMeasure.Barlines[1].Selected || beginMeasure.Barlines[0].Selected) {
      renderProps.context.fillStyle = "blue";
    } else {
      renderProps.context.fillStyle = "black";
    }
    RenderStandardBarline(
      renderProps,
      beginMeasure,
      cam,
      beginMeasure.Barlines[0].Position,
    );
  }
}

function RenderStandardBarline(
  renderProps: RenderProperties,
  measure: Measure,
  cam: Camera,
  pos: BarlinePos,
): void {
  const lineHeight = 5;
  const midLine = GetStaffMiddleLine(measure.Staves, 0);

  const yStart =
    measure.Bounds.y +
    GetStaffHeightUntil(measure.Staves, 0) +
    midLine * lineHeight -
    4 * lineHeight;

  const yEnd =
    measure.Bounds.y +
    GetStaffHeightUntil(measure.Staves, measure.Staves.length - 1) +
    midLine * lineHeight +
    4 * lineHeight;

  const barlineHeight = yEnd - yStart;

  var xStart = measure.Bounds.x;
  if (pos == BarlinePos.END) {
    xStart += measure.GetBoundsWithOffset().width;
  }

  xStart = Math.floor(xStart);

  const line = `M${xStart + cam.x}
      ${yStart + cam.y} h
      1 v ${barlineHeight} h -1 Z`;

  renderProps.context.fill(new Path2D(line));
}

function RenderFinalBarline(
  renderProps: RenderProperties,
  measure: Measure,
  cam: Camera,
): void {
  const lineHeight = 5;
  const midLine = GetStaffMiddleLine(measure.Staves, 0);

  const yStart =
    measure.Bounds.y +
    GetStaffHeightUntil(measure.Staves, 0) +
    midLine * lineHeight -
    4 * lineHeight;

  const yEnd =
    measure.Bounds.y +
    GetStaffHeightUntil(measure.Staves, measure.Staves.length - 1) +
    midLine * lineHeight +
    4 * lineHeight;

  const barlineHeight = yEnd - yStart;

  var xStart = measure.Bounds.x + measure.GetBoundsWithOffset().width;

  const line = `M${xStart + cam.x - 9}
      ${yStart + cam.y} h
      1 v ${barlineHeight} h -1 Z`;

  const thickLine = `M${xStart + cam.x - 4}
      ${yStart + cam.y} h
      4 v ${barlineHeight + 1} h -4 Z`;

  renderProps.context.fill(new Path2D(line));
  renderProps.context.fill(new Path2D(thickLine));
}

function RenderRepeatEnd(
  renderProps: RenderProperties,
  measure: Measure,
  cam: Camera,
): void {
  const lineHeight = 5;
  const midLine = GetStaffMiddleLine(measure.Staves, 0);

  const yStart =
    measure.Bounds.y +
    GetStaffHeightUntil(measure.Staves, 0) +
    midLine * lineHeight -
    4 * lineHeight;

  const yEnd =
    measure.Bounds.y +
    GetStaffHeightUntil(measure.Staves, measure.Staves.length - 1) +
    midLine * lineHeight +
    4 * lineHeight;

  const barlineHeight = yEnd - yStart;

  var xStart = measure.Bounds.x + measure.GetBoundsWithOffset().width;

  const line = `M${xStart + cam.x - 9}
      ${yStart + cam.y} h
      1 v ${barlineHeight} h -1 Z`;

  const thickLine = `M${xStart + cam.x - 4}
      ${yStart + cam.y} h
      4 v ${barlineHeight + 1} h -4 Z`;

  const circle = "a1.485 1.485 90 10-2.97 0 1.485 1.485 90 102.97 0";

  renderProps.context.fill(new Path2D(line));
  renderProps.context.fill(new Path2D(thickLine));

  measure.Staves.forEach((s: Staff) => {
    const midLine = GetStaffMiddleLine(measure.Staves, s.Num);
    const midLinePosition =
      GetStaffHeightUntil(measure.Staves, s.Num) +
      measure.Bounds.y +
      midLine * lineHeight;

    const cPath1 =
      `m${xStart - 12 + renderProps.camera.x} ${midLinePosition + 0.5 + renderProps.camera.y - 5}` +
      circle;
    const cPath2 =
      `m${xStart - 12 + renderProps.camera.x} ${midLinePosition + 0.5 + renderProps.camera.y + 5}` +
      circle;

    renderProps.context.fill(new Path2D(cPath1));
    renderProps.context.fill(new Path2D(cPath2));
  });
}

function PositionMatch(pos: BarlinePos, type: BarlineType): boolean {
  let match: boolean = true;
  switch (type) {
    case BarlineType.SINGLE:
    case BarlineType.DOUBLE:
      break;
    case BarlineType.END:
    case BarlineType.REPEAT_END:
      match = pos === BarlinePos.END;
      break;
    case BarlineType.REPEAT_BEGIN:
      match = pos === BarlinePos.START;
      break;
    default:
      break;
  }
  return match;
}

export { Barline, BarlineType, BarlinePos, RenderBarline, PositionMatch };
