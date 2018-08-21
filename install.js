const os = require("os");
const { spawn } = require("child_process");

if (os.platform() === "win32") {
  spawn("npm.cmd", ["run", "build-win32"], { cwd: __dirname });
  spawn("npm.cmd", ["run", "build"], { cwd: __dirname });
} else {
  spawn("npm", ["run", "build"], { cwd: __dirname });
}
