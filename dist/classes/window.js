"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const windows_1 = require("../bindings/windows");
const path_1 = require("path");
const ffi = require("ffi");
const ref = require("ref");
const toggleStyle = (toggle, handle, style) => {
    let long = windows_1.user32.GetWindowLongPtrA(handle, constants_1.windows.GWL_STYLE);
    if (toggle) {
        long |= style;
    }
    else {
        long &= ~style;
    }
    windows_1.user32.SetWindowLongPtrA(handle, constants_1.windows.GWL_STYLE, long);
};
class Window {
    constructor(handle) {
        this.handle = handle;
        const processId = windows_1.getProcessId(handle);
        const processPath = windows_1.getProcessPath(processId);
        this.process = {
            id: processId,
            path: processPath,
            name: path_1.basename(processPath)
        };
    }
    getBounds() {
        return windows_1.getWindowBounds(this.handle);
    }
    getContentBounds() {
        return windows_1.getWindowContentBounds(this.handle);
    }
    setBounds(bounds) {
        const { x, y, height, width } = Object.assign({}, this.getBounds(), bounds);
        windows_1.user32.MoveWindow(this.handle, x, y, width, height, true);
    }
    setContentBounds(bounds) {
        const rect = new windows_1.Rect({
            left: bounds.x,
            top: bounds.y,
            right: bounds.x + bounds.width,
            bottom: bounds.y + bounds.height
        });
        windows_1.user32.AdjustWindowRect(rect.ref(), windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWL_STYLE), false);
        windows_1.user32.MoveWindow(this.handle, rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top, true);
    }
    getTitle() {
        return windows_1.getWindowTitle(this.handle);
    }
    setOpacity(opacity) {
        let long = windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWL_EXSTYLE);
        windows_1.user32.SetWindowLongPtrA(this.handle, constants_1.windows.GWL_EXSTYLE, long | constants_1.windows.WS_EX_LAYERED);
        windows_1.user32.SetLayeredWindowAttributes(this.handle, 0, opacity * 255, constants_1.windows.LWA_ALPHA);
    }
    getOpacity() {
        let long = windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWL_EXSTYLE);
        windows_1.user32.SetWindowLongPtrA(this.handle, constants_1.windows.GWL_EXSTYLE, long | constants_1.windows.WS_EX_LAYERED);
        const opacityRef = ref.alloc("int");
        windows_1.user32.GetLayeredWindowAttributes(this.handle, null, opacityRef, null);
        return opacityRef.deref() / 255;
    }
    show() {
        this.setOpacity(1);
        windows_1.user32.ShowWindow(this.handle, constants_1.windows.SW_SHOW);
    }
    hide() {
        this.setOpacity(0);
        windows_1.user32.ShowWindow(this.handle, constants_1.windows.SW_HIDE);
    }
    minimize() {
        windows_1.user32.ShowWindow(this.handle, constants_1.windows.SW_MINIMIZE);
    }
    restore() {
        windows_1.user32.ShowWindow(this.handle, constants_1.windows.SW_RESTORE);
    }
    maximize() {
        windows_1.user32.ShowWindow(this.handle, constants_1.windows.SW_MAXIMIZE);
    }
    setAlwaysOnTop(toggle) {
        windows_1.user32.SetWindowPos(this.handle, toggle ? constants_1.windows.HWND_TOPMOST : constants_1.windows.HWND_NOTOPMOST, 0, 0, 0, 0, constants_1.windows.SWP_NOMOVE | constants_1.windows.SWP_NOSIZE);
    }
    setFrameless(toggle) {
        let style = windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWL_STYLE);
        let exstyle = windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWL_EXSTYLE);
        if (toggle) {
            style &= ~(constants_1.windows.WS_CAPTION |
                constants_1.windows.WS_THICKFRAME |
                constants_1.windows.WS_MINIMIZEBOX |
                constants_1.windows.WS_MAXIMIZEBOX |
                constants_1.windows.WS_SYSMENU);
            exstyle &= ~(constants_1.windows.WS_EX_DLGMODALFRAME |
                constants_1.windows.WS_EX_CLIENTEDGE |
                constants_1.windows.WS_EX_STATICEDGE);
        }
        else {
            style |=
                constants_1.windows.WS_CAPTION |
                    constants_1.windows.WS_THICKFRAME |
                    constants_1.windows.WS_MINIMIZEBOX |
                    constants_1.windows.WS_MAXIMIZEBOX |
                    constants_1.windows.WS_SYSMENU;
            exstyle |=
                constants_1.windows.WS_EX_DLGMODALFRAME |
                    constants_1.windows.WS_EX_CLIENTEDGE |
                    constants_1.windows.WS_EX_STATICEDGE;
        }
        windows_1.user32.SetWindowLongPtrA(this.handle, constants_1.windows.GWL_STYLE, style);
        windows_1.user32.SetWindowLongPtrA(this.handle, constants_1.windows.GWL_EXSTYLE, exstyle);
        this.redraw();
    }
    setParent(window) {
        let handle = window;
        if (window instanceof Window) {
            handle = window.handle;
        }
        else if (!window) {
            handle = 0;
        }
        windows_1.user32.SetWindowLongPtrA(this.handle, constants_1.windows.GWLP_HWNDPARENT, handle);
    }
    getParent() {
        return new Window(windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWLP_HWNDPARENT));
    }
    redraw() {
        windows_1.user32.SetWindowPos(this.handle, 0, 0, 0, 0, 0, constants_1.windows.SWP_FRAMECHANGED |
            constants_1.windows.SWP_NOMOVE |
            constants_1.windows.SWP_NOSIZE |
            constants_1.windows.SWP_NOZORDER |
            constants_1.windows.SWP_NOOWNERZORDER |
            constants_1.windows.SWP_NOACTIVATE |
            constants_1.windows.SWP_DRAWFRAME |
            constants_1.windows.SWP_NOCOPYBITS);
    }
    isWindow() {
        return windows_1.user32.IsWindow(this.handle);
    }
    setMaximizable(toggle) {
        toggleStyle(toggle, this.handle, constants_1.windows.WS_MAXIMIZEBOX);
        this.redraw();
    }
    isMaximizable() {
        let style = windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWL_STYLE);
        return (style & constants_1.windows.WS_MAXIMIZEBOX) === constants_1.windows.WS_MAXIMIZEBOX;
    }
    setMinimizable(toggle) {
        toggleStyle(toggle, this.handle, constants_1.windows.WS_MINIMIZEBOX);
        this.redraw();
    }
    isMinimizable() {
        let style = windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWL_STYLE);
        return (style & constants_1.windows.WS_MINIMIZEBOX) === constants_1.windows.WS_MINIMIZEBOX;
    }
    setResizable(toggle) {
        toggleStyle(toggle, this.handle, constants_1.windows.WS_SIZEBOX);
        this.redraw();
    }
    isResizable() {
        let style = windows_1.user32.GetWindowLongPtrA(this.handle, constants_1.windows.GWL_STYLE);
        return (style & constants_1.windows.WS_SIZEBOX) === constants_1.windows.WS_SIZEBOX;
    }
    bringToTop() {
        windows_1.user32.SetForegroundWindow(this.handle);
    }
}
exports.Window = Window;
//# sourceMappingURL=window.js.map