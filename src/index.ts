import { Window } from "../";
import { EventEmitter } from "events";

const addon = require("bindings")("windows-window-manager");

const createMouseUpHook = (callback: () => void) => {
  addon.createMouseUpHook(() => {
    callback();
  });
};

let interval: any = null;

let registeredEvents: string[] = [];

class WindowManager extends EventEmitter {
  constructor() {
    super();

    let win: number;

    this.on("newListener", (event, listener) => {
      if (registeredEvents.indexOf(event) !== -1) return;

      if (event === "window-activated") {
        interval = setInterval(() => {
          const window = addon.getActiveWindow();
          if (win !== window) {
            win = window;
            this.emit("window-activated", new Window(window));
          }
        }, 50);
      } else if (event === "mouse-up") {
      } else {
        return;
      }

      registeredEvents.push(event);
    });

    this.on("removeListener", event => {
      if (this.listenerCount(event) > 0) return;

      if (event === "window-activated") {
        clearInterval(interval);
      } else if (event === "mouse-up") {
      }

      registeredEvents = registeredEvents.filter(x => x !== event);
    });
  }

  getActiveWindow = () => {
    return new Window(addon.getActiveWindow());
  };
}
