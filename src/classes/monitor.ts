import { addon } from "..";
import { IMonitorInfo, IRectangle } from "../interfaces";
import { release } from "os";

const getMonitorInfo = (id: number): IMonitorInfo => {
  if (!addon || !addon.getMonitorInfo) return;
  return addon.getMonitorInfo(id);
}

export class Monitor {
  public id: number;

  constructor(id: number) {
    this.id = id;
  }

  getBounds(): IRectangle {
    return getMonitorInfo(this.id).bounds;
  }

  getWorkArea(): IRectangle {
    return getMonitorInfo(this.id).workArea;
  }

  isPrimary(): boolean {
    return getMonitorInfo(this.id).isPrimary;
  }

  getScaleFactor(): number {
    if (!addon || !addon.getMonitorScaleFactor) return;

    const numbers = release()
      .split(".")
      .map(d => parseInt(d, 10));

    if (numbers[0] > 8 || (numbers[0] === 8 && numbers[1] >= 1)) {
      return addon.getMonitorScaleFactor(this.id);
    }

    return 1;
  };

  isValid(): boolean {
    return addon && addon.getMonitorInfo;
  }
}
