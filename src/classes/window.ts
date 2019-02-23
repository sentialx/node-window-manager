import { windows } from "../constants";
import {
  getProcessId,
  getProcessPath,
  getWindowBounds,
  getWindowTitle,
  user32
} from "../bindings/windows";
import { basename } from "path";

const ref = require("ref");

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

const toggleStyle = (toggle: boolean, handle: number, style: number) => {
  let long = user32.GetWindowLongPtrA(handle, windows.GWL_STYLE);

  if (toggle) {
    long |= style;
  } else {
    long &= ~style;
  }

  user32.SetWindowLongPtrA(handle, windows.GWL_STYLE, long);
};

export class Window {
  public handle: number;
  public process: Process;

  constructor(handle: number) {
    this.handle = handle;

    const processId = getProcessId(handle);
    const processPath = getProcessPath(processId);

    this.process = {
      id: processId,
      path: processPath,
      name: basename(processPath)
    };
  }

  getBounds(): Rectangle {
    return getWindowBounds(this.handle);
  }

  setBounds(bounds: Rectangle) {
    const { x, y, height, width } = { ...this.getBounds(), ...bounds };
    user32.MoveWindow(this.handle, x, y, width, height, true);
  }

  getTitle() {
    return getWindowTitle(this.handle);
  }

  show() {
    user32.ShowWindow(this.handle, windows.SW_SHOW);
  }

  hide() {
    user32.ShowWindow(this.handle, windows.SW_HIDE);
  }

  minimize() {
    user32.ShowWindow(this.handle, windows.SW_MINIMIZE);
  }

  restore() {
    user32.ShowWindow(this.handle, windows.SW_RESTORE);
  }

  maximize() {
    user32.ShowWindow(this.handle, windows.SW_MAXIMIZE);
  }

  setAlwaysOnTop(toggle: boolean) {
    user32.SetWindowPos(
      this.handle,
      toggle ? windows.HWND_TOPMOST : windows.HWND_NOTOPMOST,
      0,
      0,
      0,
      0,
      windows.SWP_NOMOVE | windows.SWP_NOSIZE
    );
  }

  setFrameless(toggle: boolean) {
    let style = user32.GetWindowLongPtrA(this.handle, windows.GWL_STYLE);
    let exstyle = user32.GetWindowLongPtrA(this.handle, windows.GWL_EXSTYLE);

    if (toggle) {
      style &= ~(
        windows.WS_CAPTION |
        windows.WS_THICKFRAME |
        windows.WS_MINIMIZEBOX |
        windows.WS_MAXIMIZEBOX |
        windows.WS_SYSMENU
      );

      exstyle &= ~(
        windows.WS_EX_DLGMODALFRAME |
        windows.WS_EX_CLIENTEDGE |
        windows.WS_EX_STATICEDGE
      );
    } else {
      style |=
        windows.WS_CAPTION |
        windows.WS_THICKFRAME |
        windows.WS_MINIMIZEBOX |
        windows.WS_MAXIMIZEBOX |
        windows.WS_SYSMENU;

      exstyle |=
        windows.WS_EX_DLGMODALFRAME |
        windows.WS_EX_CLIENTEDGE |
        windows.WS_EX_STATICEDGE;
    }

    user32.SetWindowLongPtrA(this.handle, windows.GWL_STYLE, style);
    user32.SetWindowLongPtrA(this.handle, windows.GWL_EXSTYLE, exstyle);

    this.redraw();
  }

  setParent(window: Window) {
    user32.SetWindowLongPtrA(
      this.handle,
      windows.GWLP_HWNDPARENT,
      window.handle
    );
  }

  redraw() {
    user32.SetWindowPos(
      this.handle,
      null,
      0,
      0,
      0,
      0,
      windows.SWP_FRAMECHANGED |
        windows.SWP_NOMOVE |
        windows.SWP_NOSIZE |
        windows.SWP_NOZORDER |
        windows.SWP_NOOWNERZORDER
    );
  }

  isWindow() {
    return user32.IsWindow(this.handle);
  }

  setMaximizable(toggle: boolean) {
    toggleStyle(toggle, this.handle, windows.WS_MAXIMIZEBOX);
    this.redraw();
  }

  setMinimizable(toggle: boolean) {
    toggleStyle(toggle, this.handle, windows.WS_MINIMIZEBOX);
    this.redraw();
  }

  isMaximizable() {
    let style = user32.GetWindowLongPtrA(this.handle, windows.GWL_STYLE);
    return (style & windows.WS_MAXIMIZEBOX) === windows.WS_MAXIMIZEBOX;
  }

  isMinimizable() {
    let style = user32.GetWindowLongPtrA(this.handle, windows.GWL_STYLE);
    return (style & windows.WS_MINIMIZEBOX) === windows.WS_MINIMIZEBOX;
  }
}
