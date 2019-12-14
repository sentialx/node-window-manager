export interface IRectangle {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface IMonitorInfo {
  id: number;
  bounds?: IRectangle;
  isPrimary?: boolean;
  workArea?: IRectangle;
}
