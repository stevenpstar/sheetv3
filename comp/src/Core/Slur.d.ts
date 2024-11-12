import { RenderProperties } from "../Types/RenderProperties.js";
import { Note } from "./Note.js";
declare class Slur {
    NoteStart: Note;
    NoteEnd: Note;
    constructor();
    render(renderProps: RenderProperties): void;
}
export { Slur };
//# sourceMappingURL=Slur.d.ts.map