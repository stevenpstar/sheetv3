import { ConfigSettings } from "../Types/Config.js";
import { Selector } from "../Workers/Selector.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
import { Page } from "./Page.js";
import { Sheet } from "./Sheet.js";
declare const Renderer: (c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, measures: Measure[], pages: Page[], hovElements: {
    MeasureID: number;
}, mousePos: {
    x: number;
    y: number;
}, cam: Camera, noteInput: boolean, restInput: boolean, formatting: boolean, config: ConfigSettings, noteValue: number) => void;
declare const RenderDebug: (c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, sheet: Sheet, mousePos: {
    x: number;
    y: number;
}, cam: Camera, selector: Selector) => void;
export { Renderer, RenderDebug };
//# sourceMappingURL=Renderer.d.ts.map