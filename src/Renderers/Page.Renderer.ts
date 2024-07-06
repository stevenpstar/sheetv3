import { Camera } from '../Core/Camera.js';
import { Measure } from '../Core/Measure.js';
import { Page } from '../Core/Page.js';
import { ConfigSettings } from '../Types/Config.js';
function RenderPage(
  page: Page,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  cam: Camera,
  formatting: boolean,
  config: ConfigSettings,
  measures: Measure[]): void {
    const scale = 6;
    // TODO: Change these variable names
    let a4w = page.Bounds.width;//210 * scale;
    let a4h = page.Bounds.height;//297 * scale;
    const x = page.Bounds.x;
    const y = page.Bounds.y;

    if (config.PageSettings?.AutoSize) {
      a4h = measures[measures.length-1].Bounds.y + measures[measures.length-1].GetMeasureHeight() + 40;
      if (measures.length < 4) {
        a4w = measures[measures.length-1].Bounds.x + measures[measures.length-1].GetBoundsWithOffset().width + 40;
      }
    }

//    context.save();

 //   context.setTransform(1, 0, 0, 1, 0, 0);
    context.filter = "blur(4px)";
//    context.fillStyle = "rgb(71, 71, 71)";
    context.fillStyle = config.Theme.PageShadowColour;// "#0e1114";
    context.fillRect(x + cam.x - 8, y + cam.y + 8, a4w, a4h);
    context.filter = "none";

    context.fillStyle = config.Theme.PageColour;;
    context.fillRect(x + cam.x, y + cam.y, a4w, a4h);

    if (formatting) {
    context.strokeStyle = "rgba(51, 2, 16, 0.2)";

    // Render Margin Lines
    // Left
    context.beginPath();
    context.setLineDash([10, 10]);
    context.moveTo(x + page.Margins.left + cam.x, y + cam.y);
    context.lineTo(x + page.Margins.left + cam.x, y + a4h + cam.y);
    context.stroke();

    // Right
    context.beginPath();
    context.setLineDash([10, 10]);
    context.moveTo(x + a4w - page.Margins.right + cam.x, y + cam.y);
    context.lineTo(x + a4w - page.Margins.right + cam.x, y + a4h + cam.y);
    context.stroke();

    // Top
    context.beginPath();
    context.setLineDash([10, 10]);
    context.moveTo(x + cam.x, y + page.Margins.top + cam.y);
    context.lineTo(x + a4w + cam.x, y + page.Margins.top + cam.y);
    context.stroke();

    // Bottom
    context.beginPath();
    context.setLineDash([10, 10]);
    context.moveTo(x + cam.x, y + a4h - page.Margins.bottom + cam.y);
    context.lineTo(x + a4w + cam.x, y + a4h - page.Margins.bottom + cam.y);
    context.stroke();

    // Reset stroke style
    context.strokeStyle = "black";
    const adjusterColour = "rgba(51, 2, 16, 0.8)";
    const lineColour = "rgba(2,51,16,0.8)";

    RenderAdjuster(x + page.Margins.right + cam.x, y + cam.y, "down", adjusterColour, context);
    RenderAdjuster(x + a4w - page.Margins.left + cam.x, y + cam.y, "down", adjusterColour, context);

    RenderAdjuster(x + cam.x, y + page.Margins.top + cam.y, "right", adjusterColour, context);
    RenderAdjuster(x + a4w + cam.x, y + page.Margins.top + cam.y, "left", adjusterColour, context);

    RenderAdjuster(x + cam.x, y + a4h - page.Margins.bottom + cam.y, "right", adjusterColour, context);
    RenderAdjuster(x + a4w + cam.x, y + a4h - page.Margins.bottom + cam.y, "left", adjusterColour, context);

    // Render Lines
    page.PageLines.forEach(line => {
      RenderAdjuster(x + cam.x - 25, y + line.LineBounds.y + cam.y + 12.5, "right", lineColour, context);
      context.strokeStyle = lineColour;
      context.beginPath();
      context.setLineDash([10, 10]);
      context.moveTo(x + cam.x, y + line.LineBounds.y + 12.5 + cam.y);
      context.lineTo(x + a4w + cam.x, y + line.LineBounds.y + 12.5 + cam.y);
      context.stroke();
    });

    // Render bounds
    context.strokeRect(page.MarginAdj[0].Bounds.x + cam.x, page.MarginAdj[0].Bounds.y + cam.y,
                       page.MarginAdj[0].Bounds.width, page.MarginAdj[0].Bounds.height);
    context.stroke();
    
    }
//    context.restore();
  }

function RenderAdjuster(x: number,
                        y: number,
                        dir: string,
                        colour: string,
                        context: CanvasRenderingContext2D): void {
  const size = 9;
  const buffer = 8;
  const scale = 1.7;
  context.fillStyle = colour;
  context.beginPath();
  // TODO: This is a little bit heeeinous
  switch (dir) {
    case "down":
      context.moveTo(x, y - buffer);
      context.lineTo(x - size, y - buffer - size * scale);
      context.lineTo(x + size, y - buffer - size * scale);
      break;
    case "right":
      context.moveTo(x - buffer, y);
      context.lineTo(x - buffer - size * scale, y - size);
      context.lineTo(x - buffer - size * scale, y + size);
      break;
    case "left":
      context.moveTo(x + buffer, y);
      context.lineTo(x + buffer + size * scale, y - size);
      context.lineTo(x + buffer + size * scale, y + size);
      break;
    case "up":
      context.moveTo(x, y + buffer);
      context.lineTo(x - size, y + buffer + size * scale);
      context.lineTo(x + size, y + buffer + size * scale);
      break;
    default:
  }
  context.fill();
}

export { RenderPage }
