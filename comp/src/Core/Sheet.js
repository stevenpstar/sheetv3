import { CreateDefaultMeasure, CreateInstrument, } from "../Factory/Instrument.Factory.js";
import { UpdateNoteBounds } from "../Workers/NoteInput.js";
import { Page } from "./Page.js";
class Sheet {
    constructor(properties) {
        this.Instruments = properties.Instruments;
        this.KeySignature = properties.KeySignature;
        this.Measures = properties.Measures;
        this.Pages = properties.Pages;
    }
    InputHover(x, y, camera) {
        this.Measures.forEach((m) => {
            if (m.GetBoundsWithOffset().IsHovered(x, y, camera)) {
                m.Divisions.forEach((d) => {
                    if (d.Bounds.IsHovered(x, y, camera)) {
                        m.Staves.forEach((s) => {
                            UpdateNoteBounds(m, s.Num);
                        });
                    }
                });
            }
        });
    }
}
function CreateDefaultSheet(config, camera, callback) {
    var _a;
    let newPage = new Page(0, 0, 1);
    if ((_a = config.PageSettings) === null || _a === void 0 ? void 0 : _a.PageWidth) {
        newPage.Bounds.width = config.PageSettings.PageWidth;
    }
    const sProps = {
        Instruments: [],
        KeySignature: [{ key: "CMaj/Amin", measureNo: 0 }],
        Measures: [],
        Pages: [newPage],
    };
    const page = sProps.Pages[0];
    sProps.Instruments.push(CreateInstrument(20, config));
    sProps.Measures.push(CreateDefaultMeasure({ count: 0 }, sProps.Instruments[0], page, camera, callback, config.MeasureSettings));
    return new Sheet(sProps);
}
export { Sheet, CreateDefaultSheet };
