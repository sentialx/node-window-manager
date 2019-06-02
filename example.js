const { windowManager, Window } = require("./dist/index");

const window = windowManager.getActiveWindow();
window.minimize();

setTimeout(() => {
  window.restore();
}, 3000);
