const { windowManager } = require("./dist/index");

windowManager.on("window-activated", window => {
  console.log(window);
  console.log(window.getTitle());
  console.log(windowManager.getScaleFactor(window.getMonitor()));
  console.log(window.getBounds());
  console.log(window.setBounds({ x: 0, y: 0 }));
});
