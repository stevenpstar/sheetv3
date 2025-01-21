import { BeamDirection, StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { Vector2 } from "../Types/Vectors.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { DivGroup } from "./Division.js";
import { Measure } from "./Measure.js";
declare function DetermineBeamDirection(measure: Measure, divGroup: DivGroup, stemDir: StemDirection): BeamDirection;
declare function GenerateBeams(measure: Measure, divGroup: DivGroup, stemDir: StemDirection): Beam;
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
export { Beam, GenerateBeams, DetermineBeamDirection };
//# sourceMappingURL=Beam.d.ts.map