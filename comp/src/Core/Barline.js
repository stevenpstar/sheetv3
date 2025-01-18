import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
import { GetStaffHeightUntil, GetStaffMiddleLine, } from "./Staff.js";
var BarlineType;
(function (BarlineType) {
    BarlineType[BarlineType["SINGLE"] = 0] = "SINGLE";
    BarlineType[BarlineType["DOUBLE"] = 1] = "DOUBLE";
    BarlineType[BarlineType["END"] = 2] = "END";
    BarlineType[BarlineType["REPEAT_BEGIN"] = 3] = "REPEAT_BEGIN";
    BarlineType[BarlineType["REPEAT_END"] = 4] = "REPEAT_END";
})(BarlineType || (BarlineType = {}));
var BarlinePos;
(function (BarlinePos) {
    BarlinePos[BarlinePos["START"] = 0] = "START";
    BarlinePos[BarlinePos["END"] = 1] = "END";
})(BarlinePos || (BarlinePos = {}));
class Barline {
    constructor(pos, type) {
        this.ID = 0; // no id for now
        this.Selected = false;
        this.SelType = SelectableTypes.Beam;
        this.Bounds = new Bounds(0, 0, 0, 0);
        this.Editable = false;
        this.Position = pos;
        this.Type = type;
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
}
// Rendering barlines requires us to consider the end and start of two measures
function RenderBarline(renderProps, endMeasure, beginMeasure, cam) {
    if (!endMeasure) {
        switch (beginMeasure.Barlines[0].Type) {
            case BarlineType.SINGLE:
                RenderStandardBarline(renderProps, beginMeasure, cam, beginMeasure.Barlines[0].Position);
                break;
            default:
                RenderStandardBarline(renderProps, beginMeasure, cam, beginMeasure.Barlines[0].Position);
        }
        return;
    }
    else if (!beginMeasure) {
        switch (endMeasure.Barlines[1].Type) {
            case BarlineType.SINGLE:
                RenderStandardBarline(renderProps, endMeasure, cam, endMeasure.Barlines[1].Position);
                break;
            case BarlineType.END:
                RenderFinalBarline(renderProps, endMeasure, cam);
                break;
            default:
                RenderStandardBarline(renderProps, endMeasure, cam, endMeasure.Barlines[1].Position);
        }
        return;
    }
    if (endMeasure.Barlines[1].Type == BarlineType.SINGLE &&
        beginMeasure.Barlines[0].Type == BarlineType.SINGLE) {
        RenderStandardBarline(renderProps, beginMeasure, cam, beginMeasure.Barlines[0].Position);
    }
}
function RenderStandardBarline(renderProps, measure, cam, pos) {
    const lineHeight = 5;
    const midLine = GetStaffMiddleLine(measure.Staves, 0);
    const yStart = measure.Bounds.y +
        GetStaffHeightUntil(measure.Staves, 0) +
        midLine * lineHeight -
        4 * lineHeight;
    const yEnd = measure.Bounds.y +
        GetStaffHeightUntil(measure.Staves, measure.Staves.length - 1) +
        midLine * lineHeight +
        4 * lineHeight;
    const barlineHeight = yEnd - yStart;
    var xStart = measure.Bounds.x;
    if (pos == BarlinePos.END) {
        xStart += measure.GetBoundsWithOffset().width;
    }
    const line = `M${xStart + cam.x}
      ${yStart + cam.y} h
      1 v ${barlineHeight} h -1 Z`;
    renderProps.context.fill(new Path2D(line));
}
function RenderFinalBarline(renderProps, measure, cam) {
    const lineHeight = 5;
    const midLine = GetStaffMiddleLine(measure.Staves, 0);
    const yStart = measure.Bounds.y +
        GetStaffHeightUntil(measure.Staves, 0) +
        midLine * lineHeight -
        4 * lineHeight;
    const yEnd = measure.Bounds.y +
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
