import { join } from "path";
import { spawn, execFileSync } from "child_process";
import { EventEmitter } from "events";

const bin = join(__dirname, "../macos");
const p = spawn(bin);

const deasync = require("deasync");

export const makeId = (
  length: number,
  possible: string = "abcdefghijklmnopqrstuvwxyz"
) => {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return id;
};

class MacOS extends EventEmitter {
  private _callStack: string[] = [];
  private _pendingResponses = 0;

  checkResponse() {
    return new Promise(resolve => {
      if (this._pendingResponses === 0) {
        resolve();
      } else {
        const id = makeId(32);
        this._callStack.push(id);
        this.once(`gotResponse-${id}`, () => {
          resolve();
        });
      }
    });
  }

  callSync(cmd: string) {
    p.stdin.write(`${cmd}\n`);

    let data: string;

    p.stdout.once("data", d => {
      data = d.toString();
    });

    while (!data) deasync.roo;
    deasync.loopWhile(() => !data);

    return data;
  }

  callAsync(cmd: string) {
    p.stdin.write(`${cmd}\n`);
  }

  getActiveWindow() {
    return parseInt(this.callSync("getActiveWindow"), 10);
  }

  getWindowTitle(id: number) {
    return this.callSync(`getTitle ${id}`);
  }

  initializeWindow(id: number) {
    return JSON.parse(this.callSync(`initializeWindow ${id}`));
  }

  getWindowBounds(id: number) {
    return JSON.parse(this.callSync(`getBounds ${id}`));
  }

  isWindow(id: number) {
    return this.callSync(`isWindow ${id}`) == "true";
  }

  setWindowBounds(id: number, { x, y, width, height }: any) {
    this.callAsync(`setBounds ${id} ${x} ${y} ${width} ${height}`);
  }

  bringWindowToTop(pid: number) {
    this.callAsync(`bringToTop ${pid}`);
  }

  setWindowMinimized(id: number, toggle: boolean) {
    this.callAsync(`setMinimized ${id} ${toggle}`);
  }
}

const macOS = new MacOS();
export { macOS };
