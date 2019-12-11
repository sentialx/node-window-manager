const { windowManager } = require("./dist/index");

console.time("getActiveWindow");
const window = windowManager.getActiveWindow();
console.timeEnd("getActiveWindow");
console.log(windowManager.getWindows());
console.time("getTitle");
console.log(window.getTitle());
console.timeEnd("getTitle");

console.time("getBounds");
console.log(window.getBounds());
console.timeEnd("getBounds");

console.time("setBounds");
// window.setBounds({ x: 0, y: 0 });
window.maximize();

console.timeEnd("setBounds");

console.log("[info]: Visible Windows List");
windowManager.getWindows().forEach(window => {
   console.log('Title: '+window.getTitle(), '\n', 'Path: '+window.path);
});