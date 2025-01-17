function RenderClef(renderProps, clef, theme) {
    // Only rendering for clefs at start of measure at this moment
    // Will require more here when that is fixed
    clef.render(renderProps, theme);
}
export { RenderClef };
