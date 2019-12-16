import { IRectangle } from "../interfaces";

export class EmptyMonitor {
  getBounds(): IRectangle {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  getWorkArea(): IRectangle {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  isPrimary(): boolean {
    return false;
  }

  getScaleFactor(): number {
    return 1;
  };

  isValid(): boolean {
    return false;
  }
}
