const windowsManager = require("./dist/index");

console.log(windowsManager);

windowsManager.default.onActivated.addListener(window => {
  console.log(window.handle);
});
