import { windows } from "../constants";
import {
  getProcessId,
  getProcessHandle,
  getProcessPath,
  getWindowBounds,
  getWindowTitle,
  user32,
  getWindowId
} from "../bindings/windows";
import { basename } from "path";

interface Process {
  id: number;
  handle: number;
  name: string;
  path: string;
}

export class Window {
  public handle: Buffer;
  public process: Process;
  public windowId: number;

  constructor(handle: Buffer) {
    this.handle = handle;
    this.windowId = getWindowId(handle);

    const processId = getProcessId(handle);
    const processPath = getProcessPath(processId);

    this.process = {
      id: processId,
      handle: getProcessHandle(processId),
      path: processPath,
      name: basename(processPath)
    };
  }

  getBounds() {
    return getWindowBounds(this.handle);
  }

  getTitle() {
    return getWindowTitle(this.handle);
  }

  move(x: number, y: number, width: number, height: number) {
    user32.MoveWindow(this.handle, x, y, width, height, true);
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
}
