import { Camera } from "../Core/Camera.js";
import { Measure } from "../Core/Measure.js";
import { Page } from "../Core/Page.js";
import { Sheet } from "../Core/Sheet.js";
import { ConfigSettings } from "../Types/Config.js";
declare function SetPagesAndLines(measures: Measure[], pages: Page, usePage: boolean | null, defaultLineHeight?: number): void;
declare function ResizeMeasuresOnPage(sheet: Sheet, page: Page, cam: Camera, config: ConfigSettings): void;
export { SetPagesAndLines, ResizeMeasuresOnPage };
//# sourceMappingURL=Formatter.d.ts.map