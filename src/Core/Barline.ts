import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
import {
  GetStaffActualMidLine,
  GetStaffHeightUntil,
  GetStaffMiddleLine,
  Staff,
} from "./Staff.js";

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
    this.SelType = SelectableTypes.Beam;
    this.Bounds = new Bounds(0, 0, 0, 0);
    this.Editable = false;
    this.Position = pos;
    this.Type = type;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }
}

// Rendering barlines requires us to consider the end and start of two measures
function RenderBarline(
  renderProps: RenderProperties,
  endMeasure: Measure,
  beginMeasure: Measure,
  cam: Camera,
): void {
  if (!endMeasure) {
    switch (beginMeasure.Barlines[0].Type) {
      case BarlineType.SINGLE:
        RenderStandardBarline(
          renderProps,
          beginMeasure,
          cam,
          beginMeasure.Barlines[0].Position,
        );
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
    switch (endMeasure.Barlines[1].Type) {
      case BarlineType.SINGLE:
        RenderStandardBarline(
          renderProps,
          endMeasure,
          cam,
          endMeasure.Barlines[1].Position,
        );
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
    return;
  }
  if (
    endMeasure.Barlines[1].Type == BarlineType.SINGLE &&
    beginMeasure.Barlines[0].Type == BarlineType.SINGLE
  ) {
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

  const line = `M${xStart + cam.x - 5}
      ${yStart + cam.y} h
      1 v ${barlineHeight} h -1 Z`;

  const thickLine = `M${xStart + cam.x}
      ${yStart + cam.y} h
      4 v ${barlineHeight + 1} h -4 Z`;

  renderProps.context.fill(new Path2D(line));
  renderProps.context.fill(new Path2D(thickLine));
}

export { Barline, BarlineType, BarlinePos, RenderBarline };
