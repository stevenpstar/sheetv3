import { sheet } from "./src/entry.js";
const keymaps = {
    rerender: "'",
    addmeasure: "a",
    changeinputmode: "n",
    value1: "1",
    value2: "2",
    value3: "3",
    value4: "4",
    value5: "5",
    value6: "6",
    restInput: "r",
    delete: "d",
    sharpen: "+",
    flatten: "-",
    scaleToggle: "'",
    save: "s",
    load: "l",
    test_triplet: "t",
    debug_clear: "c",
    beam: "b",
    grace: "g",
    change_barline: "z",
};
const defaultTheme = {
    NoteElements: "black",
    SelectColour: "blue",
    UneditableColour: "gray",
    LineColour: "black",
    BackgroundColour: "darkgray",
    PageColour: "white",
    PageShadowColour: "gray",
};
const _darkTheme = {
    NoteElements: "black",
    SelectColour: "#f08080",
    UneditableColour: "#303745",
    LineColour: "#465063",
    BackgroundColour: "black",
    PageColour: "#262b36",
    PageShadowColour: "#15191f",
};
const test_CONFIG = {
    CameraSettings: {
        DragEnabled: true,
        ZoomEnabled: true,
        Zoom: 1.7,
        StartingPosition: { x: 20, y: 20 },
        CenterMeasures: false,
        CenterPage: false,
    },
    FormatSettings: {
        MeasureFormatSettings: { Selectable: false },
    },
    NoteSettings: {
        InputValue: 0.5,
    },
    PageSettings: {
        UsePages: true,
        RenderPage: true,
        RenderBackground: true,
        ContainerWidth: false,
        AutoSize: false,
    },
    DefaultStaffType: "single",
    Theme: defaultTheme,
};
function returnCanvas(id) {
    const canvas = document.getElementById(id);
    const context = canvas.getContext("2d");
    if (canvas === null ||
        canvas === undefined ||
        context === null ||
        context === undefined) {
        console.error("Canvas not found");
    }
    else {
        context.setTransform(1, 0, 0, 1, 0, 0);
    }
    return { canvas: canvas, context: context };
}
function notify(msg) { }
/* Globals */
const { canvas, context } = returnCanvas("canvas");
let Application;
function main() {
    // Application = new App(canvas, context);
    Application = sheet.CreateApp(canvas, document.getElementById("canvas-container"), document, keymaps, notify, test_CONFIG);
}
main();
