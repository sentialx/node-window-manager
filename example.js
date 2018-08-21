const {
  getActiveWindow,
  onWindowActivated,
  createMouseUpHook,
  windows
} = require("./build/index");

windows.onActivated.addListener(window => {
  console.log(window.handle);
});
