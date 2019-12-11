import { Window } from "./classes/window";
import { EventEmitter } from "events";
import { platform, release } from "os";

let addon: any;

if (platform() === "win32" || platform() === "darwin") {
  let path_addon: string = (process.env.NODE_ENV != "dev") ? "Release" : "Debug";
  addon = require(`../build/${path_addon}/addon.node`);
}

let interval: any = null;

let registeredEvents: string[] = [];

class WindowManager extends EventEmitter {
  constructor() {
    super();

    let lastId: number;

    if (!addon) return;

    this.on("newListener", event => {
      if (registeredEvents.indexOf(event) !== -1) return;

      if (event === "window-activated") {
        interval = setInterval(async () => {
          const win = addon.getActiveWindow();

          if (lastId !== win.id) {
            lastId = win.id;
            this.emit("window-activated", new Window(win));
          }
        }, 50);
      } else {
        return;
      }

      registeredEvents.push(event);
    });

    this.on("removeListener", event => {
      if (this.listenerCount(event) > 0) return;

      if (event === "window-activated") {
        clearInterval(interval);
      }

      registeredEvents = registeredEvents.filter(x => x !== event);
    });
  }

  requestAccessibility = () => {
    if (platform() !== 'darwin') return true;
    return addon.requestAccessibility();
  }

  getActiveWindow = () => {
    if (!addon) return;
    return new Window(addon.getActiveWindow());
  };

  getScaleFactor = (monitor: number) => {
    if (platform() !== "win32") return;

    const numbers = release()
      .split(".")
      .map(d => parseInt(d, 10));

    if (numbers[0] > 8 || (numbers[0] === 8 && numbers[1] >= 1)) {
      return addon.getMonitorScaleFactor(monitor);
    }

    return 1;
  };

  getWindows = () => {
    if (!addon || !addon.getWindows) return;
    return addon.getWindows().map((win: any) => new Window(win)).filter((x: Window) => x.isWindow());
  };
}

const windowManager = new WindowManager();

export { windowManager, Window };
