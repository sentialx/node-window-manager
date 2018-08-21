import { WindowsManager, Window } from "./classes";
import {
  GWL,
  HWND,
  AncestorFlags,
  SWP,
  WindowStates,
  WindowStyles
} from "./constants";

const addon = require("bindings")("windows-window-manager");

const windowsManager = new WindowsManager();

export {
  GWL,
  HWND,
  AncestorFlags,
  SWP,
  WindowStates,
  WindowStyles,
  WindowsManager,
  windowsManager,
  Window
};
