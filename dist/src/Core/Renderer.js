import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
const renderDebug = false;
const scaleV = 1;
const Renderer = (c, ctx, measures, hovElements, mousePos, cam, noteInput, restInput) => {
    // reset
    const a4w = 210;
    const a4h = 297;
    ctx.fillStyle = "grey";
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.restore();
    ctx.fillStyle = "white";
    ctx.fillRect(-80 + cam.x, -80 + cam.y, a4w * 5, a4h * 5);
    ctx.fillStyle = "black";
    measures.forEach((m, i) => {
        const renderProps = {
            canvas: c,
            context: ctx,
            camera: cam
        };
        const lastMeasure = (i === measures.length - 1);
        RenderMeasure(m, renderProps, hovElements.MeasureID, mousePos, lastMeasure, noteInput, i, restInput);
    });
};
const RenderDebug = (c, ctx, sheet, mousePos, cam, selector) => {
    const renderProps = {
        canvas: c,
        context: ctx,
        camera: cam
    };
    //                 RenderPanel(renderProps);
};
export { Renderer, RenderDebug };
