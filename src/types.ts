export interface Stop {
  id: string;
  name: string;
  landmarkName?: string;
  isAccessible: boolean;
  connectedLines: Line[];
}

export interface StopWithTime {
  stop: Stop;
  timeOfArrival: string;
  isTerminus: boolean;
  isFirstStop: boolean;
  isStopSkipped: boolean;
}

export interface Desserte {
  id: string;
  direction: string;
  stops: StopWithTime[];
}
export interface InfoTraffic{
  id: string;
  title: string;
  message: string;
  effect: 'SUSPENDED' | 'DISRUPTED' | 'DEVIATED' | 'WORKS' | 'STRIKE' | 'INFO';
  status: "PAST" | "ACTIVE" | "FUTURE";
  impactedLines: string[];
}
export enum Mode{
  BUS = "BUS",
  NOCTILIEN = "NOCTILIEN",
  TRAM = "TRAM",
  METRO = "METRO",
  RER = "RER",
  TER = "TER",
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
