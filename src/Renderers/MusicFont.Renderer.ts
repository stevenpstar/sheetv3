import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";

const stdFontSize = 40;
enum Clefs {
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
  CutCommon = "\u{E08B}",
}

enum TupletNumbers {
  Zero = "\u{E880}",
  One = "\u{E881}",
  Two = "\u{E882}",
  Three = "\u{E883}",
  Four = "\u{E884}",
  Five = "\u{E885}",
  Six = "\u{E886}",
  Seven = "\u{E887}",
  Eight = "\u{E888}",
  Nine = "\u{E889}",
  Colon = "\u{E88A}",
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

enum DynamicSymbol {
  Piano = "\u{E520}",
  Mezzo = "\u{E521}",
  Forte = "\u{E522}",
  Rinforzando = "\u{E523}",
  SForzando = "\u{E524}",
  Z = "\u{E525}",
  N = "\u{E526}",
}

enum ArticulationSymbol {
  AccentAbove = "\u{E4A0}",
  AccentBelow = "\u{E4A1}",
  StaccatoAbove = "\u{E4A2}",
  StaccatoBelow = "\u{E4A3}",
}

function RenderSymbol(
  renderProps: RenderProperties,
  symbol: string,
  x: number,
  y: number,
  theme: Theme,
  selected: boolean,
): void {
  const { canvas, context, camera } = renderProps;
  context.fillStyle = selected ? theme.SelectColour : theme.NoteElements;
  context.font = `${stdFontSize}px Bravura`;
  context.fillText(symbol, x + camera.x, y + camera.y);
}

function RenderScaledSymbol(
  renderProps: RenderProperties,
  symbol: string,
  x: number,
  y: number,
  theme: Theme,
  selected: boolean,
  fontSize: number,
): void {
  const { canvas, context, camera } = renderProps;
  context.fillStyle = selected ? theme.SelectColour : theme.NoteElements;
  context.font = `${fontSize}px Bravura`;
  context.fillText(symbol, x + camera.x, y + camera.y);
}

//TODO: Test(?) Function, maybe. - testing opacity only here
function RenderAnimatedSymbol(
  renderProps: RenderProperties,
  symbol: string,
  x: number,
  y: number,
  theme: Theme,
  opacity: number,
): void {
  renderProps.context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  renderProps.context.font = `${stdFontSize}px Bravura`;
  renderProps.context.fillText(
    symbol,
    x + renderProps.camera.x,
    y + renderProps.camera.y,
  );
}

export {
  Clefs,
  NoteHeads,
  StdAccidentals,
  TimeSigNumbers,
  TupletNumbers,
  DynamicSymbol,
  ArticulationSymbol,
  RenderSymbol,
  RenderScaledSymbol,
  RenderAnimatedSymbol,
  stdFontSize,
};
