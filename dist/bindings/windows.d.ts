export declare const Rect: any;
export declare const user32: any;
export declare const kernel32: any;
export declare const shellScaling: any;
export declare const getProcessId: (handle: number) => any;
export declare const getProcessHandle: (id: number) => any;
export declare const getProcessPath: (id: number) => any;
export declare const getActiveWindowHandle: () => any;
export declare const getWindowTitle: (handle: number) => any;
export declare const getWindowBounds: (handle: number) => {
    x: any;
    y: any;
    width: number;
    height: number;
};
export declare const getWindowContentBounds: (handle: number) => {
    x: any;
    y: any;
    width: any;
    height: any;
};
export declare const getCursorPos: () => any;
