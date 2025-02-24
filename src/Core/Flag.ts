import { Flags, RenderSymbol } from "../Renderers/MusicFont.Renderer.js";
import { StemDirection } from "../Renderers/Note.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { ISelectable, SelectableTypes } from "../Types/ISelectable.js";
import { RenderProperties } from "../Types/RenderProperties.js";
import { Theme } from "../entry.js";
import { Camera } from "./Camera.js";
import { DivGroup } from "./Division.js";
import { Stem } from "./Stem.js";
import { NoteValues } from "./Values.js";

enum FlagDirection {
  UP,
  DOWN,
}

class Flag implements ISelectable {
  ID: number;
  Selected: boolean = false;
  Editable: boolean;
  SelType: SelectableTypes = SelectableTypes.Flag;
  Bounds: Bounds;
  Direction: FlagDirection;
  Duration: number;

  constructor(bounds: Bounds, flagDir: FlagDirection, duration: number) {
    this.Selected = false;
    this.Editable = false;
    this.Bounds = this.SetBounds(bounds);
    this.Direction = flagDir;
    this.Duration = duration;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }

  SetBounds(bounds: Bounds): Bounds {
    return new Bounds(bounds.x, bounds.y + bounds.height, 10, 10);
  }

  Render(renderProps: RenderProperties, theme: Theme): void {
    RenderSymbol(
      renderProps,
      GetFlagSymbol(this.Duration, this.Direction),
      this.Bounds.x,
      this.Bounds.y,
      theme,
      this.Selected,
    );

    this.RenderBounds(renderProps.context, renderProps.camera);
  }

  RenderBounds(context: CanvasRenderingContext2D, cam: Camera): void {
    context.strokeStyle = "rgba(255, 0, 0, 255)";
    context.strokeRect(
      this.Bounds.x + cam.x,
      this.Bounds.y + cam.y,
      this.Bounds.width,
      this.Bounds.height,
    );
  }
}

function GetFlagSymbol(value: number, flagDir: FlagDirection): Flags {
  if (value < NoteValues.n4 && value >= NoteValues.n8) {
    return flagDir === FlagDirection.UP ? Flags.QuaverUp : Flags.QuaverDown;
  } else if (value < NoteValues.n8 && value >= NoteValues.n16) {
    return flagDir === FlagDirection.UP
      ? Flags.SemiQuaverUp
      : Flags.SemiQuaverDown;
  } else if (value < NoteValues.n16 && value >= NoteValues.n32) {
    return flagDir === FlagDirection.UP
      ? Flags.DemiSemiQuaverUp
      : Flags.DemiSemiQuaverDown;
  } else if (value < NoteValues.n32) {
    return flagDir === FlagDirection.UP
      ? Flags.HemiDemiSemiQuaverUp
      : Flags.HemiDemiSemiQuaverDown;
  }
  return flagDir === FlagDirection.UP ? Flags.QuaverUp : Flags.QuaverDown;
}

function CreateFlags(group: DivGroup): Flag[] {
  const flags: Flag[] = [];
  group.Stems.forEach((s: Stem) => {
    let flagDir: FlagDirection = FlagDirection.DOWN;
    flagDir =
      group.StemDir === StemDirection.Up
        ? FlagDirection.DOWN
        : FlagDirection.UP;
    flags.push(new Flag(s.Bounds, flagDir, s.Division.Duration));
  });
  return flags;
}

export { Flag, CreateFlags };
