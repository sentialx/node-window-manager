const native = require("bindings")("windows-window-manager");

class EventEmitter {
  constructor() {
    this.listeners = [];
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners.splice(this.listeners.indexOf(callback));
  }

  emit() {
    for (const listener of this.listeners) {
      if (typeof listener === "function") listener();
    }
  }
}

class Window {
  constructor(windowHandle) {
    this.handle = windowHandle;
    this.onMoved = new EventEmitter();

    setInterval(() => {
      const msg = native.getMessage(this.handle);
      if (msg === 562) {
        // WM_EXITSIZEMOVE
        this.onMoved.emit();
      }
    }, 100);
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

  getStyle() {
    return native.getWindowLong(this.handle, GWL.STYLE);
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

  setStyle(style) {
    const { left, top } = this.getBounds();
    const width = this.getWidth();
    const height = this.getHeight();

    native.setWindowLong(this.handle, GWL.STYLE, style);

    native.setWindowPos(
      this.handle,
      0,
      left,
      top,
      width,
      height,
      SWP.SHOWWINDOW
    );
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
  POPUP: 2147483648,
  CHILD: 1073741824,
  CHILDWINDOW: 40000000,
  CLIPCHILDREN: 33554432,
  CLIPSIBLINGS: 67108864,
  DISABLED: 134217728,
  DLGFRAME: 4194304,
  GROUP: 131072,
  HSSCROLL: 1048576,
  ICONIC: 536870912,
  MAXIMIZE: 16777216,
  MAXIMIZEBOX: 65536,
  MINIMIZE: 536870912,
  MINIMIZEBOX: 131072,
  OVERLAPPED: 0,
  OVERLAPPEDWINDOW:
    this.OVERLAPPED |
    this.CAPTION |
    this.SYSMENU |
    this.THICKFRAME |
    this.MINIMIZEBOX |
    this.MAXIMIZEBOX,
  POPUPWINDOW: this.POPUP | this.BORDER | this.SYSMENU,
  SIZEBOX: 262144,
  SYSMENU: 524288,
  TABSTOP: 65536,
  THICKFRAME: 262144,
  TILED: 0,
  TILEDWINDOW: this.OVERLAPPEDWINDOW,
  VISIBLE: 268435456,
  VSCROLL: 2097152
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
