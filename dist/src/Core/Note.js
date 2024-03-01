class Note {
    constructor(props) {
        this.Beat = props.Beat;
        this.Duration = props.Duration;
        this.Line = props.Line;
        this.Rest = props.Rest;
        this.Tied = props.Tied;
        this.Selected = false;
    }
    SetBounds(bounds) {
        this.Bounds = bounds;
    }
}
export { Note };
