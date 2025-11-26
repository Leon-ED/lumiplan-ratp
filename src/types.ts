export interface Stop {
  id: string;
  name: string;
  landmarkName?: string;
  isAccessible: boolean;
}
export interface StopWithTime {
  stop: Stop;
  timeOfArrival: string;
  isTerminus: boolean;
  isFirstStop: boolean;
  isStopSkipped: boolean;
}

export interface Desserte {
  direction: string;
  stops: StopWithTime[];
}

export enum Mode{
  BUS = "BUS",
  NOCTILIEN = "NOCTILIEN",
  TRAM = "TRAM",
  METRO = "METRO",
  RER = "RER",
  TRANSILIEN = "TRANSILIEN",
  CABLE = "CABLE"
}

export interface Line{
  id: string;
  name: string;
  color: string;
  textColor: string;
  mode: Mode;
}
