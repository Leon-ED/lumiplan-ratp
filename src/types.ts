interface Stop {
  id: string;
  name: string;
  landmarkName?: string;
  isAccessible: boolean;
}
interface StopWithTime {
  stop: Stop;
  timeOfArrival: string;
  isTerminus: boolean;
  isFirstStop: boolean;
}

interface Desserte {
  direction: string;
  stops: StopWithTime[];
}

enum Mode{
  BUS = "BUS",
  NOCTILIEN = "NOCTILIEN",
  TRAMWAY = "TRAMWAY",
  METRO = "METRO",
  RER = "RER",
  TRANSILIEN = "TRANSILIEN",
  CABLE = "CABLE"
}

interface Line{
  id: string;
  name: string;
  color: string;
  textColor: string;
  mode: Mode;
}
