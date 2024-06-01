declare enum NoteValues {
    n32 = 0.03125,
    n32d = 0.046875,
    n32dd = 0.0546875,
    n32ddd = 0.05859375,
    n16 = 0.0625,
    n16d = 0.09375,
    n16dd = 0.109375,
    n16ddd = 0.1171875,
    n8 = 0.125,
    n8d = 0.1875,
    n8dd = 0.21875,
    n8ddd = 0.234375,
    n4 = 0.25,
    n4d = 0.375,
    n4dd = 0.4375,
    n4ddd = 0.46875,
    n2 = 0.5,
    n2d = 0.75,
    n2dd = 0.875,
    n2ddd = 0.9375,
    n1 = 1,
    n1d = 1.5,
    n1dd = 1.75,
    n1ddd = 1.875
}
declare function GetLargestValues(duration: number): number[];
export { NoteValues, GetLargestValues };
//# sourceMappingURL=Values.d.ts.map