export interface Stop {
  id: string;
  parentId?: string;
  name: string;
  landmarkName?: string;
  subtitle?: string;
  isAccessible: boolean;
  hasGapWhenSteppingOff: boolean;
  connectedLines: Line[];
}

export interface StopWithTime {
  stop: Stop;
  timeOfArrival: string;
  timeOfDeparture: string;
  isTerminus: boolean;
  isFirstStop: boolean;
  isStopSkipped: boolean;
  travelTime?: number;
}
export interface DesserteWithLine {
  line: Line;
  desserte: Desserte;
}
export interface Desserte {
  id: string;
  direction: string;
  isLimitedService: boolean;
  stops: StopWithTime[];
}
export interface InfoTraffic {
  id: string;
  title: string;
  message: string;
  effect: "SUSPENDED" | "DISRUPTED" | "DEVIATED" | "WORKS" | "STRIKE" | "INFO";
  status: "PAST" | "ACTIVE" | "FUTURE";
  cause: string;
  impactedLines: string[];
}
export enum Mode {
  BUS = "BUS",
  BUS_REMPLACEMENT = "BUS_REMPLACEMENT",
  NOCTILIEN = "NOCTILIEN",
  TRAM = "TRAM",
  METRO = "METRO",
  RER = "RER",
  TER = "TER",
  TRANSILIEN = "TRANSILIEN",
  CABLE = "CABLE",
}
export interface Line {
  id: string;
  name: string;
  color: string;
  textColor: string;
  mode: Mode;
  linkedLine?: Line;
}

export interface SaveFileHeader {
  dateTime: string;
  version: string;
  name: string;
}
export interface SaveInfoTrafic {
  effect: "SUSPENDED" | "DISRUPTED" | "DEVIATED" | "WORKS" | "STRIKE" | "INFO";
  message: string;
}
export interface SaveFile {
  header: SaveFileHeader;
  lines: Line[];
  journey: DesserteWithLine;
  messages: SaveInfoTrafic[];
}
export interface PassengerMessage {
  bgColor: string;
  message: string;
  subText?: string;
  duration?: number;
  audio?: string;
}
export interface Article {
  title: string;
  text: string;
  images: string[];
}

export interface VehicleJourney {
  id: string;
  routeId: string;
  directionId: string;
  headsign: string;
  shortName: string;
  originStop: DestinationStop;
  destinationStop: DestinationStop;
  areBikesAllowed: boolean;
  isWheelchairAccessible: boolean;
  stopTimes: StopTime[];
}

export interface DestinationStop {
  stopRef: string;
  stopName: string;
  transportationModes: any[];
}

export interface StopTime {
  stopPoint: DestinationStop;
  arrivalTime: string;
  departureTime: string;
  order: number;
  status: Status;
}

export enum Status {
  FirstStop = "first_stop",
  LastStop = "last_stop",
  NormalStop = "normal_stop",
}
