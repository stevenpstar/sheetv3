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

declare class Camera {
    Dragging: boolean;
    DraggingX: number;
    DraggingY: number;
    x: number;
    y: number;
    oldX: number;
    oldY: number;
    Zoom: number;
    constructor(x: number, y: number);
    SetDragging(drag: boolean, x: number, y: number, config: ConfigSettings, cam: Camera): void;
    DragCamera(mx: number, my: number): boolean;
    SetZoom(zoom: number): void;
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
    Stem = 6,
    Barline = 7
}
interface ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds | Bounds[];
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
    Grace: boolean;
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
    Grace: boolean;
    OutOfBounds: boolean;
    Opacity: number;
    TiedStart: number;
    TiedEnd: number;
    Bounds: Bounds;
    Selected: boolean;
    Staff: number;
    StaffGroup: number;
    Tuple: boolean;
    TupleDetails?: TupleDetails;
    constructor(props: NoteProps);
    SetBounds(bounds: Bounds): void;
    SetID(id: number): void;
    SetTiedStartEnd(s: number, e: number): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
    GetMidiNumber(): number;
}

interface RenderProperties {
    context: CanvasRenderingContext2D;
    camera: Camera;
}

declare enum StemDirection {
    Up = 0,
    Down = 1
}

type Vector2 = {
    x: number;
    y: number;
};

declare class Beam implements ISelectable {
    ID: number;
    Selected: boolean;
    Bounds: Bounds;
    SelType: SelectableTypes;
    Editable: boolean;
    Direction: string;
    StartPoint: Vector2;
    EndPoint: Vector2;
    Count: number;
    constructor(bounds: Bounds, start: Vector2, end: Vector2, count?: number);
    IsHovered(x: number, y: number, cam: Camera): boolean;
    Render(context: CanvasRenderingContext2D, cam: Camera, count: number, stemDir: StemDirection, theme: Theme): void;
    RenderBounds(context: CanvasRenderingContext2D, cam: Camera): void;
    static BeamCount(duration: number, tuplet?: boolean): number;
}

declare class Stem implements ISelectable {
    ID: number;
    Selected: boolean;
    Bounds: Bounds;
    SelType: SelectableTypes.Stem;
    Editable: boolean;
    Direction: string;
    StartPoint: number;
    EndPoint: number;
    Staff: number;
    constructor(bounds: Bounds);
    IsHovered(x: number, y: number, cam: Camera): boolean;
    Render(context: CanvasRenderingContext2D, cam: Camera, theme: Theme): void;
    RenderBounds(context: CanvasRenderingContext2D, cam: Camera): void;
}

declare enum SubdivisionType {
    CLEF = 0,
    GRACE_NOTE = 1,
    NOTE = 2
}
type Subdivision = {
    Type: SubdivisionType;
    Bounds: Bounds;
};
interface Division {
    Beat: number;
    Duration: number;
    Bounds: Bounds;
    Staff: number;
    StaffGroup: number;
    Direction: StemDirection;
    NoteXBuffer: number;
    Subdivisions: Subdivision[];
}
interface DivGroup {
    Divisions: Division[];
    Notes: Array<Note[]>;
    CrossStaff: boolean;
    Staff: number;
    Beams: Beam[];
    Stems: Stem[];
    StemDir?: StemDirection;
}

declare enum ArticulationType {
    NONE = 0,
    ACCENT = 1
}
declare class Articulation {
    Type: ArticulationType;
    Beat: number;
    Staff: number;
    constructor(type: ArticulationType, beat: number, staff: number);
    Render(renderProps: RenderProperties, notes: Note[], staves: Staff[], div: Division, theme: Theme): void;
}

declare enum BarlineType {
    SINGLE = 0,
    DOUBLE = 1,
    END = 2,
    REPEAT_BEGIN = 3,
    REPEAT_END = 4
}
declare enum BarlinePos {
    START = 0,
    END = 1
}
declare class Barline implements ISelectable {
    ID: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Bounds: Bounds;
    Editable: boolean;
    Position: BarlinePos;
    Type: BarlineType;
    constructor(pos: BarlinePos, type: BarlineType);
    IsHovered(x: number, y: number, cam: Camera): boolean;
}

declare class Clef implements ISelectable {
    ID: number;
    Selected: boolean;
    Staff: number;
    Position: {
        x: number;
        y: number;
    };
    Bounds: Bounds;
    SelType: SelectableTypes;
    Type: string;
    Beat: number;
    Editable: boolean;
    constructor(id: number, type: string, beat: number, staff: number);
    render(renderProps: RenderProperties, theme: Theme): void;
    SetBounds(msr: Measure, staff: number): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
}

