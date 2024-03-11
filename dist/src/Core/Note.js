import { Bounds } from "../Types/Bounds.js";
class Note {
    constructor(props) {
        this.Beat = props.Beat;
        this.Duration = props.Duration;
        this.Line = props.Line;
        this.Rest = props.Rest;
        this.Tied = props.Tied;
        this.Accidental = 0;
        this.Selected = false;
        this.Bounds = new Bounds(0, 0, 0, 0);
        this.Bounds.width = 12;
        this.Bounds.height = 10;
        // note position is not based on bounds property
    }
    SetBounds(bounds) {
        this.Bounds = bounds;
    }
    SetTiedStartEnd(s, e) {
        this.TiedStart = s;
        this.TiedEnd = e;
    }
}
export { Note };
