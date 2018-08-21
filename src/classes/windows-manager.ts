import { Window, EventEmitter } from ".";

const addon = require("bindings")("windows-window-manager");

export class WindowsManager {
  public onActivated: EventEmitter = new EventEmitter("window-activated");

  getActive() {
    return new Window(addon.getActiveWindow());
  }
}
