import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
var renderDebug = false;
var scaleV = 1;
var Renderer = function (c, ctx, measures, hovElements, mousePos, cam) {
    // reset
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "black";
    measures.forEach(function (m, i) {
        var renderProps = {
            canvas: c,
            context: ctx,
            camera: cam
        };
        RenderMeasure(m, renderProps, hovElements.MeasureID, mousePos);
    });
};
export { Renderer };
