import { Measure } from "../Core/Measure.js";
import {
  GetStaffHeightUntil,
  GetStaffMiddleLine,
  Staff,
} from "../Core/Staff.js";
import { RenderProperties } from "../Types/RenderProperties.js";

function RenderStaff(
  renderProps: RenderProperties,
  msr: Measure,
  staff: Staff,
): void {
  // These should be defined somewhere else
  const { context, camera, theme } = renderProps;
  const line_space = 10;
  const line_width = 1;

  const staves = msr.Staves;
  const yStart = msr.Bounds.y + GetStaffHeightUntil(staves, staff.Num);
  const staffMidLine = GetStaffMiddleLine(staves, staff.Num);

  // Render Staff Lines
  for (let l = 0; l < 5; l++) {
    const lineString = `M${msr.Bounds.x + camera.x} 
    ${yStart + 5 * staffMidLine - line_space * 2 + line_space * l + camera.y} h 
    ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;
    context.fillStyle = theme.LineColour;
    const linePath = new Path2D(lineString);
    context.fill(linePath);
  }
}

export { RenderStaff };
