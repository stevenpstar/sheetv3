var NoteValues;
(function (NoteValues) {
    NoteValues[NoteValues["n32"] = 0.03125] = "n32";
    NoteValues[NoteValues["n32d"] = 0.046875] = "n32d";
    NoteValues[NoteValues["n32dd"] = 0.0546875] = "n32dd";
    NoteValues[NoteValues["n32ddd"] = 0.05859375] = "n32ddd";
    NoteValues[NoteValues["n16"] = 0.0625] = "n16";
    NoteValues[NoteValues["n16d"] = 0.09375] = "n16d";
    NoteValues[NoteValues["n16dd"] = 0.109375] = "n16dd";
    NoteValues[NoteValues["n16ddd"] = 0.1171875] = "n16ddd";
    NoteValues[NoteValues["n8"] = 0.125] = "n8";
    NoteValues[NoteValues["n8d"] = 0.1875] = "n8d";
    NoteValues[NoteValues["n8dd"] = 0.21875] = "n8dd";
    NoteValues[NoteValues["n8ddd"] = 0.234375] = "n8ddd";
    NoteValues[NoteValues["n4"] = 0.25] = "n4";
    NoteValues[NoteValues["n4d"] = 0.375] = "n4d";
    NoteValues[NoteValues["n4dd"] = 0.4375] = "n4dd";
    NoteValues[NoteValues["n4ddd"] = 0.46875] = "n4ddd";
    NoteValues[NoteValues["n2"] = 0.5] = "n2";
    NoteValues[NoteValues["n2d"] = 0.75] = "n2d";
    NoteValues[NoteValues["n2dd"] = 0.875] = "n2dd";
    NoteValues[NoteValues["n2ddd"] = 0.9375] = "n2ddd";
    NoteValues[NoteValues["n1"] = 1] = "n1";
    NoteValues[NoteValues["n1d"] = 1.5] = "n1d";
    NoteValues[NoteValues["n1dd"] = 1.75] = "n1dd";
    NoteValues[NoteValues["n1ddd"] = 1.875] = "n1ddd";
})(NoteValues || (NoteValues = {}));
const ValueMap = new Map([
    [1, NoteValues.n1],
    [0.5, NoteValues.n2],
    [0.25, NoteValues.n4],
    [0.125, NoteValues.n8],
    [0.0625, NoteValues.n16],
    [0.03125, NoteValues.n32],
]);
function GetLargestValues(duration) {
    let remainingDiff = duration;
    let values = [];
    const divByStdVal = duration % NoteValues.n32 === 0;
    if (!divByStdVal) {
        console.error("Not divisible by standard value, not implemented");
    }
    // check if the duration matches a standard value perfectly
    if (ValueMap.has(duration)) {
        values.push(duration);
        remainingDiff -= duration;
        if (remainingDiff !== 0) {
            console.error("HUH?");
        }
    }
    while (remainingDiff > 0) {
        for (let [key, val] of ValueMap) {
            if (ValueMap.get(key) <= remainingDiff) {
                values.push(ValueMap.get(key));
                remainingDiff -= ValueMap.get(key);
            }
        }
        // Emergency exit
        if (remainingDiff < NoteValues.n32) {
            remainingDiff = 0;
        }
    }
    return values;
}
export { NoteValues, GetLargestValues };