declare class Dynamic implements ISelectable {
    Symbol: string;
    Staff: number;
    Beat: number;
    Selected: boolean;
    Editable: boolean;
    Bounds: Bounds;
    SelType: SelectableTypes;
    ID: number;
    constructor(symbol: string, staff: number, beat: number);
    IsHovered(x: number, y: number, cam: Camera): boolean;
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
    Bounds: Bounds[];
    Editable: boolean;
    top: number;
    bottom: number;
    TopPosition: {
        x: number;
        y: number;
    }[];
    BotPosition: {
        x: number;
        y: number;
    }[];
    constructor(top: number, bottom: number, useSymbol?: boolean);
    render(renderProps: RenderProperties, msr: Measure, theme: Theme): void;
    SetBounds(msr: Measure): void;
    IsHovered(x: number, y: number, cam: Camera): boolean;
}

declare class Voice {
    Notes: Note[];
    Divisions: Division[];
    DivisionGroups: DivGroup[];
    constructor();
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
    Staves: Staff[];
    Clefs: Clef[];
    RenderClef: boolean;
    RenderTimeSig: boolean;
    RenderKey: boolean;
    Camera: Camera;
    Page: Page;
    Message: (msg: Message) => void;
    Settings?: MeasureSettings;
    Barlines: Barline[];
}
declare class Measure implements ISelectable {
    ID: number;
    Num: number;
    Selected: boolean;
    SelType: SelectableTypes;
    Instrument: Instrument;
    Bounds: Bounds;
    Editable: boolean;
    RenderClef: boolean;
    RenderKey: boolean;
    RenderTimeSig: boolean;
    Camera: Camera;
    Page: Page;
    PageLine: Number;
    Message: (msg: Message) => void;
    TimeSignature: TimeSignature;
    KeySignature: string;
    Voices: Voice[];
    ActiveVoice: number;
    Clefs: Clef[];
    Staves: Staff[];
    Barlines: Barline[];
    Articulations: Articulation[];
    Dynamics: Dynamic[];
    XOffset: number;
    Line: number;
    RunningID: {
        count: number;
    };
    constructor(properties: MeasureProps, runningId: {
        count: number;
    });
    GetLineHovered(y: number, staffNum: number): {
        num: number;
        bounds: Bounds;
    };
    GetNotePositionOnLine(line: number, staff: number): number;
    GetBoundsWithOffset(): Bounds;
    SetXOffset(): void;
    CreateDivisions(cam: Camera): void;
    Reposition(prevMsr: Measure): void;
    GetMeasureHeight(): number;
    AddNote(note: Note, fromInput?: boolean): void;
    ClearNonRestNotes(beat: number, staff: number): void;
    ClearRestNotes(beat: number, staff: number): void;
    ClearMeasure(ignoreNotes?: Note[]): void;
    DeleteSelected(): void;
    GetMinimumWidth(): number;
    ReturnSelectableElements(): ISelectable[];
    IsHovered(x: number, y: number, cam: Camera): boolean;
    ChangeTimeSignature(top: number, bottom: number, transpose: boolean): void;
    RecalculateBarlines(): void;
}

declare class Staff {
    Num: number;
    TopLine: number;
    MidLine: number;
    BotLine: number;
    Buffer: number;
    constructor(num: number);
}

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
    Staves: Staff[];
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
    InputHover(x: number, y: number, camera: Camera): void;
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
    debug_clear: string;
    beam: string;
    grace: string;
    change_timesig: string;
    add_dynamic: string;
    cycle_voice: string;
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
declare function FromPitchMap(midiNote: number, map: Map<number, MappedMidi>, clef: string): MappedMidi;

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
    Grace: boolean;
}
interface lMeasure {
    Clefs: Clef[];
    Staves: Staff[];
    TimeSignature: {
        top: number;
        bottom: number;
    };
    KeySignature: string;
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
    function AddArticulation(type: ArticulationType): void;
    function AddStaff(instrIndex: number, clefString: string): void;
    function AddNoteOnMeasure(msr: Measure, noteVal: number, line: number, div: Division, rest: boolean): void;
    function Delete(): void;
    function SelectById(id: number): ISelectable;
    function ToggleFormatting(): void;
    function DeleteSelected(): void;
    function ChangeTimeSignature(top: number, bottom: number, transpose?: boolean): void;
}

export { App, ClearMessage, type ConfigSettings, FromPitchMap, GeneratePitchMap, type KeyMapping, KeyPress, LoadSheet, type LoadStructure, type MappedMidi, type MeasureSettings, type Message, MessageType, Note, type NoteProps, ReturnLineFromMidi, ReturnMidiNumber, SaveSheet, type Theme, type TupleDetails, type lMeasure, type lNote, sheet };
