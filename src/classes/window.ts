import { platform } from "os";
import { windowManager, addon } from "..";
import extractFileIcon from 'extract-file-icon';
import { Monitor } from "./monitor";

interface Rectangle {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface WindowInfo {
  id: number;
  path: string;
  processId: number;
  title?: string;
  bounds?: Rectangle;
  opacity?: number;
  owner?: number;
}

export class Window {
  public id: number;

  public processId: number;
  public path: string;

  constructor(id: number) {
    if (!addon) return;

    this.id = id;
    const { processId, path } = this.getInfo();
    this.processId = processId;
    this.path = path;
  }

  getBounds(): Rectangle {
    if (!addon) return;

    const { bounds } = this.getInfo();

    if (platform() === "win32") {
      const sf = this.getMonitor().getScaleFactor();

      bounds.x = Math.floor(bounds.x / sf);
      bounds.y = Math.floor(bounds.y / sf);
      bounds.width = Math.floor(bounds.width / sf);
      bounds.height = Math.floor(bounds.height / sf);
    }

    return bounds;
  }

  setBounds(bounds: Rectangle) {
    if (!addon) return;

    const newBounds = { ...this.getBounds(), ...bounds };

    if (platform() === "win32") {
      const sf = this.getMonitor().getScaleFactor();

      newBounds.x = Math.floor(newBounds.x * sf);
      newBounds.y = Math.floor(newBounds.y * sf);
      newBounds.width = Math.floor(newBounds.width * sf);
      newBounds.height = Math.floor(newBounds.height * sf);

      addon.setWindowBounds(this.id, newBounds);
    } else if (platform() === "darwin") {
      addon.setWindowBounds(this.id, newBounds);
    }
  }

  getTitle(): string {
    if (!addon) return;
    return this.getInfo().title;
  }

  getMonitor(): Monitor {
    if (!addon || !addon.getMonitorFromWindow) return;
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

    if (platform() === "win32") {
      addon.showWindow(this.id, "minimize");
    } else if (platform() === "darwin") {
      addon.setWindowMinimized(this.id, true);
    }
  }

  restore() {
    if (!addon) return;

    if (platform() === "win32") {
      addon.showWindow(this.id, "restore");
    } else if (platform() === "darwin") {
      addon.setWindowMinimized(this.id, false);
    }
  }

  maximize() {
    if(platform() === "win32") {
      if (!addon || !addon.showWindow) return;
      addon.showWindow(this.id, "maximize");
    } else if(platform() === "darwin") {
      if (!addon) return;
      addon.setWindowMaximized(this.id);
    } 
  }

  bringToTop() {
    if (!addon) return;
    if (process.platform === 'darwin') {
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
    if (platform() === "win32") return this.path && this.path !== '' && addon.isWindow(this.id);
    else if (platform() === "darwin") return this.path && this.path !== '' && !!this.getInfo();
  }

  isVisible(): boolean {
    if (!addon) return;
    if (platform() === "win32") return addon.isVisible(this.id);
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
    if (platform() !== "win32") return;
    return this.getInfo().opacity;
  }

  getIcon(size: 16 | 32 | 64 | 256 = 64) {
    return extractFileIcon(this.path, size);
  }

  setOwner(window: Window | null | number) {
    if (!addon || platform() !== "win32") return;

    let handle = window;

    if (window instanceof Window) {
      handle = window.id;
    } else if (!window) {
      handle = 0;
    }

    addon.setWindowOwner(this.id, handle);
  }

  getOwner() {
    if (!addon || platform() !== "win32") return;
    return new Window(this.getInfo().owner);
  }

  getInfo(): WindowInfo {
    if (!addon) return;

    const info = addon.getWindowInfo(this.id);

    return info;
  }
}
