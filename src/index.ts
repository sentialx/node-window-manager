import { Window } from "./classes/window";
import { EventEmitter } from "events";
import {
  getActiveWindowHandle,
  user32,
  shellScaling,
  getCursorPos
} from "./bindings/windows";

const ffi = require("ffi");
const ref = require("ref");

let interval: any = null;

let registeredEvents: string[] = [];

class WindowManager extends EventEmitter {
  constructor() {
    super();

    let lastId: number;

    this.on("newListener", event => {
      if (registeredEvents.indexOf(event) !== -1) return;

      if (event === "window-activated") {
        interval = setInterval(() => {
          const handle = getActiveWindowHandle();

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
    return new Window(getActiveWindowHandle());
  };

  getWindows = () => {
    const windows: Window[] = [];
    const callback = ffi.Callback(
      "bool",
      ["int64", "int64"],
      (hwnd: number, lParam: number) => {
        windows.push(new Window(hwnd));
      }
    );

    user32.EnumWindows(callback, 0);
    return windows;
  };

  getMonitorFromWindow = (window: Window) => {
    return user32.MonitorFromWindow(window.handle, 0);
  };

  getScaleFactor = (monitor: number) => {
    if (!shellScaling) return 1;

    const sfRef = ref.alloc("int");
    shellScaling.GetScaleFactorForMonitor(monitor, sfRef);

    return sfRef.deref() / 100;
  };

  getMousePoint = () => {
    return getCursorPos();
  };
}

const windowManager = new WindowManager();

export { windowManager, Window };
