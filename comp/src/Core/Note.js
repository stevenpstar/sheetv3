import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
import { ReturnMidiNumber } from "../Workers/Pitcher.js";
class Note {
    constructor(props) {
        this.Beat = props.Beat;
        this.Duration = props.Duration;
        this.Line = props.Line;
        this.Rest = props.Rest;
        this.Tied = props.Tied;
        this.Accidental = 0;
        this.Staff = props.Staff;
        this.Clef = props.Clef;
        this.Grace = props.Grace;
        this.Selected = false;
        this.SelType = SelectableTypes.Note;
        this.Bounds = new Bounds(0, 0, 0, 0);
        this.Bounds.width = 12;
        this.Bounds.height = 10;
        this.Editable = props.Editable !== undefined ? props.Editable : true;
        this.ID = -1;
        this.Tuple = props.Tuple;
        if (props.TupleDetails) {
            this.TupleDetails = props.TupleDetails;
        }
        // note position is not based on bounds property
        this.Opacity = 1.0;
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
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
    GetMidiNumber() {
        const line = this.Staff === 0 ? this.Line : this.Line - 1000;
        return ReturnMidiNumber(this.Clef, line, this.Staff);
    }
}
export { Note };
