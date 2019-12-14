const { windowManager } = require("./dist/index");

windowManager.requestAccessibility(); // required on macOS

const window = windowManager.getActiveWindow();
console.log(window.getTitle());

const bounds = window.getBounds();
console.log(bounds);

// window.setBounds({ x: 0, y: 0 });
window.maximize();

setTimeout(() => {
   window.setBounds(bounds);
}, 1000);

console.log("Windows list");
windowManager.getWindows().forEach(window => {
   if (window.isVisible()) {
      console.log(window.getTitle());
   }
});

console.log("Monitors list");
windowManager.getMonitors().forEach(monitor => {
   console.log(monitor.getWorkArea());
});
