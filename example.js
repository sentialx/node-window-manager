const { windowManager } = require("./dist/index");
const fs = require("fs");

windowManager.on("window-activated", window => {
  console.log(window.getTitle());
  console.log(window.handle);
  window.setMaximizable(false);
});

windowManager.on("mouse-up", () => {
  console.log("mouse-up");
});
