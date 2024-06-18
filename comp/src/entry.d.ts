import { App } from "./App.js";
import { ISelectable } from "./Types/ISelectable.js";
import { Message } from "./Types/Message.js";
export declare namespace sheet {
    function CreateApp(canvas: HTMLCanvasElement, container: HTMLElement, doc: Document, keyMap: any, notifyCallBack: (msg: Message) => void): App;
    function ChangeInputMode(): void;
    function Sharpen(): void;
    function Flatten(): void;
    function SetNoteValue(value: number): void;
    function AddMeasure(): void;
    function Delete(): void;
    function SelectById(id: number): ISelectable;
    function ToggleFormatting(): void;
    function DeleteSelected(): void;
    function ChangeTimeSignature(top: number, bottom: number, transpose?: boolean): void;
}
export * from './Workers/Mappings.js';
export * from './App.js';
export * from './Workers/Loader.js';
export * from './Core/Note.js';
export * from './Workers/Pitcher.js';
//# sourceMappingURL=entry.d.ts.map