import { ref, watch, Ref } from "vue";
import { getSecondesFromDate } from "../utils";
import { AudioManager } from "../audio";
import { Desserte, Line, StopWithTime } from "../types";

export type ScreenState = "NO_DATA" | "NO_TRIP_DATA_AVAILABLE" | "FIRST_STOP" | "AT_STOP" | "NOT_AT_STOP" | "LAST_STOP" | "NOT_IN_SERVICE";

export function useScreenState(
  desserte: Ref<Desserte>,
  line: Ref<Line | null>,
  currentStop: Ref<StopWithTime | null>
) {
  const state = ref<ScreenState>("NO_DATA");
  const isAutoPassStops = ref(true);
  const forcedState = ref<ScreenState | null>(null);
  const currentSecondsToArrival = ref<number>(9999);
  
  let departingAudioPlayed = false;

  const computeState = () => {
    if (!line.value) {
      state.value = "NO_DATA";
      return;
    }
    if (desserte.value.stops.length === 0) {
      state.value = "NO_TRIP_DATA_AVAILABLE";
      return;
    }

    if (currentStop.value) {
      currentSecondsToArrival.value = getSecondesFromDate(currentStop.value.timeOfArrival);
    }

    if (!isAutoPassStops.value && forcedState.value !== null) {
      state.value = forcedState.value;
      return;
    }

    if (currentStop.value && currentStop.value.isFirstStop && currentSecondsToArrival.value >= -5) {
      state.value = "FIRST_STOP";
    } else if (
      currentStop.value &&
      !currentStop.value.isStopSkipped &&
      currentSecondsToArrival.value <= 10 &&
      getSecondesFromDate(currentStop.value.timeOfDeparture, true) >= -2
    ) {
      state.value = "AT_STOP";
    } else if (
      currentStop.value &&
      currentStop.value.isTerminus &&
      getSecondesFromDate(currentStop.value.timeOfArrival, true) >= -60 &&
      getSecondesFromDate(currentStop.value.timeOfArrival, true) <= 0
    ) {
      state.value = "NOT_IN_SERVICE";
    } else {
      state.value = "NOT_AT_STOP";
    }

    if (!isAutoPassStops.value && forcedState.value === null) {
      forcedState.value = state.value;
    }
  };

  const skipNextStop = () => {
    if (isAutoPassStops.value) return;
    if (desserte.value.stops.length === 0) return;

    if (currentStop.value?.isStopSkipped) {
      desserte.value.stops.shift();
      return;
    }

    if (state.value === "FIRST_STOP") {
      forcedState.value = "NOT_AT_STOP";
      if (currentStop.value) {
        const past = new Date();
        past.setSeconds(past.getSeconds() - 5);
        currentStop.value.timeOfArrival = new Date().toISOString()
        currentStop.value.timeOfDeparture = past.toISOString();
      }
      setTimeout(() => { desserte.value.stops.shift(); }, 2000);
      return;
    }

    if (state.value === "NOT_AT_STOP") {
      forcedState.value = "AT_STOP";
    } else if (state.value === "AT_STOP") {
      const currentIsTerminus = currentStop.value?.isTerminus;
      if (currentStop.value) {
        const past = new Date();
        past.setSeconds(past.getSeconds() - 5);
        currentStop.value.timeOfArrival = new Date().toISOString()
        currentStop.value.timeOfDeparture = past.toISOString();
      }

      setTimeout(() => { desserte.value.stops.shift(); }, 2000);

      if (currentIsTerminus || desserte.value.stops.length === 0) {
        forcedState.value = "NOT_IN_SERVICE";
      } else {
        forcedState.value = "NOT_AT_STOP";
      }
    }
  };

  watch(state, (newState) => {
    if (newState === "FIRST_STOP" && !departingAudioPlayed && line.value && desserte.value.stops.length > 0) {
      const finalStop = desserte.value.stops[desserte.value.stops.length - 1];
      AudioManager.playDirection(line.value.id, finalStop.stop.parentId ?? finalStop.stop.id);
      departingAudioPlayed = true;
    }
  });

  return {
    state,
    isAutoPassStops,
    forcedState,
    currentSecondsToArrival,
    computeState,
    skipNextStop,
  };
}