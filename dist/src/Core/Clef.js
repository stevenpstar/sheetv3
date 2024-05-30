import { Clefs, RenderSymbol } from "../Renderers/MusicFont.Renderer.js";
import { Bounds } from "../Types/Bounds.js";
import { SelectableTypes } from "../Types/ISelectable.js";
import { StaffType } from "./Instrument.js";
import { Measure } from "./Measure.js";
// SVG Paths
const bassClef = 'm0 0c0-1.276 1.012-2.288 2.288-2.288s2.288 1.012 2.288 2.288-1.012 2.288-2.288 2.288-2.288-1.012-2.288-2.288zm0-11c0-1.276 1.012-2.288 2.288-2.288s2.288 1.012 2.288 2.288-1.012 2.288-2.288 2.288-2.288-1.012-2.288-2.288zm-14.212-5.984c7.524 0 12.848 3.784 12.848 10.912 0 11.572-11.616 18.26-22.748 22.924-.088.088-.22.132-.352.132-.264 0-.484-.22-.484-.484 0-.132.044-.264.132-.352 8.932-5.192 18.26-11.66 18.26-21.736 0-5.324-2.816-10.428-7.656-10.428-3.476 0-6.072 2.508-7.216 5.852.616-.352 1.232-.572 1.892-.572 2.42 0 4.4 1.98 4.4 4.4 0 2.552-1.936 4.708-4.4 4.708-2.64 0-4.928-2.112-4.928-4.708 0-5.808 4.532-10.648 10.252-10.648z';
const bassClefSmall = 'm0 0c0-1.0208.8096-1.8304 1.8304-1.8304s1.8304.8096 1.8304 1.8304-.8096 1.8304-1.8304 1.8304-1.8304-.8096-1.8304-1.8304zm0-8.8c0-1.0208.8096-1.8304 1.8304-1.8304s1.8304.8096 1.8304 1.8304-.8096 1.8304-1.8304 1.8304-1.8304-.8096-1.8304-1.8304zm-11.3696-4.7872c6.0192 0 10.2784 3.0272 10.2784 8.7296 0 9.2576-9.2928 14.608-18.1984 18.3392-.0704.0704-.176.1056-.2816.1056-.2112 0-.3872-.176-.3872-.3872 0-.1056.0352-.2112.1056-.2816 7.1456-4.1536 14.608-9.328 14.608-17.3888 0-4.2592-2.2528-8.3424-6.1248-8.3424-2.7808 0-4.8576 2.0064-5.7728 4.6816.4928-.2816.9856-.4576 1.5136-.4576 1.936 0 3.52 1.584 3.52 3.52 0 2.0416-1.5488 3.7664-3.52 3.7664-2.112 0-3.9424-1.6896-3.9424-3.7664 0-4.6464 3.6256-8.5184 8.2016-8.5184z';
const trebleClef = 'c -3.4414 -0.2 -6.9551 -2.3586 -9.0565 -4.836 c -2.4363 -2.8725 -3.4408 -6.7778 -3.1835 -9.985 c 0.7559 -9.4235 11.0037 -14.9932 14.7972 -19.1095 c 2.5392 -2.7553 3.0715 -4.0984 3.6387 -5.5155 c 1.098 -2.743 1.2749 -5.9568 -0.902 -6.1967 c -2.0784 -0.2291 -3.7883 3.0395 -4.552 5.2732 c -0.6868 2.0092 -1.1432 4.025 -0.73 7.053 c 0.1857 1.3604 5.2966 39.3342 5.3828 39.9228 c 0.8607 5.8824 -2.5033 8.3164 -5.9373 8.7494 c -7.4156 0.9349 -9.7951 -6.6011 -6.4715 -9.4632 c 2.5587 -2.2037 6.2813 -0.3118 6.0802 3.3111 c -0.1781 3.2088 -3.3245 3.3034 -4.1284 3.2301 c 1.2342 2.2134 10.5383 3.3698 9.1097 -6.6304 c -0.2007 -1.4052 -4.9236 -37.0907 -5.0393 -37.8892 c -0.8664 -5.9781 -0.9984 -10.71 2.1162 -16.232 c 1.1499 -2.0385 2.9671 -3.3545 3.8592 -3.1822 c 0.196 0.0378 0.3914 0.1098 0.5464 0.2698 c 2.3892 2.4618 3.1222 7.921 2.8604 11.057 c -0.268 3.211 -0.4174 6.5351 -3.6102 10.4116 c -1.2356 1.5001 -5.0061 4.8048 -7.1679 6.7035 c -3.0375 2.6676 -5.2407 4.9975 -6.4328 7.8082 c -1.3397 3.1589 -1.5664 7.1354 1.4594 10.6638 c 1.7405 1.9935 4.6284 3.408 7.0589 3.4382 c 6.7579 0.0839 8.7314 -3.2473 8.7945 -7.0198 c 0.1038 -6.2119 -7.3955 -8.5605 -10.4787 -4.2893 c -1.7877 2.4766 -1.0019 5.0833 0.1987 6.3235 c 0.4121 0.4256 0.8724 0.7498 1.3079 0.9306 c 0.1578 0.0655 0.5291 0.2381 0.4237 0.4908 c -0.0876 0.2103 -0.2579 0.2221 -0.413 0.2035 c -1.9443 -0.2332 -4.0972 -2.0916 -4.6266 -5.2883 c -0.7714 -4.6592 3.3402 -10.1861 9.2091 -9.2822 c 3.8423 0.5918 7.4097 3.8979 7.0969 10.0543 c -0.2683 5.2764 -4.6425 9.4065 -11.2101 9.0248 z';
// TODO: Move this somewhere central
const lineSpace = 10;
class Clef {
    constructor(id, pos, type, beat) {
        this.ID = id;
        this.Position = pos;
        this.Bounds = new Bounds(0, 0, 0, 0);
        this.Type = type;
        this.SelType = SelectableTypes.Clef;
        this.Beat = beat;
        this.Selected = false;
    }
    render(renderProps) {
        let clefSymbol;
        switch (this.Type) {
            case "treble":
                clefSymbol = Clefs.G;
                break;
            case "bass":
                clefSymbol = Clefs.F;
                break;
            default:
                clefSymbol = Clefs.G;
        }
        const colour = this.Selected ? "blue" : "black";
        RenderSymbol(renderProps, clefSymbol, this.Position.x, this.Position.y, colour);
        renderProps.context.strokeStyle = "green";
        renderProps.context.strokeRect(this.Bounds.x + renderProps.camera.x, this.Bounds.y + renderProps.camera.y, this.Bounds.width, this.Bounds.height);
    }
    SetBounds(msr, staff) {
        // There is a difference between position and bounds
        // Position is for visually positioning the clef glyph, bounds is for selection
        const div = msr.Divisions.find(d => d.Beat === this.Beat && d.Staff === staff);
        const xPosition = this.Beat === 1 ?
            msr.Bounds.x : div.Bounds.x;
        const xBuffer = 3;
        // Treble as default, 2
        let lineBuffer = 2;
        //    let yBuffer = staff === 0 ? 0 : msr.GetMeasureHeight();
        let yBuffer = 0;
        const msrMidLine = staff === StaffType.Single ?
            Measure.GetMeasureMidLine(msr) : msr.GetGrandMeasureMidLine();
        this.Position.x = xPosition + xBuffer;
        this.Bounds.x = xPosition + xBuffer;
        switch (this.Type) {
            case "bass":
                lineBuffer = -2;
        }
        this.Position.y = div.Bounds.y + yBuffer + ((msrMidLine + lineBuffer) * 5);
        this.Bounds.y = div.Bounds.y;
        this.Bounds.width = 30;
        this.Bounds.height = 85;
    }
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
}
export { Clef };
