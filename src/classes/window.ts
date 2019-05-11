import { basename } from "path";
import { platform } from "os";
import { windowManager } from "..";

let addon: any;

if (platform() === "win32") {
  addon = require("bindings")("addon");
}

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

export class Window {
  public handle: number;
  public process: Process;

  constructor(handle: number) {
    this.handle = handle;

    if (platform() !== "win32") return;

    const processId = addon.getWindowProcessId(handle);
    const processPath = addon.getProcessPath(processId);

    this.process = {
      id: processId,
      path: processPath,
      name: basename(processPath)
    };
  }

  getBounds() {
    if (platform() !== "win32") return;

    const bounds = addon.getWindowBounds(this.handle);
    const sf = windowManager.getScaleFactor(this.getMonitor());

    bounds.x = Math.round(bounds.x / sf);
    bounds.y = Math.round(bounds.y / sf);
    bounds.width = Math.round(bounds.width / sf);
    bounds.height = Math.round(bounds.height / sf);

    return bounds;
  }

  setBounds(bounds: Rectangle) {
    if (platform() !== "win32") return;

    const newBounds = { ...this.getBounds(), ...bounds };
    const sf = windowManager.getScaleFactor(this.getMonitor());

    newBounds.x = Math.round(newBounds.x * sf);
    newBounds.y = Math.round(newBounds.y * sf);
    newBounds.width = Math.round(newBounds.width * sf);
    newBounds.height = Math.round(newBounds.height * sf);

    addon.setWindowBounds(this.handle, newBounds);
  }

  getTitle() {
    if (platform() !== "win32") return;
    return addon.getWindowTitle(this.handle);
  }

  getMonitor() {
    if (platform() !== "win32") return;
    return addon.getMonitorFromWindow(this.handle);
  }

  show() {
    if (platform() !== "win32") return;
    addon.showWindow(this.handle, "show");
  }

  hide() {
    if (platform() !== "win32") return;
    addon.showWindow(this.handle, "hide");
  }

  minimize() {
    if (platform() !== "win32") return;
    addon.showWindow(this.handle, "minimize");
  }

  restore() {
    if (platform() !== "win32") return;
    addon.showWindow(this.handle, "restore");
  }

  maximize() {
    if (platform() !== "win32") return;
    addon.showWindow(this.handle, "maximize");
  }

  bringToTop() {
    if (platform() !== "win32") return;
    addon.bringToTop(this.handle);
  }

  redraw() {
    if (platform() !== "win32") return;
    addon.redrawWindow(this.handle);
  }

  isWindow() {
    if (platform() !== "win32") return;
    return addon.isWindow(this.handle);
  }

  toggleTransparency(toggle: boolean) {
    if (platform() !== "win32") return;
    addon.toggleWindowTransparency(this.handle, toggle);
  }

  setOpacity(opacity: number) {
    if (platform() !== "win32") return;
    addon.setWindowOpacity(this.handle, opacity);
  }

  getOpacity() {
    if (platform() !== "win32") return;
    return addon.getWindowOpacity(this.handle);
  }

  setOwner(window: Window | null | number) {
    if (platform() !== "win32") return;

    let handle = window;

    if (window instanceof Window) {
      handle = window.handle;
    } else if (!window) {
      handle = 0;
    }

    addon.setWindowOwner(this.handle, handle);
  }

  getOwner() {
    return new Window(addon.getWindowOwner(this.handle));
  }
}
