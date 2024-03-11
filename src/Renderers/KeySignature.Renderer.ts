import { KeySignatures } from "../Core/KeySignatures.js";
import { Measure } from "../Core/Measure.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { flatPath, sharpPath } from "./Accidentals.Renderer.js";

interface keyProps {
  Accidental: string;
  Lines: number[];
}

function RenderKeySignature(
  renderProps: RenderProperties,
  msr: Measure,
  keyString: string,
  clefString: string,
  xOff: number): void {
    const { canvas, context, camera } = renderProps;
    context.fillStyle = "black";
    const keyProps = GetKeyProps(clefString, keyString);
    let posString = '';
    keyProps.Lines.forEach((l: number, i: number) => {
      if (keyProps.Accidental === "#") {
        posString = `m ${msr.Bounds.x + xOff + (i * 5) + camera.x + 5} 
          ${msr.Bounds.y + (l * 5) + camera.y + 4}`;
        posString += sharpPath;
      } else {
        posString = `m ${msr.Bounds.x + xOff + (i * 5) + camera.x - 5} 
          ${msr.Bounds.y + (l * 5) + camera.y + 4}`;
        posString += flatPath;
      }
      context.fill(new Path2D(posString));
    });
}

function GetKeyProps(clefString: string, keyString: string): keyProps {
  const props = { Accidental: "", Lines: [] };
  const notes = KeySignatures.get(keyString);
  let acc = "";
  if (notes.length > 0) {
    if (notes[0].includes('#')) {
      acc = "#";
    } else {
      acc = "b";
    }
  }

  props.Accidental = acc;
  switch (clefString) {
    case "bass":
      break;
    case "treble":
      props.Lines = fromTreble(notes, acc);
      break;
    default:
  }
  return props;
}

function fromTreble(notes: string[], accidental: string): number[] {
  let lines: number[] = [];
  const sharpLines = [11, 14, 10, 13, 16, 12, 15];
  const flatLines =  [15, 12, 16, 13, 17, 14, 18];
  if (accidental === "#") {
    lines = sharpLines.slice(0, notes.length);
  } else {
    lines = flatLines.slice(0, notes.length);
  }
  return lines;
}

export { RenderKeySignature };


