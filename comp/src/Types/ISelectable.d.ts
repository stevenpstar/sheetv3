import { Camera } from "../Core/Camera.js";
import { Bounds } from "./Bounds.js";
declare enum SelectableTypes {
    Measure = 0,
    Note = 1,
    Clef = 2,
    TimeSig = 3,
    KeySig = 4,
    Beam = 5,
    Stem = 6,
    Flag = 7,
    Barline = 8
}
interface ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds | Bounds[];
    Editable: boolean;
    IsHovered: (x: number, y: number, cam: Camera) => boolean;
}
export { ISelectable, SelectableTypes };
//# sourceMappingURL=ISelectable.d.ts.map