var BarlineType;
(function (BarlineType) {
    BarlineType[BarlineType["STANDARD"] = 0] = "STANDARD";
    BarlineType[BarlineType["REPEAT_BEGIN"] = 1] = "REPEAT_BEGIN";
    BarlineType[BarlineType["REPEAT_END"] = 2] = "REPEAT_END";
})(BarlineType || (BarlineType = {}));
var BarlinePos;
(function (BarlinePos) {
    BarlinePos[BarlinePos["START"] = 0] = "START";
    BarlinePos[BarlinePos["END"] = 1] = "END";
})(BarlinePos || (BarlinePos = {}));
class Barline {
    IsHovered(x, y, cam) {
        return this.Bounds.IsHovered(x, y, cam);
    }
    Render() { }
}
export { Barline, BarlineType };
