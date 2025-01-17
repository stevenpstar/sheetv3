import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
// TODO: Finish this enum, replace keys in keysig map
var Key;
(function (Key) {
    Key["CMajAmin"] = "CMaj/Amin";
    Key["GMajEmin"] = "GMaj/Emin";
    Key["DMajBmin"] = "DMaj/Bmin";
})(Key || (Key = {}));
const KeySignatures = new Map([
    ["CMaj/Amin", []],
    ["GMaj/Emin", ["F#"]],
    ["DMaj/Bmin", ["F#", "C#"]],
    ["AMaj/F#min", ["F#", "C#", "G#"]],
    ["EMaj/C#min", ["F#", "C#", "G#", "D#"]],
    ["BMaj/G#min", ["F#", "C#", "G#", "D#", "A#"]],
    ["F#Maj/D#min", ["F#", "C#", "G#", "D#", "A#", "E#"]],
    ["C#Maj/A#min", ["F#", "C#", "G#", "D#", "A#", "E#", "B#"]],
    ["FMaj/Dmin", ["Bb"]],
    ["BbMaj/Gmin", ["Bb", "Eb"]],
    ["EbMaj/Cmin", ["Bb", "Eb", "Ab"]],
    ["AbMaj/Fmin", ["Bb", "Eb", "Ab", "Db"]],
    ["DbMaj/Bbmin", ["Bb", "Eb", "Ab", "Db", "Gb"]],
    ["GbMaj/Ebmin", ["Bb", "Eb", "Ab", "Db", "Gb", "Cb"]],
    ["CbMaj/Abmin", ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"]],
]);
class KeySig {
    constructor() {
        this.SelType = SelectableTypes.KeySig;
        this.Bounds = new Bounds(0, 0, 0, 0);
        this.Selected = false;
        this.Editable = true;
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
}
export { KeySignatures, KeySig };
