type CameraSettings = {
  DragEnabled?: boolean;
  ZoomEnabled?: boolean;
  StartingPosition?: {x: number, y: number};
  Zoom?: number;
  CenterMeasures?: boolean;
  CenterPage?: boolean;
}

type PageSettings = {
  UsePages: boolean;
  RenderPage: boolean;
  RenderBackground: boolean;
  ContainerWidth?: boolean; // set container to width
  PageWidth?: number;
  AutoSize?: boolean;
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
  DefaultStaffType?: string;
  Theme: Theme;
}

type NoteSettings = {
  InputValue?: number;
}

type Theme = {
  NoteElements: string;
  SelectColour: string;
  UneditableColour: string;
  LineColour: string;
  BackgroundColour: string;
  PageColour: string;
  PageShadowColour: string;
}

export { ConfigSettings, Theme }
