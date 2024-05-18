import { RenderProperties } from "../Types/RenderProperties.js";

const stdFontSize = 42; enum Clefs {
  G = "\u{1D11E}",
  GOttavaBassa = "\u{1D120}",
  GOttavaAlta = "\u{1D11F}",
  GQuindicesimaBassa = "\u{E051}",
  F = "\u{1D122}",
}

enum NoteHeads {
  whole = "\u{E0A2}",
  minim = "\u{E0A3}",
  crotchet = "\u{E0A4}",
}

enum TimeSigNumbers {
  Zero = "\u{E080}",
  One = "\u{E081}",
  Two = "\u{E082}",
  Three = "\u{E083}",
  Four = "\u{E084}",
  Five = "\u{E085}",
  Six = "\u{E086}",
  Seven = "\u{E087}",
  Eight = "\u{E088}",
  Nine = "\u{E089}",
  Common = "\u{E08A}",
  CutCommon = "\u{E08B}"
}

enum TupleNumbers {

}

enum StdAccidentals {
  Natural = "\u{E261}",
  NaturalSharp = "\u{E268}",
  NaturalFlat = "\u{E267}",
  Flat = "\u{E260}",
  DoubleFlat = "\u{E264}",
  TripleFlat = "\u{E266}",
  Sharp = "\u{E262}",
  DoubleSharp = "\u{E263}",
  TripleSharp = "\u{E265}",
  ParenthLeft = "\u{E26A}",
  ParenthRight = "\u{E26B}",
  ParenthNatural = "\u{E26A}\u{E261}\u{E26B}",
  ParenthSharp = "\u{E26A}\u{E262}\u{E26B}",
  ParenthFlat = "\u{E26A}\u{E260}\u{E26B}",
}

function RenderSymbol(
  renderProps: RenderProperties,
  symbol: string,
  x: number, y: number,
  colour: string = "black"): void {

    const { canvas, context, camera } = renderProps;
    context.fillStyle = colour;
    context.font = `${stdFontSize}px Bravura`;
    context.fillText(symbol, x + camera.x, y + camera.y);
}

export { 
  Clefs,
  NoteHeads,
  StdAccidentals,
  TimeSigNumbers,
  RenderSymbol }
