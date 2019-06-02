const { windowManager } = require("./dist/index");

const window = windowManager.getActiveWindow();
console.log(window);
console.log(window.getBounds());
console.log(window.getTitle());
window.setBounds({ x: 0, y: 0 });
