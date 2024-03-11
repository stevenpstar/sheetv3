import { Note } from "../Core/Note";
import { RenderProperties } from "../Types/RenderProperties";

const sharpPath = 'm0 0 0-4.704 2-.552 0 4.68-2 .576zm3.938-1.138-1.375.394 0-4.68 1.375-.384 0-1.944-1.375.384 0-4.7818-.563 0 0 4.9268-2 .575 0-4.6498-.531 0 0 4.8268-1.375.385 0 1.948 1.375-.384 0 4.671-1.375.383 0 1.94 1.375-.384 0 4.7548.531 0 0-4.9248 2-.55 0 4.6258.563 0 0-4.7998 1.375-.385 0-1.947z';
const flatPath = 'c0 .805-.3018 1.576-1.1298 2.6109-.8772 1.0963-1.6156 1.7237-2.5886 2.4615l0-4.8049c.2212-.5586.5474-1.0108.98-1.358.4312-.3458.868-.5194 1.3104-.5194.7308 0 1.1942.4144 1.3944 1.2404.0224.0672.0336.1904.0336.3696zm-.105-3.36c-.6034 0-1.2166.1666-1.841.5012-.6244.3332-1.2152.7798-1.7724 1.3356l0-10.1804-.7882 0 0 17.4367c0 .4928.1344.7392.4032.7392.1554 0 .3485-.1302.637-.3024.8166-.4873 1.3257-.8131 1.8788-1.1567.6308-.392 1.3412-.8497 2.2806-1.7457.6482-.651 1.1172-1.3076 1.4084-1.9684.2898-.6622.4354-1.3174.4354-1.9684 0-.9632-.2562-1.6478-.7686-2.0524-.5796-.4256-1.2054-.6384-1.8732-.6384z';
const naturalPath = 'm0 0-.7875.2813 0-6.4406-4.5281 1.9688 0-16.7063.7594-.3375 0 6.5531 4.5563-2.0813 0 16.7625zm-.7875-9 0-4.5-3.7688 1.6594 0 4.5 3.7688-1.6594z';

function RenderAccidental(
    renderProps: RenderProperties,
    note: Note,
    type: number): void {
  const { canvas, context, camera } = renderProps;
  let posString = '';
  switch (type) {
    case 0:
      posString = `m ${note.Bounds.x + camera.x - 2} ${note.Bounds.y + camera.y + 16}`;
      posString += naturalPath;
      break;
    case 1:
      posString = `m ${note.Bounds.x + camera.x - 5} ${note.Bounds.y + camera.y + 8}`;
      posString += sharpPath;
      break;
    case -1:
      posString = `m ${note.Bounds.x + camera.x - 5} ${note.Bounds.y + camera.y + 4}`;
      posString += flatPath;
      break;
    default:
      break;
  }
  context.fillStyle = "black";
  context.fill(new Path2D(posString));
}

export { RenderAccidental, sharpPath, flatPath }
