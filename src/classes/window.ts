import { addon } from "..";
import extractFileIcon from "extract-file-icon";
import { Monitor } from "./monitor";
import { IRectangle } from "../interfaces";
import { EmptyMonitor } from "./empty-monitor";

export class Window {
  public id: number;

  public processId: number;
  public path: string;

  constructor(id: number) {
    if (!addon) return;

    this.id = id;
    const { processId, path } = addon.initWindow(id);
    this.processId = processId;
    this.path = path;
  }

  getBounds(): IRectangle {
    if (!addon) return;

    const bounds = addon.getWindowBounds(this.id);

    if (process.platform === "win32") {
      const sf = this.getMonitor().getScaleFactor();

      bounds.x = Math.floor(bounds.x / sf);
      bounds.y = Math.floor(bounds.y / sf);
      bounds.width = Math.floor(bounds.width / sf);
      bounds.height = Math.floor(bounds.height / sf);
    }

    return bounds;
  }

  setBounds(bounds: IRectangle) {
    if (!addon) return;

    const newBounds = { ...this.getBounds(), ...bounds };

    if (process.platform === "win32") {
      const sf = this.getMonitor().getScaleFactor();

      newBounds.x = Math.floor(newBounds.x * sf);
      newBounds.y = Math.floor(newBounds.y * sf);
      newBounds.width = Math.floor(newBounds.width * sf);
      newBounds.height = Math.floor(newBounds.height * sf);

      addon.setWindowBounds(this.id, newBounds);
    } else if (process.platform === "darwin") {
      addon.setWindowBounds(this.id, newBounds);
    }
  }

  getTitle(): string {
    if (!addon) return;
    return addon.getWindowTitle(this.id);
  }

  getMonitor(): Monitor | EmptyMonitor {
    if (!addon || !addon.getMonitorFromWindow) return new EmptyMonitor();
    return new Monitor(addon.getMonitorFromWindow(this.id));
  }

  show() {
    if (!addon || !addon.showWindow) return;
    addon.showWindow(this.id, "show");
  }

  hide() {
    if (!addon || !addon.showWindow) return;
    addon.showWindow(this.id, "hide");
  }

  minimize() {
    if (!addon) return;

    if (process.platform === "win32") {
      addon.showWindow(this.id, "minimize");
    } else if (process.platform === "darwin") {
      addon.setWindowMinimized(this.id, true);
    }
  }

  restore() {
    if (!addon) return;

    if (process.platform === "win32") {
      addon.showWindow(this.id, "restore");
    } else if (process.platform === "darwin") {
      addon.setWindowMinimized(this.id, false);
    }
  }

  maximize() {
    if (!addon) return;

    if (process.platform === "win32") {
      addon.showWindow(this.id, "maximize");
    } else if (process.platform === "darwin") {
      addon.setWindowMaximized(this.id);
    }
  }

  bringToTop() {
    if (!addon) return;

    if (process.platform === "darwin") {
      addon.bringWindowToTop(this.id, this.processId);
    } else {
      addon.bringWindowToTop(this.id);
    }
  }

  redraw() {
    if (!addon || !addon.redrawWindow) return;
    addon.redrawWindow(this.id);
  }

  isWindow(): boolean {
    if (!addon) return;

    if (process.platform === "win32") {
      return this.path && this.path !== "" && addon.isWindow(this.id);
    } else if (process.platform === "darwin") {
      return this.path && this.path !== "" && !!addon.initWindow(this.id);
    }
  }

  isVisible(): boolean {
    if (!addon || !addon.isWindowVisible) return true;
    return addon.isWindowVisible(this.id);
  }

  toggleTransparency(toggle: boolean) {
    if (!addon || !addon.toggleWindowTransparency) return;
    addon.toggleWindowTransparency(this.id, toggle);
  }

  setOpacity(opacity: number) {
    if (!addon || !addon.setWindowOpacity) return;
    addon.setWindowOpacity(this.id, opacity);
  }

  getOpacity() {
    if (!addon || !addon.getWindowOpacity) return 1;
    return addon.getWindowOpacity(this.id);
  }

  getIcon(size: 16 | 32 | 64 | 256 = 64) {
    return extractFileIcon(this.path, size);
  }

  setOwner(window: Window | null | number) {
    if (!addon || !addon.setWindowOwner) return;

    let handle = window;

    if (window instanceof Window) {
      handle = window.id;
    } else if (!window) {
      handle = 0;
    }

    addon.setWindowOwner(this.id, handle);
  }

  getOwner() {
    if (!addon || !addon.getWindowOwner) return;
    return new Window(addon.getWindowOwner(this.id));
  }
}
