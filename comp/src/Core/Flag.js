import { Flags, RenderSymbol } from "../Renderers/MusicFont.Renderer.js";
import { StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
import { NoteValues } from "./Values.js";
var FlagDirection;
(function (FlagDirection) {
    FlagDirection[FlagDirection["UP"] = 0] = "UP";
    FlagDirection[FlagDirection["DOWN"] = 1] = "DOWN";
})(FlagDirection || (FlagDirection = {}));
class Flag {
    constructor(bounds, flagDir, duration) {
        this.Selected = false;
        this.SelType = SelectableTypes.Flag;
        this.Selected = false;
        this.Editable = false;
        this.Bounds = this.SetBounds(bounds);
        this.Direction = flagDir;
        this.Duration = duration;
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
    SetBounds(bounds) {
        return new Bounds(bounds.x, bounds.y + bounds.height, 10, 10);
    }
    Render(renderProps, theme) {
        RenderSymbol(renderProps, GetFlagSymbol(this.Duration, this.Direction), this.Bounds.x, this.Bounds.y, theme, this.Selected);
        this.RenderBounds(renderProps.context, renderProps.camera);
    }
    RenderBounds(context, cam) {
        context.strokeStyle = "rgba(255, 0, 0, 255)";
        context.strokeRect(this.Bounds.x + cam.x, this.Bounds.y + cam.y, this.Bounds.width, this.Bounds.height);
    }
}
function GetFlagSymbol(value, flagDir) {
    if (value < NoteValues.n4 && value >= NoteValues.n8) {
        return flagDir === FlagDirection.UP ? Flags.QuaverUp : Flags.QuaverDown;
    }
    else if (value < NoteValues.n8 && value >= NoteValues.n16) {
        return flagDir === FlagDirection.UP
            ? Flags.SemiQuaverUp
            : Flags.SemiQuaverDown;
    }
    else if (value < NoteValues.n16 && value >= NoteValues.n32) {
        return flagDir === FlagDirection.UP
            ? Flags.DemiSemiQuaverUp
            : Flags.DemiSemiQuaverDown;
    }
    else if (value < NoteValues.n32) {
        return flagDir === FlagDirection.UP
            ? Flags.HemiDemiSemiQuaverUp
            : Flags.HemiDemiSemiQuaverDown;
    }
    return flagDir === FlagDirection.UP ? Flags.QuaverUp : Flags.QuaverDown;
}
function CreateFlags(group) {
    const flags = [];
    group.Stems.forEach((s) => {
        let flagDir = FlagDirection.DOWN;
        flagDir =
            group.StemDir === StemDirection.Up
                ? FlagDirection.DOWN
                : FlagDirection.UP;
        flags.push(new Flag(s.Bounds, flagDir, s.Division.Duration));
    });
    return flags;
}
export { Flag, CreateFlags };
