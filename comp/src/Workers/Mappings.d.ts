import { App } from "../App.js";
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
    test_triplet: string;
    debug_clear: string;
    beam: string;
    grace: string;
    change_barline: string;
}
declare function KeyPress(app: App, key: string, keyMaps: KeyMapping): void;
export { KeyMapping, KeyPress };
//# sourceMappingURL=Mappings.d.ts.map