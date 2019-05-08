const { windowManager } = require("./dist/index");

windowManager.on("window-activated", window => {
  console.log(window);
  console.log(windowManager.getScaleFactor(window.getMonitor()));
  console.log(window.getBounds());
});
