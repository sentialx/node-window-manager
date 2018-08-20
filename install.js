const os = require("os");
const { spawn } = require("child_process");

if (os.platform() === "win32") {
  const npm = spawn("npm.cmd", ["run", "build-win32"], { cwd: __dirname, stdio: "inherit" });
}
