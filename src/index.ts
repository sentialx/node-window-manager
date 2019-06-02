import { Window } from "./classes/window";
import { EventEmitter } from "events";
import { platform, release } from "os";
import { getActiveWindow } from "./macos";

let addon: any;

if (platform() === "win32") {
  addon = require("bindings")("addon");
}

let interval: any = null;

let registeredEvents: string[] = [];

class WindowManager extends EventEmitter {
  constructor() {
    super();

    let lastId: number;

    if (platform() !== "win32") return;

    this.on("newListener", event => {
      if (registeredEvents.indexOf(event) !== -1) return;

      if (event === "window-activated") {
        interval = setInterval(() => {
          const handle = addon.getActiveWindow();

          if (lastId !== handle) {
            lastId = handle;
            this.emit("window-activated", new Window(handle));
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

  getActiveWindow = () => {
    if (platform() === "win32") {
      return new Window(addon.getActiveWindow());
    } else if (platform() === "darwin") {
      return new Window(getActiveWindow());
    }
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
}

const windowManager = new WindowManager();

export { windowManager, Window };
