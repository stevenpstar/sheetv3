class Staff {
    constructor(num) {
        this.Num = num;
        this.Buffer = this.Num * 1000;
        // These defaults will change/be configurable
        this.TopLine = 5 + this.Buffer;
        this.BotLine = 35 + this.Buffer;
        this.MidLine = 15 + this.Buffer;
    }
}
// helper functions
// TODO: Probably move this render function once it is working.
function RenderStaff(renderProps, msr, staff) {
    // These should be defined somewhere else
    const { canvas, context, camera } = renderProps;
    const line_space = 10;
    const line_width = 1;
    const endsWidth = 2;
    const staves = msr.Staves;
    const yStart = msr.Bounds.y + GetStaffHeightUntil(staves, staff.Num);
    const staffMidLine = GetStaffMiddleLine(staves, staff.Num);
    const staffHeight = GetStaffHeight(staves, staff.Num);
    const measureBegin = `M${msr.Bounds.x + camera.x} 
        ${yStart + ((5) * staffMidLine) - (line_space * 2) + camera.y} h 
        ${endsWidth} v ${staffHeight} h -${endsWidth} Z`;
    const measureEnd = `M${msr.Bounds.x + msr.Bounds.width + msr.XOffset + camera.x} 
      ${yStart + ((5) * staffMidLine) - (line_space * 2) + camera.y} h 
      ${endsWidth} v ${staffHeight + 1} h -${endsWidth} Z`;
    context.fill(new Path2D(measureBegin));
    context.fill(new Path2D(measureEnd));
    // Render Staff Lines
    for (let l = 0; l < 5; l++) {
        const lineString = `M${msr.Bounds.x + camera.x} 
    ${yStart + ((5) * staffMidLine) - (line_space * 2) + line_space * l + camera.y} h 
    ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;
        const linePath = new Path2D(lineString);
        context.fill(linePath);
    }
}
function GetStaffHeightUntil(staves, staffNum = -1) {
    let height = 0;
    staves.forEach((s, i) => {
        if (i < staffNum || staffNum === -1) {
            const topNegative = s.TopLine < 0;
            const lineCount = topNegative ?
                s.BotLine + Math.abs(s.TopLine) :
                s.BotLine - s.TopLine;
            height += lineCount * 5;
        }
    });
    return height;
}
function GetStaffHeight(staves, staffNum) {
    const staff = staves.find((s) => s.Num === staffNum);
    // TODO Write an error or something
    if (!staff) {
        return -1;
    }
    const topNegative = staff.TopLine < 0;
    const lineCount = topNegative ?
        staff.BotLine + Math.abs(staff.TopLine) :
        staff.BotLine - staff.TopLine;
    return lineCount * 5;
}
function GetStaffMiddleLine(staves, staffNum) {
    const staff = staves.find((s) => s.Num === staffNum);
    return staff.MidLine - staff.TopLine;
}
export { Staff, GetStaffHeightUntil, GetStaffMiddleLine, GetStaffHeight, RenderStaff };
