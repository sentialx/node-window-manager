import { basename } from "path";
import { platform } from "os";
import { windowManager } from "..";
import {
  getWindowInfoById,
  setWindowBounds,
  bringToTop,
  minimizeWindow
} from "../macos";

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

    if (platform() === "win32") {
      const processId = addon.getWindowProcessId(handle);
      const processPath = addon.getProcessPath(processId);

      this.process = {
        id: processId,
        path: processPath,
        name: basename(processPath)
      };
    } else if (platform() === "darwin") {
      const windowData = getWindowInfoById(handle);

      this.process = {
        id: windowData.owner.id,
        path: windowData.owner.path,
        name: basename(windowData.owner.path)
      };
    }
  }

  getBounds() {
    if (platform() === "win32") {
      const bounds = addon.getWindowBounds(this.handle);
      const sf = windowManager.getScaleFactor(this.getMonitor());

      bounds.x = Math.round(bounds.x / sf);
      bounds.y = Math.round(bounds.y / sf);
      bounds.width = Math.round(bounds.width / sf);
      bounds.height = Math.round(bounds.height / sf);

      return bounds;
    } else if (platform() === "darwin") {
      return getWindowInfoById(this.handle).bounds;
    }
  }

  setBounds(bounds: Rectangle) {
    const newBounds = { ...this.getBounds(), ...bounds };

    if (platform() === "win32") {
      const sf = windowManager.getScaleFactor(this.getMonitor());

      newBounds.x = Math.round(newBounds.x * sf);
      newBounds.y = Math.round(newBounds.y * sf);
      newBounds.width = Math.round(newBounds.width * sf);
      newBounds.height = Math.round(newBounds.height * sf);

      addon.setWindowBounds(this.handle, newBounds);
    } else if (platform() === "darwin") {
      setWindowBounds(this.handle, newBounds);
    }
  }

  getTitle() {
    if (platform() === "win32") {
      return addon.getWindowTitle(this.handle);
    } else if (platform() === "darwin") {
      return getWindowInfoById(this.handle).title;
    }
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
    if (platform() === "win32") {
      addon.showWindow(this.handle, "restore");
    } else if (platform() === "darwin") {
      minimizeWindow(this.handle, true);
    }
  }

  restore() {
    if (platform() === "win32") {
      addon.showWindow(this.handle, "restore");
    } else if (platform() === "darwin") {
      minimizeWindow(this.handle, false);
    }
  }

  maximize() {
    if (platform() !== "win32") return;
    addon.showWindow(this.handle, "maximize");
  }

  bringToTop() {
    if (platform() === "win32") addon.bringToTop(this.handle);
    else if (platform() === "darwin") bringToTop(this.handle);
  }

  redraw() {
    if (platform() !== "win32") return;
    addon.redrawWindow(this.handle);
  }

  isWindow() {
    if (platform() !== "win32") return addon.isWindow(this.handle);
    else if (platform() !== "darwin") return !!getWindowInfoById(this.handle);
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
    if (platform() !== "win32") return;

    return new Window(addon.getWindowOwner(this.handle));
  }
}
