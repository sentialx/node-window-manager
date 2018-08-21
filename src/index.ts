import { Windows } from "./classes";

const addon = require("bindings")("windows-window-manager");

const createMouseUpHook = (callback: () => void) => {
  addon.createMouseUpHook(() => {
    callback();
  });
};

export * from "./constants";
export * from "./classes";

export const windows = new Windows();
