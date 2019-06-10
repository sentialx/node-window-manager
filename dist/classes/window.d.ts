interface Process {
    id: number;
    name: string;
    path: string;
}
interface Rectangle {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
export declare class Window {
    handle: number;
    process: Process;
    constructor(handle: number);
    getBounds(): Rectangle;
    getContentBounds(): Rectangle;
    setBounds(bounds: Rectangle): void;
    setContentBounds(bounds: Rectangle): void;
    getTitle(): any;
    setOpacity(opacity: number): void;
    getOpacity(): number;
    show(): void;
    hide(): void;
    minimize(): void;
    restore(): void;
    maximize(): void;
    setAlwaysOnTop(toggle: boolean): void;
    setFrameless(toggle: boolean): void;
    setParent(window: Window | null | number): void;
    getParent(): Window;
    redraw(): void;
    isWindow(): any;
    setMaximizable(toggle: boolean): void;
    isMaximizable(): boolean;
    setMinimizable(toggle: boolean): void;
    isMinimizable(): boolean;
    setResizable(toggle: boolean): void;
    isResizable(): boolean;
    bringToTop(): void;
}
export {};
