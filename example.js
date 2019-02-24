const { windowManager } = require("./dist/index");
const fs = require("fs");

windowManager.on("window-activated", window => {
  console.log(window.getNextWindow().getTitle());
});
