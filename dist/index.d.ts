/// <reference types="node" />
import { Window } from "./classes/window";
import { EventEmitter } from "events";
declare class WindowManager extends EventEmitter {
    constructor();
    getActiveWindow: () => Window;
    getWindows: () => Window[];
    getMonitorFromWindow: (window: Window) => any;
    getScaleFactor: (monitor: number) => number;
    getMousePoint: () => any;
}
declare const windowManager: WindowManager;
export { windowManager, Window };
