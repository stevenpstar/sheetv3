class Staff {
    constructor(num) {
        this.Num = num;
        this.Buffer = this.Num * 1000;
        // These defaults will change/be configurable
        this.TopLine = 5;
        this.BotLine = 35;
        this.MidLine = 15;
    }
}
function RenderMeasureLines(renderProps, measure, lastMeasure, theme) {
    const { context, camera } = renderProps;
    const endsWidth = lastMeasure ? 4 : 2;
    const startWidth = 2;
    const staves = measure.Staves;
    let staffHeight = GetStaffHeightUntil(staves, staves.length - 1) + 41;
    const yStart = measure.Bounds.y + (GetStaffMiddleLine(staves, 0) - 4) * 5;
    context.fillStyle = theme.LineColour;
    const measureBegin = `M${measure.Bounds.x + camera.x} 
        ${yStart + camera.y} h 
        ${startWidth} v ${staffHeight} h -${startWidth} Z`;
    const measureEnd = `M${measure.Bounds.x + measure.Bounds.width + measure.XOffset + camera.x} 
        ${yStart + camera.y} h 
        ${endsWidth} v ${staffHeight} h -${endsWidth} Z`;
    const measureEndDouble = `M${measure.Bounds.x + measure.Bounds.width + measure.XOffset + camera.x - 3} 
        ${yStart + camera.y} h 
        ${startWidth} v ${staffHeight} h -${startWidth} Z`;
    context.fill(new Path2D(measureBegin));
    context.fill(new Path2D(measureEnd));
    if (lastMeasure) {
        context.fill(new Path2D(measureEndDouble));
    }
}
function GetStaffHeightUntil(staves, staffNum = -1) {
    let height = 0;
    staves.forEach((s, i) => {
        if (i < staffNum || staffNum === -1) {
            const topNegative = s.TopLine < 0;
            const lineCount = topNegative
                ? s.BotLine + Math.abs(s.TopLine)
                : s.BotLine - s.TopLine;
            height += lineCount * 5;
        }
    });
    return height;
}
function GetStaffHeight(staves, staffNum) {
    const staff = staves.find((s) => s.Num === staffNum);
    // TODO Write an error or something
    if (!staff) {
        console.error("Cannot find staff: ", staffNum);
        return -1;
    }
    const topNegative = staff.TopLine < 0;
    const lineCount = topNegative
        ? staff.BotLine + Math.abs(staff.TopLine)
        : staff.BotLine - staff.TopLine;
    return lineCount * 5;
}
function GetStaffMiddleLine(staves, staffNum) {
    const linesBefore = 0; //GetStaffHeightUntil(staves, staffNum) / 5;
    const staff = staves.find((s) => s.Num === staffNum);
    return linesBefore + (staff.MidLine - staff.TopLine);
}
function GetStaffActualMidLine(staves, staffNum) {
    const linesBefore = GetStaffHeightUntil(staves, staffNum) / 5;
    const staff = staves.find((s) => s.Num === staffNum);
    return linesBefore + (staff.MidLine - staff.TopLine);
}
// TODO: Probably move this render function once it is working.
function RenderStaffLines(renderProps, msr, staff) {
    // These should be defined somewhere else
    const { context, camera } = renderProps;
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
export { Staff, GetStaffHeightUntil, GetStaffMiddleLine, GetStaffHeight, RenderStaffLines, RenderMeasureLines, GetStaffActualMidLine, };
