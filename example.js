const { windowManager } = require("./dist/index");
const ref = require("ref");

const currentWindow = windowManager.getActiveWindow();

windowManager.on("window-activated", window => {
  console.log(window.getTitle());
  console.log(window.handle);
});

windowManager.on("mouse-up", () => {
  console.log("mouse-up");
});
