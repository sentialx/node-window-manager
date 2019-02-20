const { windowManager } = require("./dist/index");

windowManager.on("window-activated", window => {
  console.log(window.getTitle());
});

windowManager.on("mouse-up", () => {
  console.log("mouse-up");
});
