const native = require("bindings")("windows-window-manager");

class Window {
  constructor(windowHandle) {
    this.handle = windowHandle;
    this.style = native.getWindowLong(this.handle, GWL.STYLE);
  }

  getBounds() {
    return native.getWindowBounds(this.handle);
  }

  getTitle() {
    return native.getWindowTitle(this.handle);
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
    native.moveWindow(this.handle, x, y, width, height);
  }

  setState(state) {
    native.setWindowState(this.handle, state);
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

    native.setWindowPos(
      this.handle,
      toggle ? HWND.TOPMOST : HWND.NOTOPMOST,
      left,
      top,
      width,
      height,
      0
    );
  }

  setFrameless(toggle) {
    const { left, top } = this.getBounds();
    const width = this.getWidth();
    const height = this.getHeight();

    native.setWindowLong(
      this.handle,
      GWL.STYLE,
      toggle ? WindowStyles.POPUP : this.style
    );

    native.setWindowPos(this.handle, 0, left, top, width, height, 0);
  }
}

const getActiveWindow = () => {
  return new Window(native.getActiveWindow());
};

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
};

const WindowStyles = {
  BORDER: 8388608,
  CAPTION: 12582912,
  POPUP: 2147483648
};

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

const GWL = {
  EXSTYLE: -20,
  HINSTANCE: -6,
  ID: -12,
  STYLE: -16,
  USERDATA: -21,
  WNDPROC: -4
};

module.exports = {
  getActiveWindow,
  WindowStates,
  AncestorFlags,
  Window,
  HWND,
  SWP,
  GWL,
  WindowStyles
};
