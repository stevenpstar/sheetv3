declare enum StaffType {
    Single = 0,
    Grand = 1,
    Rhythm = 2
}
interface Instrument {
    Position: {
        x: number;
        y: number;
    };
    Staff: StaffType;
}

declare class Camera {
    x: number;
    y: number;
    oldX: number;
    oldY: number;
    Zoom: number;
    constructor(x: number, y: number);
}

declare class Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    IsHovered(ix: number, iy: number, cam: Camera): boolean;
}

declare enum SelectableTypes {
    Measure = 0,
    Note = 1,
    Clef = 2,
    TimeSig = 3,
    KeySig = 4,
    Beam = 5,
    Stem = 6
}
interface ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds;
    Editable: boolean;
    IsHovered: (x: number, y: number, cam: Camera) => boolean;
}

declare enum MessageType {
    None = 0,
    Selection = 1,
    Deletion = 2,
    InputChange = 3,
    AddNote = 4
}
type MessageData = {
    MessageType: MessageType;
    Message: {
        msg: string;
        obj: any;
    };
};
interface Message {
    messageString: string;
    messageData: MessageData;
}
declare function ClearMessage(): Message;

interface RenderProperties {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    camera: Camera;
}

declare class Clef implements ISelectable {
    ID: number;
    Selected: boolean;
    Position: {
        x: number;
        y: number;
    };
    Bounds: Bounds;
    SelType: SelectableTypes;
    Type: string;
    Beat: number;
    Editable: boolean;
    constructor(id: number, pos: {
        x: number;
        y: number;
    }, type: string, beat: number);
    render(renderProps: RenderProperties, theme: Theme): void;
    SetBounds(msr: Measure, staff: number): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
}

interface TupleDetails {
    StartBeat: number;
    EndBeat: number;
    Value: number;
    Count: number;
}
interface NoteProps {
    Beat: number;
    Duration: number;
    Line: number;
    Rest: boolean;
    Tied: boolean;
    Staff: number;
    Tuple: boolean;
    TupleDetails?: TupleDetails;
    Clef: string;
    Editable?: boolean;
}
declare class Note implements ISelectable {
    Beat: number;
    Duration: number;
    Line: number;
    Rest: boolean;
    Tied: boolean;
    Accidental: number;
    ID: number;
    SelType: SelectableTypes;
    Clef: string;
    Editable: boolean;
    TiedStart: number;
    TiedEnd: number;
    Bounds: Bounds;
    Selected: boolean;
    Staff: number;
    Tuple: boolean;
    TupleDetails?: TupleDetails;
    constructor(props: NoteProps);
    SetBounds(bounds: Bounds): void;
    SetID(id: number): void;
    SetTiedStartEnd(s: number, e: number): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
    GetMidiNumber(): number;
}

interface Division {
    Beat: number;
    Duration: number;
    Bounds: Bounds;
    Staff: number;
}

interface Margins {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
interface PageLine {
    Number: number;
    YPos: number;
    LineBounds: Bounds;
}
interface MarginAdjuster {
    Name: string;
    Direction: string;
    Bounds: Bounds;
}
declare class Page {
    Margins: Margins;
    Bounds: Bounds;
    Number: number;
    PageLines: PageLine[];
    MarginAdj: MarginAdjuster[];
    constructor(x: number, y: number, pageNum: number);
    AddLine(lineHeight: number): PageLine;
}

declare class TimeSignature implements ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds;
    Editable: boolean;
    GBounds: Bounds;
    top: number;
    bottom: number;
    TopPosition: {
        x: number;
        y: number;
    };
    BotPosition: {
        x: number;
        y: number;
    };
    GTopPosition: {
        x: number;
        y: number;
    };
    GBotPosition: {
        x: number;
        y: number;
    };
    constructor(top: number, bottom: number, useSymbol?: boolean);
    render(renderProps: RenderProperties, msr: Measure, theme: Theme): void;
    SetBounds(msr: Measure, staff: number): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
}

