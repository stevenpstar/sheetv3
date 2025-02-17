import { Sheet } from "./Core/Sheet.js";
import { Division, Measure } from "./Core/Measure.js";
import { Bounds } from "./Types/Bounds.js";
import { Camera } from "./Core/Camera.js";
import { Selector } from "./Workers/Selector.js";
import { KeyMapping } from "./Workers/Mappings.js";
import { ISelectable } from "./Types/ISelectable.js";
import { saveFile } from "./testsaves.js";
import { Message } from "./Types/Message.js";
import { MappedMidi } from "./Workers/Pitcher.js";
import { ConfigSettings } from "./Types/Config.js";
import { ArticulationType } from "./Core/Articulation.js";
declare class App {
    Config: ConfigSettings;
    Message: Message;
    Canvas: HTMLCanvasElement;
    Container: HTMLElement;
    Context: CanvasRenderingContext2D;
    Load: boolean;
    Sheet: Sheet;
    NoteInput: boolean;
    RestInput: boolean;
    GraceInput: boolean;
    Formatting: boolean;
    Zoom: number;
    Camera: Camera;
    CamDragging: boolean;
    DraggingPositions: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    NoteValue: number;
    Selector: Selector;
    NotifyCallback: (msg: Message) => void;
    RunningID: {
        count: number;
    };
    PitchMap: Map<number, MappedMidi>;
    DraggingNote: boolean;
    StartLine: number;
    EndLine: number;
    StartDragY: number;
    EndDragY: number;
    DragLining: boolean;
    LinerBounds: Bounds;
    LineNumber: Number;
    Debug: boolean;
    constructor(canvas: HTMLCanvasElement, container: HTMLElement, context: CanvasRenderingContext2D, notifyCallback: (msg: Message) => void, config: ConfigSettings, load?: boolean);
    Hover(x: number, y: number): void;
    Delete(): void;
    Input(x: number, y: number, shiftKey: boolean): void;
    Update(x: number, y: number): void;
    Render(mousePos: {
        x: number;
        y: number;
    }): void;
    AddMeasure(): void;
    ChangeInputMode(): void;
    SelectLiner(x: number, y: number): Bounds | undefined;
    DragLiner(_: number, y: number): void;
    DragNote(x: number, y: number): void;
    StopNoteDrag(): void;
    SetCameraDragging(dragging: boolean, x: number, y: number): void;
    AlterZoom(num: number, mx: number, my: number): void;
    SetCameraZoom(num: number): void;
    ResizeFirstMeasure(): void;
    ResizeMeasures(measures: Measure[]): void;
    SetNoteValue(val: number): void;
    SetAccidental(acc: number): void;
    Sharpen(): void;
    Flatten(): void;
    ScaleToggle(): number;
    KeyInput(key: string, keymaps: KeyMapping): void;
    SelectById(id: number): ISelectable;
    ToggleFormatting(): void;
    Save(): void;
    LoadSheet(sheet: string): void;
    GetSaveFiles(): saveFile[];
    CreateTriplet(): void;
    ChangeTimeSignature(top: number, bottom: number, transpose?: boolean): void;
    CenterMeasures(): void;
    CenterPage(): void;
    AddNoteOnMeasure(msr: Measure, noteValue: number, line: number, beat: Division, rest: boolean): void;
    BeamSelectedNotes(): void;
    AddStaff(instrNum: number, clef: string): void;
    FromPitchMap(midiNote: number, clef: string): MappedMidi;
    ChangeBarline(): void;
    ChangeTimeSig(): void;
    AddDynamic(dynString: string): void;
    AddArticulation(type: ArticulationType): void;
    CycleActiveVoice(): void;
}
export { App };
//# sourceMappingURL=App.d.ts.map