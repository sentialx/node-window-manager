const os = require("os");
const { spawn } = require("child_process");

if (os.platform() === "win32") {
  spawn.sync("npm", ["run", "build-win32"], {
    input: "win32 detected. Build native module.",
    stdio: "inherit"
  });
}
