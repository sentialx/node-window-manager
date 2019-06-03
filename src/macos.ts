import { join } from "path";
import { spawn } from "child_process";
import { EventEmitter } from "events";

const bin = join(__dirname, "../macos");

const p = spawn(bin);

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

  callSync(cmd: string): Promise<string> {
    return new Promise(async resolve => {
      await this.checkResponse();

      this._pendingResponses++;

      p.stdin.write(`${cmd}\n`);

      p.stdout.once("data", data => {
        this.emit(`gotResponse-${this._callStack[0]}`);
        this._pendingResponses--;
        resolve(data.toString());
      });
    });
  }

  async callAsync(cmd: string) {
    await this.checkResponse();
    p.stdin.write(`${cmd}\n`);
  }

  async getActiveWindow(): Promise<number> {
    return parseInt(await this.callSync("getActiveWindow"), 10);
  }

  async getWindowTitle(id: number) {
    return await this.callSync(`getTitle ${id}`);
  }

  async initializeWindow(id: number): Promise<any> {
    return JSON.parse(await this.callSync(`initializeWindow ${id}`));
  }

  async getWindowBounds(id: number) {
    return JSON.parse(await this.callSync(`getBounds ${id}`));
  }

  async isWindow(id: number): Promise<boolean> {
    return (await this.callSync(`isWindow ${id}`)) == "true";
  }

  async setWindowBounds(id: number, { x, y, width, height }: any) {
    this.callAsync(`setBounds ${id} ${x} ${y} ${width} ${height}`);
  }

  async bringWindowToTop(pid: number) {
    this.callAsync(`bringToTop ${pid}`);
  }

  async setWindowMinimized(id: number, toggle: boolean) {
    this.callAsync(`setMinimized ${id} ${toggle}`);
  }
}

const macOS = new MacOS();
export { macOS };
