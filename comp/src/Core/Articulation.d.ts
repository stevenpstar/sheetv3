import { Division } from "./Division.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Note, Theme } from "../entry.js";
import { Staff } from "./Staff.js";
import { Voice } from "./Voice.js";
declare enum ArticulationType {
    NONE = 0,
    ACCENT = 1
}
declare class Articulation {
    Type: ArticulationType;
    Beat: number;
    Staff: number;
    Voice: Voice;
    constructor(type: ArticulationType, beat: number, staff: number, voice: Voice);
    Render(renderProps: RenderProperties, notes: Note[], staves: Staff[], div: Division, theme: Theme): void;
}
export { Articulation, ArticulationType };
//# sourceMappingURL=Articulation.d.ts.map