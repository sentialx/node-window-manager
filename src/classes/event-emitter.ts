import { Window } from ".";

const addon = require("bindings")("windows-window-manager");

export class EventEmitter {
  private listeners: ((...args: any[]) => void)[];
  private interval: any;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.listeners = [];
    if (this.name === "window-activated") {
      let win: number;
      this.interval = setInterval(() => {
        const window = addon.getActiveWindow();
        if (win !== window) {
          win = window;
          this.emit(new Window(window));
        }
      }, 50);
    }
  }

  addListener(callback: (...args: any[]) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (...args: any[]) => void) {
    this.listeners.splice(this.listeners.indexOf(callback));
  }

  emit(...args: any[]) {
    for (const cb of this.listeners) {
      if (typeof cb === "function") cb(...args);
    }
  }
}
