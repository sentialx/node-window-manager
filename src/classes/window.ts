import { windows } from "../constants";
import {
  getProcessId,
  getProcessPath,
  getWindowBounds,
  getWindowTitle,
  user32,
  getWindowContentBounds,
  Rect
} from "../bindings/windows";
import { basename } from "path";
import { windowManager } from "..";
import { platform } from "os";

const ffi = require("ffi");
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
    if (platform() !== "win32") return;

    return getWindowBounds(this.handle);
  }

  getContentBounds(): Rectangle {
    if (platform() !== "win32") return;

    return getWindowContentBounds(this.handle);
  }

  setBounds(bounds: Rectangle) {
    if (platform() !== "win32") return;

    const { x, y, height, width } = { ...this.getBounds(), ...bounds };

    user32.MoveWindow(this.handle, x, y, width, height, true);
  }

  setContentBounds(bounds: Rectangle) {
    if (platform() !== "win32") return;

    const rect = new Rect({
      left: bounds.x,
      top: bounds.y,
      right: bounds.x + bounds.width,
      bottom: bounds.y + bounds.height
    });
    user32.AdjustWindowRect(
      rect.ref(),
      user32.GetWindowLongPtrA(this.handle, windows.GWL_STYLE),
      false
    );

    user32.MoveWindow(
      this.handle,
      rect.left,
      rect.top,
      rect.right - rect.left,
      rect.bottom - rect.top,
      true
    );
  }

  getTitle() {
    if (platform() !== "win32") return;

    return getWindowTitle(this.handle);
  }

  setOpacity(opacity: number) {
    if (platform() !== "win32") return;

    let long = user32.GetWindowLongPtrA(this.handle, windows.GWL_EXSTYLE);
    user32.SetWindowLongPtrA(
      this.handle,
      windows.GWL_EXSTYLE,
      long | windows.WS_EX_LAYERED
    );

    user32.SetLayeredWindowAttributes(
      this.handle,
      0,
      opacity * 255,
      windows.LWA_ALPHA
    );
  }

  getOpacity() {
    if (platform() !== "win32") return;

    let long = user32.GetWindowLongPtrA(this.handle, windows.GWL_EXSTYLE);
    user32.SetWindowLongPtrA(
      this.handle,
      windows.GWL_EXSTYLE,
      long | windows.WS_EX_LAYERED
    );

    const opacityRef = ref.alloc("int");

    user32.GetLayeredWindowAttributes(this.handle, null, opacityRef, null);

    return opacityRef.deref() / 255;
  }

  show() {
    if (platform() !== "win32") return;

    this.setOpacity(1);
    user32.ShowWindow(this.handle, windows.SW_SHOW);
  }

  hide() {
    if (platform() !== "win32") return;

    this.setOpacity(0);
    user32.ShowWindow(this.handle, windows.SW_HIDE);
  }

  minimize() {
    if (platform() !== "win32") return;

    user32.ShowWindow(this.handle, windows.SW_MINIMIZE);
  }

  restore() {
    if (platform() !== "win32") return;

    user32.ShowWindow(this.handle, windows.SW_RESTORE);
  }

  maximize() {
    if (platform() !== "win32") return;

    user32.ShowWindow(this.handle, windows.SW_MAXIMIZE);
  }

  setAlwaysOnTop(toggle: boolean) {
    if (platform() !== "win32") return;

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
    if (platform() !== "win32") return;

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

  setParent(window: Window | null | number) {
    if (platform() !== "win32") return;

    let handle = window;

    if (window instanceof Window) {
      handle = window.handle;
    } else if (!window) {
      handle = 0;
    }

    user32.SetWindowLongPtrA(this.handle, windows.GWLP_HWNDPARENT, handle);
  }

  getParent() {
    if (platform() !== "win32") return;

    return new Window(
      user32.GetWindowLongPtrA(this.handle, windows.GWLP_HWNDPARENT)
    );
  }

  redraw() {
    if (platform() !== "win32") return;

    user32.SetWindowPos(
      this.handle,
      0,
      0,
      0,
      0,
      0,
      windows.SWP_FRAMECHANGED |
        windows.SWP_NOMOVE |
        windows.SWP_NOSIZE |
        windows.SWP_NOZORDER |
        windows.SWP_NOOWNERZORDER |
        windows.SWP_NOACTIVATE |
        windows.SWP_DRAWFRAME |
        windows.SWP_NOCOPYBITS
    );
  }

  isWindow() {
    if (platform() !== "win32") return;

    return user32.IsWindow(this.handle);
  }

  setMaximizable(toggle: boolean) {
    if (platform() !== "win32") return;

    toggleStyle(toggle, this.handle, windows.WS_MAXIMIZEBOX);
    this.redraw();
  }

  isMaximizable() {
    if (platform() !== "win32") return;

    let style = user32.GetWindowLongPtrA(this.handle, windows.GWL_STYLE);
    return (style & windows.WS_MAXIMIZEBOX) === windows.WS_MAXIMIZEBOX;
  }

  setMinimizable(toggle: boolean) {
    if (platform() !== "win32") return;

    toggleStyle(toggle, this.handle, windows.WS_MINIMIZEBOX);
    this.redraw();
  }

  isMinimizable() {
    if (platform() !== "win32") return;

    let style = user32.GetWindowLongPtrA(this.handle, windows.GWL_STYLE);
    return (style & windows.WS_MINIMIZEBOX) === windows.WS_MINIMIZEBOX;
  }

  setResizable(toggle: boolean) {
    if (platform() !== "win32") return;

    toggleStyle(toggle, this.handle, windows.WS_SIZEBOX);
    this.redraw();
  }

  isResizable() {
    if (platform() !== "win32") return;

    let style = user32.GetWindowLongPtrA(this.handle, windows.GWL_STYLE);
    return (style & windows.WS_SIZEBOX) === windows.WS_SIZEBOX;
  }

  bringToTop() {
    if (platform() !== "win32") return;

    user32.SetForegroundWindow(this.handle);
  }
}
