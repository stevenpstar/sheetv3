type CameraSettings = {
    DragEnabled?: boolean;
    ZoomEnabled?: boolean;
    StartingPosition?: {
        x: number;
        y: number;
    };
    Zoom?: number;
    CenterMeasures?: boolean;
};
type PageSettings = {
    RenderPage: boolean;
    RenderBackground: boolean;
    ContainerWidth?: boolean;
};
type MeasureFormatSettings = {
    MaxWidth?: number;
};
type FormatSettings = {
    MeasureFormatSettings?: MeasureFormatSettings;
};
type ConfigSettings = {
    CameraSettings?: CameraSettings;
    PageSettings?: PageSettings;
    FormatSettings?: FormatSettings;
    NoteSettings?: NoteSettings;
};
type NoteSettings = {
    InputValue?: number;
};
export { ConfigSettings };
//# sourceMappingURL=Config.d.ts.map