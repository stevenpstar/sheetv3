const stdFontSize = 40;
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
var TupletNumbers;
(function (TupletNumbers) {
    TupletNumbers["Zero"] = "\uE880";
    TupletNumbers["One"] = "\uE881";
    TupletNumbers["Two"] = "\uE882";
    TupletNumbers["Three"] = "\uE883";
    TupletNumbers["Four"] = "\uE884";
    TupletNumbers["Five"] = "\uE885";
    TupletNumbers["Six"] = "\uE886";
    TupletNumbers["Seven"] = "\uE887";
    TupletNumbers["Eight"] = "\uE888";
    TupletNumbers["Nine"] = "\uE889";
    TupletNumbers["Colon"] = "\uE88A";
})(TupletNumbers || (TupletNumbers = {}));
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
var DynamicSymbol;
(function (DynamicSymbol) {
    DynamicSymbol["Piano"] = "\uE520";
    DynamicSymbol["Mezzo"] = "\uE521";
    DynamicSymbol["Forte"] = "\uE522";
    DynamicSymbol["Rinforzando"] = "\uE523";
    DynamicSymbol["SForzando"] = "\uE524";
    DynamicSymbol["Z"] = "\uE525";
    DynamicSymbol["N"] = "\uE526";
})(DynamicSymbol || (DynamicSymbol = {}));
var ArticulationSymbol;
(function (ArticulationSymbol) {
    ArticulationSymbol["AccentAbove"] = "\uE4A0";
    ArticulationSymbol["AccentBelow"] = "\uE4A1";
    ArticulationSymbol["StaccatoAbove"] = "\uE4A2";
    ArticulationSymbol["StaccatoBelow"] = "\uE4A3";
})(ArticulationSymbol || (ArticulationSymbol = {}));
function RenderSymbol(renderProps, symbol, x, y, theme, selected) {
    const { context, camera } = renderProps;
    context.fillStyle = selected ? theme.SelectColour : theme.NoteElements;
    context.font = `${stdFontSize}px Bravura`;
    context.fillText(symbol, x + camera.x, y + camera.y);
}
function RenderScaledSymbol(renderProps, symbol, x, y, theme, selected, fontSize) {
    const { context, camera } = renderProps;
    var colour = selected ? theme.SelectColour : theme.NoteElements;
    context.fillStyle = selected ? theme.SelectColour : theme.NoteElements;
    context.font = `${fontSize}px Bravura`;
    context.fillText(symbol, x + camera.x, y + camera.y);
}
function RenderScaledNote(note, renderProps, symbol, x, y, theme, selected, fontSize) {
    const { context, camera } = renderProps;
    var colour = selected ? theme.SelectColour : theme.NoteElements;
    if (note.OutOfBounds) {
        colour = "red";
    }
    context.fillStyle = colour;
    context.font = `${fontSize}px Bravura`;
    context.fillText(symbol, x + camera.x, y + camera.y);
}
//TODO: Test(?) Function, maybe. - testing opacity only here
function RenderAnimatedSymbol(renderProps, symbol, x, y, theme, opacity) {
    renderProps.context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    renderProps.context.font = `${stdFontSize}px Bravura`;
    renderProps.context.fillText(symbol, x + renderProps.camera.x, y + renderProps.camera.y);
}
export { Clefs, NoteHeads, StdAccidentals, TimeSigNumbers, TupletNumbers, DynamicSymbol, ArticulationSymbol, RenderSymbol, RenderScaledSymbol, RenderScaledNote, RenderAnimatedSymbol, stdFontSize, };
