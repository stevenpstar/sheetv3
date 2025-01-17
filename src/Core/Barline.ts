import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Camera } from "./Camera.js";

enum BarlineType {
  STANDARD,
  REPEAT_BEGIN,
  REPEAT_END,
}

enum BarlinePos {
  START,
  END,
}

class Barline implements ISelectable {
  ID: number;
  Selected: boolean;
  SelType: SelectableTypes;
  Bounds: Bounds;
  Editable: boolean;
  Position: BarlinePos;
  Type: BarlineType;

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }

  Render() {}
}

export { Barline, BarlineType };
