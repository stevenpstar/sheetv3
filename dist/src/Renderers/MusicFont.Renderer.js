const stdFontSize = 42;
var Clefs;
(function (Clefs) {
    Clefs["G"] = "\uD834\uDD1E";
    Clefs["GOttavaBassa"] = "\uD834\uDD20";
    Clefs["GOttavaAlta"] = "\uD834\uDD1F";
    Clefs["GQuindicesimaBassa"] = "\uE051";
    Clefs["F"] = "\uD834\uDD22";
})(Clefs || (Clefs = {}));
var NoteHeads;
(function (NoteHeads) {
    NoteHeads["whole"] = "\uE0A2";
    NoteHeads["minim"] = "\uE0A3";
    NoteHeads["crotchet"] = "\uE0A4";
})(NoteHeads || (NoteHeads = {}));
var TimeSigNumbers;
(function (TimeSigNumbers) {
    TimeSigNumbers["Zero"] = "\uE080";
    TimeSigNumbers["One"] = "\uE081";
    TimeSigNumbers["Two"] = "\uE082";
    TimeSigNumbers["Three"] = "\uE083";
    TimeSigNumbers["Four"] = "\uE084";
    TimeSigNumbers["Five"] = "\uE085";
    TimeSigNumbers["Six"] = "\uE086";
    TimeSigNumbers["Seven"] = "\uE087";
    TimeSigNumbers["Eight"] = "\uE088";
    TimeSigNumbers["Nine"] = "\uE089";
    TimeSigNumbers["Common"] = "\uE08A";
    TimeSigNumbers["CutCommon"] = "\uE08B";
})(TimeSigNumbers || (TimeSigNumbers = {}));
var TupleNumbers;
(function (TupleNumbers) {
})(TupleNumbers || (TupleNumbers = {}));
var StdAccidentals;
(function (StdAccidentals) {
    StdAccidentals["Natural"] = "\uE261";
    StdAccidentals["NaturalSharp"] = "\uE268";
    StdAccidentals["NaturalFlat"] = "\uE267";
    StdAccidentals["Flat"] = "\uE260";
    StdAccidentals["DoubleFlat"] = "\uE264";
    StdAccidentals["TripleFlat"] = "\uE266";
    StdAccidentals["Sharp"] = "\uE262";
    StdAccidentals["DoubleSharp"] = "\uE263";
    StdAccidentals["TripleSharp"] = "\uE265";
    StdAccidentals["ParenthLeft"] = "\uE26A";
    StdAccidentals["ParenthRight"] = "\uE26B";
    StdAccidentals["ParenthNatural"] = "\uE26A\uE261\uE26B";
    StdAccidentals["ParenthSharp"] = "\uE26A\uE262\uE26B";
    StdAccidentals["ParenthFlat"] = "\uE26A\uE260\uE26B";
})(StdAccidentals || (StdAccidentals = {}));
function RenderSymbol(renderProps, symbol, x, y, colour = "black") {
    const { canvas, context, camera } = renderProps;
    context.fillStyle = colour;
    context.font = `${stdFontSize}px Bravura`;
    context.fillText(symbol, x + camera.x, y + camera.y);
}
export { Clefs, NoteHeads, StdAccidentals, TimeSigNumbers, RenderSymbol };
