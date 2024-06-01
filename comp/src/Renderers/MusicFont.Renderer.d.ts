import { RenderProperties } from "../Types/RenderProperties.js";
declare enum Clefs {
    G = "\uD834\uDD1E",
    GOttavaBassa = "\uD834\uDD20",
    GOttavaAlta = "\uD834\uDD1F",
    GQuindicesimaBassa = "\uE051",
    F = "\uD834\uDD22"
}
declare enum NoteHeads {
    whole = "\uE0A2",
    minim = "\uE0A3",
    crotchet = "\uE0A4"
}
declare enum TimeSigNumbers {
    Zero = "\uE080",
    One = "\uE081",
    Two = "\uE082",
    Three = "\uE083",
    Four = "\uE084",
    Five = "\uE085",
    Six = "\uE086",
    Seven = "\uE087",
    Eight = "\uE088",
    Nine = "\uE089",
    Common = "\uE08A",
    CutCommon = "\uE08B"
}
declare enum TupletNumbers {
    Zero = "\uE880",
    One = "\uE881",
    Two = "\uE882",
    Three = "\uE883",
    Four = "\uE884",
    Five = "\uE885",
    Six = "\uE886",
    Seven = "\uE887",
    Eight = "\uE888",
    Nine = "\uE889",
    Colon = "\uE88A"
}
declare enum StdAccidentals {
    Natural = "\uE261",
    NaturalSharp = "\uE268",
    NaturalFlat = "\uE267",
    Flat = "\uE260",
    DoubleFlat = "\uE264",
    TripleFlat = "\uE266",
    Sharp = "\uE262",
    DoubleSharp = "\uE263",
    TripleSharp = "\uE265",
    ParenthLeft = "\uE26A",
    ParenthRight = "\uE26B",
    ParenthNatural = "\uE26A\uE261\uE26B",
    ParenthSharp = "\uE26A\uE262\uE26B",
    ParenthFlat = "\uE26A\uE260\uE26B"
}
declare function RenderSymbol(renderProps: RenderProperties, symbol: string, x: number, y: number, colour?: string): void;
export { Clefs, NoteHeads, StdAccidentals, TimeSigNumbers, TupletNumbers, RenderSymbol };
//# sourceMappingURL=MusicFont.Renderer.d.ts.map