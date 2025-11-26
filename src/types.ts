interface Stop {
  id: string;
  name: string;
  landmarkName?: string;
  isAccessible: boolean;
}
interface StopWithTime {
  stop: Stop;
  timeOfArrival: Date;
  isTerminus: boolean;
}

interface Desserte {
  direction: string;
  stops: StopWithTime[];
}
