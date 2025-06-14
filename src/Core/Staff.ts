import { Measure } from "./Measure.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../Types/Config.js";

class Staff {
  // Determines line offset / Order of staff
  Num: number;
  TopLine: number;
  MidLine: number;
  BotLine: number;
  Buffer: number;
  constructor(num: number) {
    this.Num = num;
    this.Buffer = this.Num * 1000;
    // These defaults will change/be configurable
    this.TopLine = 5;
    this.BotLine = 35;
    this.MidLine = 15;
  }
}

function RenderMeasureLines(
  renderProps: RenderProperties,
  measure: Measure,
  lastMeasure: boolean,
  theme: Theme,
): void {
  const { context, camera } = renderProps;
  const endsWidth = lastMeasure ? 4 : 2;
  const startWidth = 2;

  const staves = measure.Staves;
  let staffHeight = GetStaffHeightUntil(staves, staves.length - 1) + 41;
  const yStart = measure.Bounds.y + (GetStaffMiddleLine(staves, 0) - 4) * 5;
  const measureBegin = `M${measure.Bounds.x + camera.x} 
        ${yStart + camera.y} h 
        ${startWidth} v ${staffHeight} h -${startWidth} Z`;

  const measureEnd = `M${measure.Bounds.x + measure.Bounds.width + measure.XOffset + camera.x} 
        ${yStart + camera.y} h 
        ${endsWidth} v ${staffHeight} h -${endsWidth} Z`;

  const measureEndDouble = `M${measure.Bounds.x + measure.Bounds.width + measure.XOffset + camera.x - 3} 
        ${yStart + camera.y} h 
        ${startWidth} v ${staffHeight} h -${startWidth} Z`;

  context.fillStyle = theme.LineColour;
  context.strokeStyle = theme.LineColour;
  context.fill(new Path2D(measureBegin));
  context.fill(new Path2D(measureEnd));
  if (lastMeasure) {
    context.fill(new Path2D(measureEndDouble));
  }
}

function GetStaffHeightUntil(staves: Staff[], staffNum: number = -1): number {
  if (!staves) {
    // Likely to do with initial loading of a sheet
    console.log("Staves does not exist? Early return");
    return
  }
  if (staves.length === 0) {
    console.log("No staves found, early return");
    return 0;
  }
  let height = 0;
  staves.forEach((s: Staff, i: number) => {
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

function GetStaffHeight(staves: Staff[], staffNum: number): number {
  const staff = staves.find((s: Staff) => s.Num === staffNum);
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

function GetStaffMiddleLine(staves: Staff[], staffNum: number): number {
  const linesBefore = 0; //GetStaffHeightUntil(staves, staffNum) / 5;
  const staff = staves.find((s: Staff) => s.Num === staffNum);
  return linesBefore + (staff.MidLine - staff.TopLine);
}

function GetStaffActualMidLine(staves: Staff[], staffNum: number): number {
  const linesBefore = GetStaffHeightUntil(staves, staffNum) / 5;
  const staff = staves.find((s: Staff) => s.Num === staffNum);
  return linesBefore + (staff.MidLine - staff.TopLine);
}

// TODO: Probably move this render function once it is working.
function RenderStaffLines(
  renderProps: RenderProperties,
  msr: Measure,
  staff: Staff,
): void {
  // These should be defined somewhere else
  const { context, camera, theme } = renderProps;
  const line_space = 10;
  const line_width = 1;
  const endsWidth = 2;

  const staves = msr.Staves;
  const yStart = msr.Bounds.y + GetStaffHeightUntil(staves, staff.Num);
  const staffMidLine = GetStaffMiddleLine(staves, staff.Num);
  const staffHeight =
    GetStaffHeightUntil(staves, staves.length - 2) +
    (GetStaffMiddleLine(staves, staves.length - 1) - 2) * 5;
  // Render Staff Lines
  for (let l = 0; l < 5; l++) {
    const lineString = `M${msr.Bounds.x + camera.x} 
    ${yStart + 5 * staffMidLine - line_space * 2 + line_space * l + camera.y} h 
    ${msr.Bounds.width + msr.XOffset} v ${line_width} h -${msr.Bounds.width + msr.XOffset} Z`;

    context.fillStyle = theme.LineColour;
    context.strokeStyle = theme.LineColour;
    const linePath = new Path2D(lineString);
    context.fill(linePath);
  }
}

export {
  Staff,
  GetStaffHeightUntil,
  GetStaffMiddleLine,
  GetStaffHeight,
  RenderStaffLines,
  RenderMeasureLines,
  GetStaffActualMidLine,
};