interface MeasureProps {
    Instrument: Instrument;
    Bounds: Bounds;
    TimeSignature: {
        top: number;
        bottom: number;
    };
    KeySignature: string;
    Notes: Note[];
    Clef: string;
    RenderClef: boolean;
    RenderTimeSig: boolean;
    RenderKey: boolean;
    Camera: Camera;
    Page: Page;
    Message: (msg: Message) => void;
    Settings?: MeasureSettings;
}
declare class Measure implements ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Instrument: Instrument;
    Bounds: Bounds;
    Editable: boolean;
    Clefs: Clef[];
    GrandClefs: Clef[];
    TimeSignature: TimeSignature;
    KeySignature: string;
    Notes: Note[];
    BNotes: Note[];
    Divisions: Division[];
    BDivisions: Division[];
    RenderClef: boolean;
    RenderKey: boolean;
    RenderTimeSig: boolean;
    Camera: Camera;
    Page: Page;
    PageLine: Number;
    Message: (msg: Message) => void;
    XOffset: number;
    SALineTop: number;
    SALineMid: number;
    SALineBot: number;
    SALineTopSave: number;
    SALineBotSave: number;
    SALineTopDef: number;
    SALineBotDef: number;
    PrefBoundsY: number;
    PrevBoundsH: number;
    SBLineTop: number;
    SBLineMid: number;
    SBLineBot: number;
    SBLineTopSave: number;
    SBLineBotSave: number;
    SBLineTopDef: number;
    SBLineBotDef: number;
    SBOffset: number;
    Line: number;
    RunningID: {
        count: number;
    };
    constructor(properties: MeasureProps, runningId: {
        count: number;
    });
    static GetLineHovered(y: number, msr: Measure): {
        num: number;
        bounds: Bounds;
    };
    static GetNotePositionOnLine(msr: Measure, line: number): number;
    static GetMeasureHeight(msr: Measure, cam: Camera): number;
    static GetMeasureMidLine(msr: Measure): number;
    GetBoundsWithOffset(): Bounds;
    SetXOffset(): void;
    CreateDivisions(cam: Camera, afterInput?: boolean): void;
    Reposition(prevMsr: Measure): void;
    GetMeasureHeight(): number;
    GetGrandMeasureHeight(): number;
    GetGrandMeasureMidLine(): number;
    ResetHeight(): void;
    ReHeightenTop(expand: boolean, lineOver: number): void;
    ReHeightenBot(expand: boolean, lineOver: number): void;
    ReHeightenTopGrand(expand: boolean, lineOver: number): void;
    ReHeightenBotGrand(expand: boolean, lineOver: number): void;
    ResetTopHeight(): void;
    AddNote(note: Note, fromInput?: boolean): void;
    ClearNonRestNotes(beat: number, staff: number): void;
    ClearRestNotes(beat: number, staff: number): void;
    ClearMeasure(ignoreNotes?: Note[]): void;
    DeleteSelected(): void;
    GetMinimumWidth(): number;
    ReturnSelectableElements(): ISelectable[];
    IsHovered(x: number, y: number, cam: Camera): boolean;
    ChangeTimeSignature(top: number, bottom: number, transpose: boolean): void;
}

interface SheetProps {
    Instruments: Instrument[];
    KeySignature: {
        key: string;
        measureNo: number;
    }[];
    Measures: Measure[];
    Pages: Page[];
}
declare class Sheet {
    Instruments: Instrument[];
    KeySignature: {
        key: string;
        measureNo: number;
    }[];
    Measures: Measure[];
    Pages: Page[];
    constructor(properties: SheetProps);
}

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

interface KeyMapping {
    addmeasure: string;
    changeinputmode: string;
    value1: string;
    value2: string;
    value3: string;
    value4: string;
    value5: string;
    value6: string;
    restInput: string;
    delete: string;
    sharpen: string;
    flatten: string;
    scaleToggle: string;
    save: string;
    load: string;
    test_triplet: string;
}
declare function KeyPress(app: App, key: string, keyMaps: KeyMapping): void;

interface saveFile {
    name: string;
    file: string;
}

