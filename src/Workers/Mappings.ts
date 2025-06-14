import { App } from "../App.js";
import { ArticulationType } from "../Core/Articulation.js";
import { BarlineType } from "../Core/Barline.js";
import { NoteValues } from "../Core/Values.js";
import { Clefs } from "../Renderers/MusicFont.Renderer.js";
import { allSaves } from "../testsaves.js";

interface KeyMapping {
  addmeasure: string;
  changeinputmode: string;
  value1: string;
  value2: string;
  value3: string;
  value4: string;
  value5: string;
  value6: string;
  restInput: string;
  delete: string;
  sharpen: string;
  flatten: string;
  scaleToggle: string;
  save: string;
  load: string;
  test_tuplet: string;
  debug_clear: string;
  beam: string;
  grace: string;
  change_timesig: string; // TEST KEYMAP
  add_dynamic: string;
  cycle_voice: string;
  add_barline: string;
  add_accent: string;
  add_clef: string;
  undo: string;
  redo: string;
}

function KeyPress(app: App, key: string, keyMaps: KeyMapping): void {
  switch (key) {
    case keyMaps.addmeasure:
      app.AddMeasure();
      break;
    case keyMaps.changeinputmode:
      app.ChangeInputMode();
      break;
    //TODO: change value1-6 to note types (crotchet, quaver etc.)
    case keyMaps.value1:
      app.SetNoteValue(0.03125);
      break;
    case keyMaps.value2:
      app.SetNoteValue(0.0625);
      break;
    case keyMaps.value3:
      app.SetNoteValue(0.125);
      break;
    case keyMaps.value4:
      app.SetNoteValue(0.25);
      break;
    case keyMaps.value5:
      app.SetNoteValue(0.5);
      break;
    case keyMaps.value6:
      app.SetNoteValue(NoteValues.n1);
      break;
    case keyMaps.restInput:
      //TODO: Prob change this
      app.RestInput = !app.RestInput;
      break;
    case keyMaps.delete:
      app.Delete();
      break;
    case keyMaps.sharpen:
      app.Sharpen();
      break;
    case keyMaps.flatten:
      app.Flatten();
      break;
    case keyMaps.scaleToggle:
      //app.ScaleToggle();
      app.AddClef();
      break;
    case keyMaps.save:
      app.Save();
      break;
    case keyMaps.load:
      app.LoadSheet(allSaves[0].file);
      break;
    case keyMaps.test_tuplet:
      app.CreateTuplet(5);
      break;
    case keyMaps.debug_clear:
      localStorage.removeItem("persist");
      localStorage.removeItem("camera_data");
      break;
    case keyMaps.beam:
      app.BeamSelectedNotes();
      break;
    case keyMaps.grace:
      app.GraceInput = !app.GraceInput;
      break;
    case keyMaps.change_timesig:
      app.ChangeTimeSig();
      break;
    case keyMaps.add_dynamic:
      app.AddDynamic("f");
      break;
    case keyMaps.cycle_voice:
      app.CycleActiveVoice();
      break;
    case keyMaps.add_barline:
      // TODO: This will be selected in some way through UI and not hard coded
      const barlineType: BarlineType = BarlineType.REPEAT_END;
      app.ChangeBarline(barlineType);
      break;
    case keyMaps.add_accent:
      app.AddArticulation(ArticulationType.ACCENT);
      break;
    case keyMaps.add_clef:
      app.AddClef();
    case keyMaps.undo:
      app.Undo();
      break;
    case keyMaps.redo:
      app.Redo();
      break;
    default:
  }
}

export { KeyMapping, KeyPress };
