import { Camera } from "../Core/Camera.js";
import { Clef, Measure } from "../Core/Measure.js";
import { Note } from "../Core/Note.js";
import { ISelectable } from "../Types/ISelectable.js";
import { Message } from "../Types/Message.js";
declare class Selector {
    Measures: Measure[];
    Clefs: Clef[];
    Notes: Map<Measure, Note[]>;
    Elements: Map<Measure, ISelectable[]>;
    constructor();
    TrySelectElement(msr: Measure, x: number, y: number, cam: Camera, shiftKey: boolean, msg: (msg: Message) => void, elems: Map<Measure, ISelectable[]>): ISelectable;
    DeselectAllElements(elems: Map<Measure, ISelectable[]>): Map<Measure, ISelectable[]>;
    SelectElement(): ISelectable;
    DeselectAll(): void;
    DeselectNote(note: Note): void;
    RemoveDeselected(indexes: number[], key: Measure): void;
    SelectById(measures: Measure[], id: number): ISelectable;
    SelectMeasure(msr: Measure): void;
    SelectClef(clef: Clef): void;
    SelectNote(msr: Measure, x: number, y: number, cam: Camera, shiftKey: boolean): boolean;
}
export { Selector };
//# sourceMappingURL=Selector.d.ts.map