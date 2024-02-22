var Note = /** @class */ (function () {
    function Note(props) {
        this.Beat = props.Beat;
        this.Duration = props.Duration;
        this.Line = props.Line;
        this.Selected = false;
    }
    Note.prototype.SetBounds = function (bounds) {
        this.Bounds = bounds;
    };
    return Note;
}());
export { Note };
