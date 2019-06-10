"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const window_1 = require("./classes/window");
exports.Window = window_1.Window;
const events_1 = require("events");
const windows_1 = require("./bindings/windows");
const ffi = require("ffi");
const ref = require("ref");
let interval = null;
let registeredEvents = [];
class WindowManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.getActiveWindow = () => {
            return new window_1.Window(windows_1.getActiveWindowHandle());
        };
        this.getWindows = () => {
            const windows = [];
            const callback = ffi.Callback("bool", ["int64", "int64"], (hwnd, lParam) => {
                windows.push(new window_1.Window(hwnd));
                return true;
            });
            windows_1.user32.EnumWindows(callback, 0);
            return windows;
        };
        this.getMonitorFromWindow = (window) => {
            return windows_1.user32.MonitorFromWindow(window.handle, 0);
        };
        this.getScaleFactor = (monitor) => {
            if (!windows_1.shellScaling)
                return 1;
            const sfRef = ref.alloc("int");
            windows_1.shellScaling.GetScaleFactorForMonitor(monitor, sfRef);
            return sfRef.deref() / 100;
        };
        this.getMousePoint = () => {
            return windows_1.getCursorPos();
        };
        let lastId;
        this.on("newListener", event => {
            if (registeredEvents.indexOf(event) !== -1)
                return;
            if (event === "window-activated") {
                interval = setInterval(() => {
                    const handle = windows_1.getActiveWindowHandle();
                    if (lastId !== handle) {
                        lastId = handle;
                        this.emit("window-activated", new window_1.Window(handle));
                    }
                }, 50);
            }
            else {
                return;
            }
            registeredEvents.push(event);
        });
        this.on("removeListener", event => {
            if (this.listenerCount(event) > 0)
                return;
            if (event === "window-activated") {
                clearInterval(interval);
            }
            registeredEvents = registeredEvents.filter(x => x !== event);
        });
    }
}
const windowManager = new WindowManager();
exports.windowManager = windowManager;
//# sourceMappingURL=index.js.map