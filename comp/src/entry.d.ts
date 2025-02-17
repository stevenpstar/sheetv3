import { App } from "./App.js";
import { ArticulationType } from "./Core/Articulation.js";
import { Division, Measure } from "./Core/Measure.js";
import { ConfigSettings } from "./Types/Config.js";
import { ISelectable } from "./Types/ISelectable.js";
import { Message } from "./Types/Message.js";
export declare namespace sheet {
    function CreateApp(canvas: HTMLCanvasElement, container: HTMLElement, doc: Document, keyMap: any, notifyCallBack: (msg: Message) => void, config: ConfigSettings): App;
    function ChangeInputMode(): void;
    function SetAccidental(acc: number): void;
    function Sharpen(): void;
    function Flatten(): void;
    function SetNoteValue(value: number): void;
    function AddMeasure(): void;
    function AddArticulation(type: ArticulationType): void;
    function AddStaff(instrIndex: number, clefString: string): void;
    function AddNoteOnMeasure(msr: Measure, noteVal: number, line: number, div: Division, rest: boolean): void;
    function Delete(): void;
    function SelectById(id: number): ISelectable;
    function ToggleFormatting(): void;
    function DeleteSelected(): void;
    function ChangeTimeSignature(top: number, bottom: number, transpose?: boolean): void;
}
export * from "./Workers/Mappings.js";
export * from "./App.js";
export * from "./Workers/Loader.js";
export * from "./Core/Note.js";
export * from "./Workers/Pitcher.js";
export * from "./Types/Message.js";
export * from "./Types/Config.js";
//# sourceMappingURL=entry.d.ts.map