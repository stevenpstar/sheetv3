import { Measure } from "./Measure.js";
import { RenderProperties } from "../Types/RenderProperties.js";
declare class Staff {
    Num: number;
    TopLine: number;
    MidLine: number;
    BotLine: number;
    Buffer: number;
    constructor(num: number);
}
declare function RenderMeasureLines(renderProps: RenderProperties, measure: Measure): void;
declare function RenderStaffLines(renderProps: RenderProperties, msr: Measure, staff: Staff): void;
declare function GetStaffHeightUntil(staves: Staff[], staffNum?: number): number;
declare function GetStaffHeight(staves: Staff[], staffNum: number): number;
declare function GetStaffMiddleLine(staves: Staff[], staffNum: number): number;
declare function GetStaffActualMidLine(staves: Staff[], staffNum: number): number;
export { Staff, GetStaffHeightUntil, GetStaffMiddleLine, GetStaffHeight, RenderStaffLines, RenderMeasureLines, GetStaffActualMidLine };
//# sourceMappingURL=Staff.d.ts.map