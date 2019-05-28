const os = require("os");
const { spawn } = require("child_process");

if (os.platform() === "win32") {
  spawn("npm.cmd", ["run", "build-win32"], { cwd: __dirname });
}
