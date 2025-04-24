import { Flags, RenderScaledSymbol, RenderSymbol } from "../Renderers/MusicFont.Renderer.js";
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
  Scale: number;

  constructor(bounds: Bounds, flagDir: FlagDirection, duration: number, scale: number = 1.0) {
    this.Selected = false;
    this.Editable = false;
    this.Direction = flagDir;
    this.Duration = duration;
    this.Bounds = this.SetBounds(bounds);
    this.Scale = scale;
  }

  IsHovered(x: number, y: number, cam: Camera): boolean {
    return this.Bounds.IsHovered(x, y, cam);
  }

  SetBounds(bounds: Bounds): Bounds {
    let yBuffer = bounds.height;
    // TODO: Temporary, stem height may need to be lengthened when flagged at
    // faster / shorter durations
    if (this.Duration <= NoteValues.n32) {
      yBuffer = this.Direction === FlagDirection.UP ? yBuffer - 6 : yBuffer + 6;
    }
    return new Bounds(bounds.x + 1, bounds.y + yBuffer, 10, 30);
  }

  Render(renderProps: RenderProperties, theme: Theme): void {
    RenderScaledSymbol(
      renderProps,
      GetFlagSymbol(this.Duration, this.Direction),
      this.Bounds.x,
      this.Bounds.y,
      theme,
      this.Selected,
      Math.floor(40 * this.Scale),
    );

    //    this.RenderBounds(renderProps.context, renderProps.camera);
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
  // TODO: This will likely need to be reworked at some point
  const flags: Flag[] = [];
  let graceDivGroup = false;
  let flagDuration = 0;
  let scale = 1.0;
  if (group.Notes.length === 0) {
    return [];
  }
  if (group.Notes[0].length === 0) {
    return [];
  }
  if (group.Notes[0][0].Grace) {
    graceDivGroup = true;
    scale = 0.6;
    if (group.Notes[0][0].Duration >= 0.25) {
      return [];
    }
  }
  if (group.Divisions[0].Duration >= 0.25 && !graceDivGroup) {
    return [];
  }
  group.Stems.forEach((s: Stem) => {
    if (!graceDivGroup) {
      flagDuration = s.Division.Duration;
    } else {
      flagDuration = group.Notes[0][0].Duration;
    }
    let flagDir: FlagDirection = FlagDirection.DOWN;
    flagDir =
      group.StemDir === StemDirection.Up
        ? FlagDirection.DOWN
        : FlagDirection.UP;
    flags.push(new Flag(s.Bounds, flagDir, flagDuration, scale));
  });
  return flags;
}

export { Flag, CreateFlags };
