import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Camera } from "./Camera.js";
declare const KeySignatures: Map<string, string[]>;
interface KeySignature {
    Name: string;
    Accidentals: string[];
}
declare class KeySig implements ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds;
    constructor();
    IsHovered(x: number, y: number, cam: Camera): boolean;
}
export { KeySignature, KeySignatures, KeySig };
//# sourceMappingURL=KeySignatures.d.ts.map