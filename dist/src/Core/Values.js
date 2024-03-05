var NoteValues;
(function (NoteValues) {
    NoteValues[NoteValues["n32"] = 0.03125] = "n32";
    NoteValues[NoteValues["n16"] = 0.0625] = "n16";
    NoteValues[NoteValues["n8"] = 0.125] = "n8";
    NoteValues[NoteValues["n4"] = 0.25] = "n4";
    NoteValues[NoteValues["n2"] = 0.5] = "n2";
    NoteValues[NoteValues["n1"] = 1] = "n1";
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
