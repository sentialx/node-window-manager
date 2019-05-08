import { Window } from "./classes/window";
import { EventEmitter } from "events";
import { platform } from "os";

const addon = require("bindings")("addon");

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
    if (platform() !== "win32") return;
    return new Window(addon.getActiveWindow());
  };
}

const windowManager = new WindowManager();

export { windowManager, Window };
