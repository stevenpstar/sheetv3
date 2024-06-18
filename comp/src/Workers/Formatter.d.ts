import { Camera } from "../Core/Camera.js";
import { Measure } from "../Core/Measure.js";
import { Page } from "../Core/Page.js";
import { ConfigSettings } from "../Types/Config.js";
declare function SetPagesAndLines(measures: Measure[], pages: Page): void;
declare function ResizeMeasuresOnPage(measures: Measure[], page: Page, cam: Camera, config: ConfigSettings): void;
export { SetPagesAndLines, ResizeMeasuresOnPage };
//# sourceMappingURL=Formatter.d.ts.map