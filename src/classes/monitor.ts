import { addon } from "..";
import { IMonitorInfo, IRectangle } from "../interfaces";
import { release } from "os";

export class Monitor {
  public id: number;

  constructor(id: number) {
    if (process.platform !== 'win32' || !addon) return;

    this.id = id;
  }

  getInfo(): IMonitorInfo {
    if (process.platform !== 'win32' || !addon) return;
    return addon.getMonitorInfo(this.id);
  }

  getBounds(): IRectangle {
    if (process.platform !== 'win32' || !addon) return;
    return this.getInfo().bounds;
  }

  getWorkArea(): IRectangle {
    if (process.platform !== 'win32' || !addon) return;
    return this.getInfo().workArea;
  }

  isPrimary(): boolean {
    if (process.platform !== 'win32' || !addon) return;
    return this.getInfo().isPrimary;
  }

  getScaleFactor(): number {
    if (process.platform !== 'win32' || !addon) return;

    const numbers = release()
      .split(".")
      .map(d => parseInt(d, 10));

    if (numbers[0] > 8 || (numbers[0] === 8 && numbers[1] >= 1)) {
      return addon.getMonitorScaleFactor(this.id);
    }

    return 1;
  };
}
