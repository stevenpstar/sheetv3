import { ConfigSettings } from "../Types/Config";
declare class Camera {
    Dragging: boolean;
    DraggingX: number;
    DraggingY: number;
    x: number;
    y: number;
    oldX: number;
    oldY: number;
    Zoom: number;
    constructor(x: number, y: number);
    SetDragging(drag: boolean, x: number, y: number, config: ConfigSettings, cam: Camera): void;
    DragCamera(mx: number, my: number): boolean;
    SetZoom(zoom: number): void;
}
export { Camera };
//# sourceMappingURL=Camera.d.ts.map