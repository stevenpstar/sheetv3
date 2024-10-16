import { allSaves } from "../testsaves.js";
function KeyPress(app, key, keyMaps) {
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
            app.SetNoteValue(1);
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
            break;
        case keyMaps.save:
            app.Save();
            break;
        case keyMaps.load:
            app.LoadSheet(allSaves[0].file);
            break;
        case keyMaps.test_triplet:
            app.CreateTriplet();
            break;
        case keyMaps.debug_clear:
            localStorage.removeItem("persist");
            localStorage.removeItem("camera_data");
            break;
        default:
    }
}
export { KeyPress };
