import { RenderMeasureBase } from "../Renderers/Measure.Renderer.js";
var renderDebug = false;
var scaleV = 1;
var Renderer = function (c, ctx, measures, hovElements, mousePos) {
    // reset
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "black";
    measures.forEach(function (m, i) {
        RenderMeasureBase(c, ctx, m, hovElements.MeasureID, mousePos);
        //    RenderNotes(c, ctx, m);
    });
};
export { Renderer };
