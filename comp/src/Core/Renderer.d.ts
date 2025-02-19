import { ConfigSettings } from "../Types/Config.js";
import { Camera } from "./Camera.js";
import { Measure } from "./Measure.js";
import { Page } from "./Page.js";
declare const Renderer: (c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, measures: Measure[], pages: Page[], mousePos: {
    x: number;
    y: number;
}, cam: Camera, noteInput: boolean, restInput: boolean, formatting: boolean, config: ConfigSettings, noteValue: number) => void;
export { Renderer };
//# sourceMappingURL=Renderer.d.ts.map