import { RenderMeasureBase } from "../Renderers/Measure.Renderer.js";
import { Measure } from "./Measure.js";

const renderDebug = false;
const scaleV = 1;

const Renderer = (c: HTMLCanvasElement, 
                  ctx: CanvasRenderingContext2D,
                  measures: Measure[],
                  hovElements: {MeasureID: number},
                  mousePos: {x: number, y: number}) => {
  // reset
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "black";

  measures.forEach((m: Measure, i: number) => {
    RenderMeasureBase(c, ctx, m, hovElements.MeasureID, mousePos);
//    RenderNotes(c, ctx, m);
  })
}

export { Renderer };
