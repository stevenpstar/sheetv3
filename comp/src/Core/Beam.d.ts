import { BeamDirection, StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { DivGroup } from "./Division.js";
import { Measure } from "./Measure.js";
declare function DetermineBeamDirection(measure: Measure, divGroup: DivGroup, stemDir: StemDirection): BeamDirection;
declare function GenerateBeams(measure: Measure, divGroup: DivGroup, stemDir: StemDirection): Beam;
declare class Beam {
    Bounds: Bounds;
    Direction: string;
    StartPoint: {
        x: number;
        y: number;
    };
    EndPoint: {
        x: number;
        y: number;
    };
    constructor(bounds: Bounds, start: {
        x: number;
        y: number;
    }, end: {
        x: number;
        y: number;
    });
    Render(context: CanvasRenderingContext2D, cam: Camera, count: number, stemDir: StemDirection, theme: Theme): void;
    static BeamCount(duration: number): number;
}
export { Beam, GenerateBeams, DetermineBeamDirection };
//# sourceMappingURL=Beam.d.ts.map