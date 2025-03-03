import { Note } from "../Core/Note.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { RenderSymbol, StdAccidentals } from "./MusicFont.Renderer.js";

const sharpPath =
  "m0 0 0-5.6448 2.4-.6624 0 5.616-2.4.6912zm4.7256-1.3656-1.65.4728 0-5.616 1.65-.4608 0-2.3328-1.65.4608 0-5.7382-.6756 0 0 5.9122-2.4.69 0-5.5798-.6372 0 0 5.7922-1.65.462 0 2.3376 1.65-.4608 0 5.6052-1.65.4596 0 2.328 1.65-.4608 0 5.7058.6372 0 0-5.9098 2.4-.66 0 5.551.6756 0 0-5.7598 1.65-.462 0-2.3364z";
const doubleSharp =
  "c-1.2495-.1955-2.5177-.1955-3.7791-.1938-.0272-.9231.1207-1.904-.2448-2.771-.2448-.5763-.7089-1.0302-1.1203-1.4977-.6579.5882-1.1985 1.3651-1.2512 2.2678-.051.6664-.0136 1.3345-.0255 2.0009-1.2614.0187-2.5347-.0425-3.7791.2057.2397-1.2376.1853-2.5024.2074-3.7553.9605-.0255 1.9873.1122 2.8798-.306.5253-.2465.9724-.6324 1.4178-.9996-.5814-.6579-1.3362-1.2376-2.2474-1.292-.6817-.0544-1.3668-.0153-2.0502-.0272-.0425-1.2444.102-2.5024-.1564-3.7315 1.2308.2227 2.4854.1649 3.7281.1819.0187.8857-.0799 1.8037.17 2.6554.1904.6511.7106 1.1526 1.1441 1.666.6137-.5338 1.1662-1.2036 1.2665-2.0417.0918-.7582.0187-1.5198.0612-2.2797 1.2529-.034 2.5432.1258 3.7553-.2703-.1802 1.2631-.1972 2.5466-.1836 3.8199-.8942.0255-1.8309-.0748-2.6809.2278-.646.2278-1.1543.7276-1.6677 1.1696.5576.5712 1.2291 1.0965 2.0587 1.1747.7616.0714 1.5266.0391 2.2899.0527.0187 1.2495-.0425 2.5109.2074 3.7434z";
const flatPath =
  "c0 .805-.3018 1.576-1.1298 2.6109-.8772 1.0963-1.6156 1.7237-2.5886 2.4615l0-4.8049c.2212-.5586.5474-1.0108.98-1.358.4312-.3458.868-.5194 1.3104-.5194.7308 0 1.1942.4144 1.3944 1.2404.0224.0672.0336.1904.0336.3696zm-.105-3.36c-.6034 0-1.2166.1666-1.841.5012-.6244.3332-1.2152.7798-1.7724 1.3356l0-10.1804-.7882 0 0 17.4367c0 .4928.1344.7392.4032.7392.1554 0 .3485-.1302.637-.3024.8166-.4873 1.3257-.8131 1.8788-1.1567.6308-.392 1.3412-.8497 2.2806-1.7457.6482-.651 1.1172-1.3076 1.4084-1.9684.2898-.6622.4354-1.3174.4354-1.9684 0-.9632-.2562-1.6478-.7686-2.0524-.5796-.4256-1.2054-.6384-1.8732-.6384z";
const naturalPath =
  "m0 0-.7875.2813 0-6.4406-4.5281 1.9688 0-16.7063.7594-.3375 0 6.5531 4.5563-2.0813 0 16.7625zm-.7875-9 0-4.5-3.7688 1.6594 0 4.5 3.7688-1.6594z";

function RenderAccidental(
  renderProps: RenderProperties,
  note: Note,
  type: number,
  offset: number,
  theme: Theme,
): void {
  const { context, camera } = renderProps;
  let posString = "";
  let dflatString = ""; // posString for second flat
  switch (type) {
    case 0:
      posString = `m ${note.Bounds.x + camera.x - 2} ${note.Bounds.y + camera.y + 16}`;
      posString += naturalPath;
      break;
    case 1:
      RenderSymbol(
        renderProps,
        StdAccidentals.Sharp,
        note.Bounds.x - offset,
        note.Bounds.y + 3,
        theme,
        note.Selected,
      );
      break;
    case 2:
      posString = `m ${note.Bounds.x + camera.x - 2} ${note.Bounds.y + camera.y + 10}`;
      posString += doubleSharp;
      break;
    case -2:
      dflatString = `m ${note.Bounds.x + camera.x - 15} ${note.Bounds.y + camera.y + 4}`;
      dflatString += flatPath;
    case -1:
      posString = `m ${note.Bounds.x + camera.x - 5} ${note.Bounds.y + camera.y + 4}`;
      posString += flatPath;
      RenderSymbol(
        renderProps,
        StdAccidentals.Flat,
        note.Bounds.x - offset,
        note.Bounds.y + 3,
        theme,
        note.Selected,
      );
      break;
    default:
      break;
  }
  //  context.fill(new Path2D(posString));
  //  if (type === -2) {
  //    context.fill(new Path2D(dflatString));
  //  }
}

export { RenderAccidental, sharpPath, flatPath };
