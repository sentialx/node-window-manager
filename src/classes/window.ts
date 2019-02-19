import { windows } from "../constants";

const addon = require("bindings")("windows-window-manager");

export class Window {
  public handle: number;

  constructor(windowHandle: number) {
    this.handle = windowHandle;
  }

  getBounds() {
    return addon.getWindowBounds(this.handle);
  }

  getTitle() {
    return addon.getWindowTitle(this.handle);
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
    return addon.getWindowLong(this.handle, windows.GWL_STYLE);
  }

  move(x: number, y: number, width: number, height: number) {
    addon.moveWindow(this.handle, x, y, width, height);
  }

  setState(state: number) {
    addon.setWindowState(this.handle, state);
  }

  show() {
    this.setState(windows.SW_SHOW);
  }

  hide() {
    this.setState(windows.SW_HIDE);
  }

  minimize() {
    this.setState(windows.SW_MINIMIZE);
  }

  restore() {
    this.setState(windows.SW_RESTORE);
  }

  maximize() {
    this.setState(windows.SW_MAXIMIZE);
  }

  setAlwaysOnTop(toggle: boolean) {
    const { left, top } = this.getBounds();
    const width = this.getWidth();
    const height = this.getHeight();

    addon.setWindowPos(
      this.handle,
      toggle ? windows.HWND_TOPMOST : windows.HWND_NOTOPMOST,
      left,
      top,
      width,
      height,
      windows.SWP_SHOWWINDOW
    );
  }
}
