const addon = require("bindings")("windows-window-manager");

addon.createMouseHook(event => {
  process.send(event);
});
