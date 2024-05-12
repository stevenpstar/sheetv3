import { Bounds } from "./Bounds.js";

enum SelectableTypes {
  Measure,
  Note,
  Clef,
  TimeSig,
  KeySig,
  Beam,
  Stem
}
interface ISelectable {
  ID: number;
  Selected: boolean;
  SelType: SelectableTypes;
  Bounds: Bounds;
}

export { ISelectable, SelectableTypes };
