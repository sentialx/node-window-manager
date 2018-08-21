import { WindowsManager } from "./classes";

const addon = require("bindings")("windows-window-manager");

const createMouseUpHook = (callback: () => void) => {
  addon.createMouseUpHook(() => {
    callback();
  });
};

export * from "./constants";
export * from "./classes";

export default new WindowsManager();
