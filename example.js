const addon = require("bindings")("addon");

console.log(addon.getActiveWindow());
console.log(addon.getWindows());
