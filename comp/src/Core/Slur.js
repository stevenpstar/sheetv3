class Slur {
    constructor() { }
    render(renderProps) {
        const x1 = this.NoteStart.Bounds.x + renderProps.camera.x;
        const y1 = this.NoteStart.Bounds.y + renderProps.camera.x;
        const x2 = this.NoteEnd.Bounds.x + renderProps.camera.x;
        const y2 = this.NoteEnd.Bounds.y + renderProps.camera.x;
        const distanceX = x2 - x1;
        const distanceY = Math.abs(y2 - y1);
        const curveHighPoint = -20;
        const curveLowPoint = -17;
        const slurPath = `m ${x1} ${y1} 
      q ${distanceX / 2} ${curveHighPoint} ${distanceX} ${distanceY} 
      q -${distanceX / 2} ${curveLowPoint} -${distanceX} -${distanceY} z`;
        renderProps.context.fill(new Path2D(slurPath));
    }
}
export { Slur };
