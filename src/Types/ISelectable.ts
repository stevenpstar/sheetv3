import { Camera } from "../Core/Camera.js";
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
  IsHovered: (x: number, y: number, cam: Camera) => boolean;
}

export { ISelectable, SelectableTypes };
