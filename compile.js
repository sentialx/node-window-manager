const os = require("os");
const { spawn } = require("child_process");

if (os.platform() === "darwin") {
  spawn("npm", ["run", "build-darwin"], { cwd: __dirname, stdio: "inherit" });
}
