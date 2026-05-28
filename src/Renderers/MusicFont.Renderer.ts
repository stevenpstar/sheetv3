import { RenderProperties } from "../Types/RenderProperties.js";
import { Note, Theme } from "../entry.js";

const stdFontSize = 40;

enum Brackets {
  Brace = "\u{1D114}",
}
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

enum Rests {
  Whole = "\u{E4E3}",
  Minim = "\u{E4E4}",
  Crotchet = "\u{E4E5}",
  Quaver = "\u{E4E6}",
  SemiQuaver = "\u{E4E7}",
  DemiSemiQuaver = "\u{E4E8}",
  HemiDemiSemiQuaver = "\u{E4E9}",
  SemiHemiDemiSemiQuaver = "\u{E4EA}",
  DemiSemiHemiDemiSemiQuaver = "\u{E4EB}",
}

enum Flags {
  QuaverDown = "\u{E240}",
  QuaverUp = "\u{E241}",
  SemiQuaverDown = "\u{E242}",
  SemiQuaverUp = "\u{E243}",
  DemiSemiQuaverDown = "\u{E244}",
  DemiSemiQuaverUp = "\u{E245}",
  HemiDemiSemiQuaverDown = "\u{E246}",
  HemiDemiSemiQuaverUp = "\u{E247}",
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
  MarcatoAbove = "\u{E4AC}",
  MarcatoBelow = "\u{E4AD}",
  TenutoAbove = "\u{E4A4}",
  TenutoBelow = "\u{E4A5}",
}

function RenderSymbol(
  renderProps: RenderProperties,
  symbol: string,
  x: number,
  y: number,
  theme: Theme,
  selected: boolean,
): void {
  const { context, camera } = renderProps;
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
  const { context, camera } = renderProps;
  var colour = selected ? theme.SelectColour : theme.NoteElements;
  context.fillStyle = selected ? theme.SelectColour : theme.NoteElements;
  context.font = `${fontSize}px Bravura`;
  context.fillText(symbol, x + camera.x, y + camera.y);
}

function RenderScaledNote(
  note: Note,
  renderProps: RenderProperties,
  symbol: string,
  x: number,
  y: number,
  theme: Theme,
  selected: boolean,
  fontSize: number,
  overrideColour: string = "",
): void {
  const { context, camera } = renderProps;
  var colour = selected ? theme.SelectColour : theme.NoteElements;
  if (note.OutOfBounds) {
    colour = "red";
  }
  if (note.Beat === 2.5) {
    overrideColour = "#a2d143";
  }
  if (overrideColour !== "") {
    context.fillStyle = overrideColour;
  } else {
    context.fillStyle = colour;
  }
  context.font = `${fontSize}px Bravura`;
  context.fillText(symbol, x + camera.x, y + camera.y);
  // TODO: This is for debugging, obviously need a debug flag somewhere at some
  // point
  if (note.Selected) {
    context.font = '12px Bravura';
    //context.fillText("Voice: " + note.Voice.toString(), x + camera.x + 6, y + camera.y + 20);
    context.fillText("ID: " + note.ID.toString(), x + camera.x + 6, y + camera.y + 20);
//    context.fillText("Beat: " + note.Beat.toString(), x + camera.x + 6, y + camera.y + 34);
//    context.fillText("Staff: " + note.Staff.toString(), x + camera.x + 6, y + camera.y + 46);
//    context.fillText("Tied: " + (note.Tied ? "true" : "false") , x + camera.x + 6, y + camera.y + 58);
//    context.fillText("TiedStart: " + note.TiedStart.toString(), x + camera.x + 6, y + camera.y + 70);
//    context.fillText("TiedEnd: " + note.TiedEnd.toString(), x + camera.x + 6, y + camera.y + 82);
//    context.fillText("Duration: " + note.Duration, x + camera.x + 6, y + camera.y + 94);
//    context.fillText("Line: " + note.Line.toString(), x + camera.x + 6, y + camera.y + 106);
  }
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
  Brackets,
  Clefs,
  NoteHeads,
  Rests,
  Flags,
  StdAccidentals,
  TimeSigNumbers,
  TupletNumbers,
  DynamicSymbol,
  ArticulationSymbol,
  RenderSymbol,
  RenderScaledSymbol,
  RenderScaledNote,
  RenderAnimatedSymbol,
  stdFontSize,
};
