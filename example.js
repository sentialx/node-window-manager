const { windowManager, Window } = require("./dist/index");

const window = new Window(14026);

setInterval(() => {
  window.bringToTop();
}, 100);
