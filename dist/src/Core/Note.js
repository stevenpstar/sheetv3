class Note {
    constructor(props) {
        this.Beat = props.Beat;
        this.Duration = props.Duration;
        this.Line = props.Line;
        this.Selected = false;
    }
    SetBounds(bounds) {
        this.Bounds = bounds;
    }
}
export { Note };
