import { RenderMeasure } from "../Renderers/Measure.Renderer.js";
import { RenderPage } from "../Renderers/Page.Renderer.js";
const renderDebug = false;
const scaleV = 1;
const Renderer = (c, ctx, measures, pages, hovElements, mousePos, cam, noteInput, restInput, formatting, config, noteValue) => {
    // reset
    ctx.fillStyle = "grey";
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    if (config.PageSettings.RenderBackground) {
        ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.restore();
    if (config.PageSettings.RenderPage) {
        pages.forEach(page => {
            RenderPage(page, c, ctx, cam, formatting, config);
        });
    }
    ctx.fillStyle = "black";
    measures.forEach((m, i) => {
        const renderProps = {
            canvas: c,
            context: ctx,
            camera: cam
        };
        const lastMeasure = (i === measures.length - 1);
        RenderMeasure(m, renderProps, hovElements.MeasureID, mousePos, lastMeasure, noteInput, i, restInput, noteValue);
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
