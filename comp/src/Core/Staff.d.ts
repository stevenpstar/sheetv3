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
declare function RenderStaff(renderProps: RenderProperties, msr: Measure, staff: Staff): void;
declare function GetStaffHeightUntil(staves: Staff[], staffNum?: number): number;
declare function GetStaffHeight(staves: Staff[], staffNum: number): number;
declare function GetStaffMiddleLine(staves: Staff[], staffNum: number): number;
export { Staff, GetStaffHeightUntil, GetStaffMiddleLine, GetStaffHeight, RenderStaff };
//# sourceMappingURL=Staff.d.ts.map