const native = require('bindings')('windows-window-manager')

class Window {
    constructor(windowHandle) {
        this.windowHandle = windowHandle;
    }

    getBounds() {
        return native.getWindowBounds(this.windowHandle);
    }

    getTitle() {
        return native.getWindowTitle(this.windowHandle);
    }

    getWidth() {
        const bounds = this.getBounds();
        return bounds.right - bounds.left;
    }

    getHeight() {
        const bounds = this.getBounds();
        return bounds.bottom - bounds.top;
    }

    move(x, y, width, height) {
        native.moveWindow(this.windowHandle, x, y, width, height);
    }

    setWindowState(state) {
        native.setWindowState(this.windowHandle, state);
    }

    show() {
        this.setWindowState(WindowStates.SHOW);
    }

    hide() {
        this.setWindowState(WindowStates.HIDE);
    }

    minimize() {
        this.setWindowState(WindowStates.MINIMIZE);
    }

    restore() {
        this.setWindowState(WindowStates.RESTORE);
    }

    maximize() {
        this.setWindowState(WindowStates.MAXIMIZE);
    }

    setTopMost(toggle) {
        const { left, top } = this.getBounds();
        const width = this.getWidth();
        const height = this.getHeight();

        if (toggle) {
            native.setWindowPos(this.windowHandle, HWND.TOPMOST, left, top, width, height, 0);
        } else {
            native.setWindowPos(this.windowHandle, HWND.NOTOPMOST, left, top, width, height, 0);
        }
    }
}

const getActiveWindow = () => {
    return new Window(native.getActiveWindow());
}

const WindowStates = {
    HIDE: 0,
	SHOWNORMAL: 1,
	SHOWMINIMIZED: 2,
	MAXIMIZE: 3,
	SHOWMAXIMIZED: 3,
	SHOWNOACTIVATE: 4,
	SHOW: 5,
	MINIMIZE: 6,
	SHOWMINNOACTIVE: 7,
	SHOWNA: 8,
	RESTORE: 9,
	SHOWDEFAULT: 10,
	FORCEMINIMIZE: 11
}

const AncestorFlags = {
	PARENT: 1,
	ROOT: 2,
	ROOTOWNER: 3
};

const HWND = {
	NOTOPMOST: -2,
	TOPMOST: -1,
	TOP: 0,
	BOTTOM: 1
};

const SWP = {
	NOSIZE: 0x0001,
	NOMOVE: 0x0002,
	NOZORDER: 0x0004,
	NOREDRAW: 0x0008,
	NOACTIVATE: 0x0010,
	DRAWFRAME: 0x0020,
	FRAMECHANGED: 0x0020,
	SHOWWINDOW: 0x0040,
	HIDEWINDOW: 0x0080,
	NOCOPYBITS: 0x0100,
	NOOWNERZORDER: 0x0200,
	NOREPOSITION: 0x0200,
	NOSENDCHANGING: 0x0400,
	DEFERERASE: 0x2000,
	ASYNCWINDOWPOS: 0x4000
};

module.exports = { getActiveWindow, WindowStates, AncestorFlags, Window, HWND, SWP };