import { Window } from "./classes/window";
import { EventEmitter } from "events";
import { getActiveWindowHandle, getWindowId } from "./bindings/windows";
import { fork, ChildProcess } from "child_process";

let interval: any = null;

let registeredEvents: string[] = [];

let mouseProcess: ChildProcess;

class WindowManager extends EventEmitter {
  constructor() {
    super();

    let lastId: number;

    this.on("newListener", event => {
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
        mouseProcess = fork("./events/mouse.js");

        mouseProcess.on("message", msg => {
          if (msg === "mouse-up") {
            this.emit("mouse-up");
          }
        });
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
