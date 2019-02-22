const { windowManager } = require("./dist/index");

const currentWindow = windowManager.getActiveWindow();

windowManager.on("window-activated", window => {
  console.log(window.getTitle());
  console.log(window.handle);

  if (currentWindow.id !== window.id) {
    window.setParent(currentWindow);
  }
});

windowManager.on("mouse-up", () => {
  console.log("mouse-up");
});
