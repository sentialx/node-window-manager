const { windowManager } = require("./dist/index");

console.time("getActiveWindow");
const window = windowManager.getActiveWindow();
console.timeEnd("getActiveWindow");

console.time("getTitle");
console.log(window.getTitle());
console.timeEnd("getTitle");

console.time("getBounds");
console.log(window.getBounds());
console.timeEnd("getBounds");
