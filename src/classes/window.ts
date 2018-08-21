import { WindowStates, GWL, HWND, SWP } from "../constants";

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
    return addon.getWindowLong(this.handle, GWL.STYLE);
  }

  move(x: number, y: number, width: number, height: number) {
    addon.moveWindow(this.handle, x, y, width, height);
  }

  setState(state: number) {
    addon.setWindowState(this.handle, state);
  }

  show() {
    this.setState(WindowStates.SHOW);
  }

  hide() {
    this.setState(WindowStates.HIDE);
  }

  minimize() {
    this.setState(WindowStates.MINIMIZE);
  }

  restore() {
    this.setState(WindowStates.RESTORE);
  }

  maximize() {
    this.setState(WindowStates.MAXIMIZE);
  }

  setTopMost(toggle: boolean, uFlags = 0) {
    const { left, top } = this.getBounds();
    const width = this.getWidth();
    const height = this.getHeight();

    addon.setWindowPos(
      this.handle,
      toggle ? HWND.TOPMOST : HWND.NOTOPMOST,
      left,
      top,
      width,
      height,
      uFlags,
    );
  }

  setStyle(style: number) {
    const { left, top } = this.getBounds();
    const width = this.getWidth();
    const height = this.getHeight();

    addon.setWindowLong(this.handle, GWL.STYLE, style);

    setTimeout(() => {
      addon.setWindowPos(
        this.handle,
        0,
        left,
        top,
        width,
        height,
        SWP.SHOWWINDOW
      );
    }, 10);
  }
}
