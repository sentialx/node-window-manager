import { WindowsManager } from "./classes";

const addon = require("bindings")("windows-window-manager");

export * from "./constants";
export * from "./classes";

export default new WindowsManager();
