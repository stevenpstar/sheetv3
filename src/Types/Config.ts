type CameraSettings = {
  DragEnabled?: boolean;
  ZoomEnabled?: boolean;
  StartingPosition?: {x: number, y: number};
  Zoom?: number;
  CenterMeasures?: boolean;
}

type PageSettings = {
  RenderPage: boolean;
  RenderBackground: boolean;
  ContainerWidth?: boolean; // set container to width
}

type MeasureFormatSettings = {
  MaxWidth?: number;
  Selectable?: boolean;
}

type FormatSettings = {
  MeasureFormatSettings?: MeasureFormatSettings;
}

type ConfigSettings = {
  CameraSettings?: CameraSettings;
  PageSettings?: PageSettings;
  FormatSettings?: FormatSettings;
  NoteSettings?: NoteSettings;
}

type NoteSettings = {
  InputValue?: number;
}

export { ConfigSettings }
