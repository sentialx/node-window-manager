import { Window } from "./classes/window";
import { EventEmitter } from "events";
import { getActiveWindowHandle, getWindowId } from "./bindings/windows";

let interval: any = null;

let registeredEvents: string[] = [];

class WindowManager extends EventEmitter {
  constructor() {
    super();

    let lastId: number;

    this.on("newListener", (event, listener) => {
      if (registeredEvents.indexOf(event) !== -1) return;

      if (event === "window-activated") {
        interval = setInterval(() => {
          const handle = getActiveWindowHandle();
          const newId = getWindowId(handle);

          if (lastId !== newId) {
            lastId = newId;
            this.emit("window-activated", new Window(handle));
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
    return new Window(getActiveWindowHandle());
  };
}

const windowManager = new WindowManager();

export { windowManager, Window };
