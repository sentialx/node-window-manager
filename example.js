const { windowManager } = require("./dist/index");

const window = windowManager.getActiveWindow();
console.log(window);
