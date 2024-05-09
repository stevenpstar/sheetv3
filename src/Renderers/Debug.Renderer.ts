import { Division } from "../Core/Division.js";
import { Measure } from "../Core/Measure.js";
import { RenderProperties } from "../Types/RenderProperties.js";

function RenderPanel(props: RenderProperties): void {
  const { canvas, context, camera } = props;
  const panelWidth = 200;
  const panelHeight = window.innerHeight;
  const xPos = window.innerWidth - panelWidth;
  const yPos = 0;

  context.fillStyle = "black";
  context.fillRect(xPos, yPos, panelWidth, panelHeight);
}

function RenderDebugOld(
  measure: Measure,
  renderProps: RenderProperties,
  index: number,
  mousePos: { x: number, y: number }){
    const { canvas, context, camera } = renderProps;

    if (measure.Divisions.length === 0) {
      console.error("measure has no divisions");
      return;
    }

    const fDiv = measure.Divisions[0];

    const renderDurations = false;
        const mousePositionString = `x: ${mousePos.x}, y: ${mousePos.y}`;
        context.fillStyle = "black";
        context.font = "12px serif";
        context.fillText(mousePositionString, 10, 100);

        const camPositionString = `x: ${measure.Camera.x}, y: ${measure.Camera.y}`;
        context.fillStyle = "black";
        context.font = "12px serif";
        context.fillText(camPositionString, 10, 200);

    // Render measure bounds
//    context.strokeStyle = "green";
//    context.strokeRect(measure.Bounds.x + measure.Camera.x, measure.Bounds.y + measure.Camera.y, measure.Bounds.width,
//                       measure.Bounds.height);


    measure.Divisions.forEach((div: Division, i: number) => {
      if (renderDurations) {
        const x = div.Bounds.x + camera.x + 2;
        const y = div.Bounds.y + div.Bounds.height + camera.y;
        context.fillStyle = debugGetDurationName(div.Duration).colour;
        context.fillRect(x, y + 10, 
                         div.Bounds.width - 4, 5);
        context.fillStyle = "black";
        context.font = "8px serif";
        context.fillText(debugGetDurationName(div.Duration).name, x,
                         y + 25);

        context.fillStyle = "black";
        context.fillText(div.Beat.toString(), x,
                         y + 40);
      }
    });
    if (index === 0) {
      if (renderDurations) {
        context.fillStyle = "black";
        context.fillText("Dur:", 
                         fDiv.Bounds.x + camera.x - 30,
                           fDiv.Bounds.y + camera.y + fDiv.Bounds.height + 25);
        context.fillText("Beat:", 
                         fDiv.Bounds.x + camera.x - 30,
                           fDiv.Bounds.y + camera.y + fDiv.Bounds.height + 40);
      }
    }

    const renderNoteBounds = false;
    if (renderNoteBounds) {
      measure.Notes.forEach(n => {
        context.fillStyle = "rgba(0 ,0, 255, 0.8)";
        context.fillRect(n.Bounds.x + camera.x, n.Bounds.y + camera.y, n.Bounds.width, n.Bounds.height);
      });
    }

    // note details
    const selectedNotes = measure
      .Notes
      .filter(n => n.Selected);
    if (selectedNotes.length > 0) {
      const selNote = selectedNotes[0];
      context.fillStyle = "black";
      context.font = "8px serif";
      context.fillText('Beat: ' + selNote.Beat.toString(), 10, 10);
      context.fillText('Duration: ' + selNote.Duration.toString(), 10, 20);
      context.fillText('Line: ' + selNote.Line.toString(), 10, 30);
      context.fillText('Tied: ' + selNote.Tied.toString(), 10, 40);
      if (selNote.Tied) {
        context.fillText(selNote.TiedStart.toString(), 40, 40);
        context.fillText(selNote.TiedEnd.toString(), 60, 40);
      }
    }

    // line details
   // const lineY = measure.Bounds.y + (line.num * (line_space / 2) - (line_space / 4));
   // context.fillRect(line.bounds.x + camera.x, lineY + camera.y, line.bounds.width, line.bounds.height);

   // TODO: Line numbers for grand staff are wrong in debug
    // OR they are wrong in staff 0 if we don't add the top line number
    const line = Measure.GetLineHovered(mousePos.y, measure);

//    context.fillRect(line.bounds.x + camera.x,
//                     line.bounds.y + camera.y,
//                     line.bounds.width,
//                     line.bounds.height);
    context.fillStyle = "black";
    context.font = "8px serif";
    let lineNum = line.num + measure.SALineTop;
    context.fillText("Line Hovered: " + lineNum.toString(), 130, 10);

    context.fillStyle = "rgba(0, 0, 50, 0.2)";
    const div1 = measure.Divisions.filter(d => d.Staff === 0)[0];
    const div2 = measure.Divisions.filter(d => d.Staff === 1)[0];
//    context.fillRect(div1.Bounds.x + camera.x,
//                     div1.Bounds.y + camera.y, 
//                     div1.Bounds.width,
//                     div1.Bounds.height);

    context.fillStyle = "rgba(0, 50, 0, 0.2)";
//    context.fillRect(div2.Bounds.x + camera.x,
//                     div2.Bounds.y + camera.y, 
//                     div2.Bounds.width,
//                     div2.Bounds.height);
    context.strokeStyle = "black";
//    context.strokeRect(measure.Bounds.x + measure.XOffset + camera.x,
//                 measure.Bounds.y + camera.y,
//                 measure.Bounds.width,
//                 measure.Bounds.height);
}

interface debugValueProperties {
  name: string;
  colour: string;
}

function debugGetDurationName(duration: number, alpha: number = 255): debugValueProperties {
  let name = "";
  let g: number = 150;
  let r: number = 0;
  let b: number = 0;
  let a: number = alpha;

  switch (duration) {
    case 1:
      name = "1";
      break;
    case 0.5:
      name = "1/2";
      b = 130;
      r = 100;
      break;
    case 0.25:
      name = "1/4";
      b = 130;
      break;
    case 0.125:
      name = "1/8";
      b = 200;
      break;
    case 0.0625:
      name = "1/16";
      b = 220;
      r = 100;
      break;
    case 0.03125:
      name = "1/32";
      b = 200;
      g = 70;
      r = 100;
      break;
    default:
      name = "unknown"
      g = 0;
      r = 255;
  }
  const colour = `rgba(${r}, ${g}, ${b}, ${a})`;
  return { name: name, colour: colour };
}

export { RenderPanel, RenderDebugOld }