declare function ReturnLineFromMidi(clef: string, midi: number, staff?: number): number;
declare function ReturnMidiNumber(clef: string, line: number, acc?: number, staff?: number): number;
type MappedMidi = {
    NoteString: string;
    Frequency: number;
    Line: number;
    Accidental: number;
};
declare function GeneratePitchMap(): Map<number, MappedMidi>;

type CameraSettings = {
    DragEnabled?: boolean;
    ZoomEnabled?: boolean;
    StartingPosition?: {
        x: number;
        y: number;
    };
    Zoom?: number;
    CenterMeasures?: boolean;
    CenterPage?: boolean;
};
type PageSettings = {
    UsePages: boolean;
    RenderPage: boolean;
    RenderBackground: boolean;
    ContainerWidth?: boolean;
    PageWidth?: number;
    AutoSize?: boolean;
};
type MeasureFormatSettings = {
    MaxWidth?: number;
    Selectable?: boolean;
};
type MeasureSettings = {
    TopLine?: number;
    BottomLine?: number;
};
type FormatSettings = {
    MeasureFormatSettings?: MeasureFormatSettings;
};
type ConfigSettings = {
    CameraSettings?: CameraSettings;
    PageSettings?: PageSettings;
    FormatSettings?: FormatSettings;
    MeasureSettings?: MeasureSettings;
    NoteSettings?: NoteSettings;
    DefaultStaffType?: string;
    Theme: Theme;
};
type NoteSettings = {
    InputValue?: number;
};
type Theme = {
    NoteElements: string;
    SelectColour: string;
    UneditableColour: string;
    LineColour: string;
    BackgroundColour: string;
    PageColour: string;
    PageShadowColour: string;
};

declare class App {
    Config: ConfigSettings;
    Message: Message;
    Canvas: HTMLCanvasElement;
    Container: HTMLElement;
    Context: CanvasRenderingContext2D;
    Load: boolean;
    Sheet: Sheet;
    HoveredElements: {
        MeasureID: number;
    };
    NoteInput: boolean;
    RestInput: boolean;
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
    DragLiner(x: number, y: number): void;
    DragNote(x: number, y: number): void;
    StopNoteDrag(x: number, y: number): void;
    SetCameraDragging(dragging: boolean, x: number, y: number): void;
    AlterZoom(num: number): void;
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
}

interface lNote {
    ID: number;
    Beat: number;
    Duration: number;
    Line: number;
    Rest: boolean;
    Tied: boolean;
    Staff: number;
    Clef: string;
    Editable?: boolean;
}
interface lMeasure {
    Clef: string;
    TimeSignature: {
        top: number;
        bottom: number;
    };
    Notes: lNote[];
    Bounds: Bounds;
    ShowClef: boolean;
    ShowTime: boolean;
}
interface LoadStructure {
    Measures: lMeasure[];
}
declare const LoadSheet: (sheet: Sheet, page: Page, cam: Camera, instr: Instrument, savedJson: string, callback: (msg: Message) => void) => void;
declare const SaveSheet: (sheet: Sheet) => string;

declare namespace sheet {
    function CreateApp(canvas: HTMLCanvasElement, container: HTMLElement, doc: Document, keyMap: any, notifyCallBack: (msg: Message) => void, config: ConfigSettings): App;
    function ChangeInputMode(): void;
    function SetAccidental(acc: number): void;
    function Sharpen(): void;
    function Flatten(): void;
    function SetNoteValue(value: number): void;
    function AddMeasure(): void;
    function AddNoteOnMeasure(msr: Measure, noteVal: number, line: number, div: Division, rest: boolean): void;
    function Delete(): void;
    function SelectById(id: number): ISelectable;
    function ToggleFormatting(): void;
    function DeleteSelected(): void;
    function ChangeTimeSignature(top: number, bottom: number, transpose?: boolean): void;
}

export { App, ClearMessage, type ConfigSettings, GeneratePitchMap, type KeyMapping, KeyPress, LoadSheet, type LoadStructure, type MappedMidi, type MeasureSettings, type Message, MessageType, Note, type NoteProps, ReturnLineFromMidi, ReturnMidiNumber, SaveSheet, type Theme, type TupleDetails, type lMeasure, type lNote, sheet };
