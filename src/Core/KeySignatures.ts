import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Camera } from "./Camera.js";

const KeySignatures: Map<string, string[]> = new Map<string, string[]>([
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

interface KeySignature {
  Name: string;
  Accidentals: string[]
}

class KeySig implements ISelectable {
  ID: number;
  Selected: boolean;
  SelType: SelectableTypes = SelectableTypes.KeySig;
  Bounds: Bounds;
  Editable: boolean;
  constructor() {
    this.Bounds = new Bounds(0, 0, 0, 0);
    this.Selected = false;
    this.Editable = true;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }

}

export { KeySignature, KeySignatures, KeySig }
