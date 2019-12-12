export interface IRectangle {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface IWindowInfo {
  id: number;
  path: string;
  processId: number;
  title?: string;
  bounds?: IRectangle;
  opacity?: number;
  owner?: number;
}

export interface IMonitorInfo {
  id: number;
  bounds?: IRectangle;
  isPrimary?: boolean;
  workArea?: IRectangle;
}
