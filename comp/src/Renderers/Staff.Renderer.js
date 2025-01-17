import { GetStaffHeightUntil, GetStaffMiddleLine, } from "../Core/Staff.js";
function RenderStaff(renderProps, msr, staff) {
    // These should be defined somewhere else
    const { canvas, context, camera } = renderProps;
    const line_space = 10;
    const line_width = 1;
    const endsWidth = 2;
    const staves = msr.Staves;
    const yStart = msr.Bounds.y + GetStaffHeightUntil(staves, staff.Num);
    const staffMidLine = GetStaffMiddleLine(staves, staff.Num);
    const staffHeight = GetStaffHeightUntil(staves, staves.length - 2) +
        (GetStaffMiddleLine(staves, staves.length - 1) - 2) * 5;
    // Render Staff Lines
    for (let l = 0; l < 5; l++) {
        const lineString = `M${msr.Bounds.x + camera.x} 
    ${yStart + 5 * staffMidLine - line_space * 2 + line_space * l + camera.y} h 
    ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;
        const linePath = new Path2D(lineString);
        context.fill(linePath);
    }
}
export { RenderStaff };
