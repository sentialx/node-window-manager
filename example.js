const { windowManager } = require("./dist/index");

console.time("getActiveWindow");
const window = windowManager.getActiveWindow();
console.timeEnd("getActiveWindow");

console.log(window.path);
