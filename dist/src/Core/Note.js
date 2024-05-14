import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
class Note {
    constructor(props) {
        this.Beat = props.Beat;
        this.Duration = props.Duration;
        this.Line = props.Line;
        this.Rest = props.Rest;
        this.Tied = props.Tied;
        this.Accidental = 0;
        this.Staff = props.Staff;
        this.Selected = false;
        this.SelType = SelectableTypes.Note;
        this.Bounds = new Bounds(0, 0, 0, 0);
        this.Bounds.width = 12;
        this.Bounds.height = 10;
        this.ID = -1;
        this.Tuple = props.Tuple;
        if (props.TupleDetails) {
            this.TupleDetails = props.TupleDetails;
        }
        // note position is not based on bounds property
    }
    SetBounds(bounds) {
        this.Bounds = bounds;
    }
    SetID(id) {
        this.ID = id;
    }
    SetTiedStartEnd(s, e) {
        this.TiedStart = s;
        this.TiedEnd = e;
    }
}
export { Note };
