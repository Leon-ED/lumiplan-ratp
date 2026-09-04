import { ref, watch, computed, Ref } from "vue";
import { getSecondesFromDate } from "../utils";
import { AudioManager } from "../audio";
import { Desserte, Line, StopWithTime } from "../types";
import { useClock } from "./useClock";
import { useSettings } from "./useSettings";
import { useDevicePosition } from "./useDevicePosition";

export type ScreenState =
  | "NO_DATA"
  | "NO_TRIP_DATA_AVAILABLE"
  | "FIRST_STOP"
  | "AT_STOP"
  | "NOT_AT_STOP"
  | "LAST_STOP"
  | "NOT_IN_SERVICE";

const getDistanceFromLatLonInM = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function useScreenState(
  desserte: Ref<Desserte>,
  line: Ref<Line | null>,
  currentStop: Ref<StopWithTime | null>,
) {
  const state = ref<ScreenState>("NO_DATA");

  const { progressionMode } = useSettings();

  const isAutoPassStops = computed({
    get: () => progressionMode.value === "TIME",
    set: (val: boolean) => {
      progressionMode.value = val ? "TIME" : "MANUAL";
    },
  });

  const forcedState = ref<ScreenState | null>(null);
  const currentSecondsToArrival = ref<number>(9999);

  let departingAudioPlayed = false;

  const { position: currentLocation, error: gpsError } = useDevicePosition();
  const hasReachedCurrentStop = ref(false);
  const hasInitialGpsSnapDone = ref(false);
  const pendingSkippedStopId = ref<string | null>(null);

  watch(progressionMode, (newMode) => {
    if (newMode === "GPS") {
      hasInitialGpsSnapDone.value = false;
      hasReachedCurrentStop.value = false;
      pendingSkippedStopId.value = null;
    } else {
      hasReachedCurrentStop.value = false;
      pendingSkippedStopId.value = null;
    }
  });

  watch(gpsError, (newError) => {
    if (progressionMode.value !== "GPS") return;
    if (!newError) return;

    console.warn("Erreur ou perte du signal GPS:", newError);
    state.value = "NO_TRIP_DATA_AVAILABLE";
    hasInitialGpsSnapDone.value = false;
  });

  watch(currentLocation, (loc) => {
    if (progressionMode.value !== "GPS") return;
    if (!loc) return; 

    if (desserte.value.stops.length === 0) {
      state.value = "NO_TRIP_DATA_AVAILABLE";
      return;
    }

    if (!hasInitialGpsSnapDone.value) {
      let closestIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < desserte.value.stops.length; i++) {
        const s = desserte.value.stops[i];
        if (s.stop.lat && s.stop.lon) {
          const d = getDistanceFromLatLonInM(loc.lat, loc.lon, s.stop.lat, s.stop.lon);
          if (d < minDistance) {
            minDistance = d;
            closestIndex = i;
          }
        }
      }

      if (closestIndex > 0) {
        desserte.value.stops.splice(0, closestIndex);
      }
      
      hasInitialGpsSnapDone.value = true;
      hasReachedCurrentStop.value = false;
      pendingSkippedStopId.value = null;
    }

    const activeStop = desserte.value.stops[0];
    if (!activeStop || !activeStop.stop.lat || !activeStop.stop.lon) return;

    const distanceToActive = getDistanceFromLatLonInM(
      loc.lat,
      loc.lon,
      activeStop.stop.lat,
      activeStop.stop.lon,
    );
    
    const enterRadius = activeStop.stop.radius || 150;
    const leaveRadius = enterRadius; 

    if (hasReachedCurrentStop.value && !activeStop.isStopSkipped) {
      if (distanceToActive > leaveRadius) {
        state.value = "NOT_AT_STOP";
        hasReachedCurrentStop.value = false;

        if (activeStop.isTerminus) {
          desserte.value.stops.shift();
          state.value = "NO_TRIP_DATA_AVAILABLE";
        } else {
          const departingId = activeStop.stop.id;
          setTimeout(() => {
            if (desserte.value.stops[0]?.stop.id === departingId) {
              desserte.value.stops.shift();
            }
          }, 2000);
        }
      } else {
        const targetState = activeStop.isFirstStop ? "FIRST_STOP" : "AT_STOP";
        if (state.value !== targetState) {
          state.value = targetState;
        }
      }
      return;
    }

    let inRadiusIndex = -1;
    for (let i = 0; i < desserte.value.stops.length; i++) {
      const s = desserte.value.stops[i];
      if (s.stop.lat && s.stop.lon) {
        const d = getDistanceFromLatLonInM(loc.lat, loc.lon, s.stop.lat, s.stop.lon);
        const r = s.stop.radius || 150;
        if (d <= r) {
          inRadiusIndex = i;
          break;
        }
      }
    }
    if (inRadiusIndex !== -1) {
      if (inRadiusIndex > 0) {
        desserte.value.stops.splice(0, inRadiusIndex);
      }
      
      const newActiveStop = desserte.value.stops[0];
      
      if (newActiveStop.isStopSkipped) {
        if (state.value !== "NOT_AT_STOP") state.value = "NOT_AT_STOP";
        if (pendingSkippedStopId.value !== newActiveStop.stop.id) {
          const targetId = newActiveStop.stop.id;
          pendingSkippedStopId.value = targetId;
          
          setTimeout(() => {
            if (desserte.value.stops[0]?.stop.id === targetId) {
              desserte.value.stops.shift();
            }
            if (pendingSkippedStopId.value === targetId) {
              pendingSkippedStopId.value = null;
            }
          }, 2000);
        }
      } else {
        hasReachedCurrentStop.value = true;
        pendingSkippedStopId.value = null; 
        const targetState = newActiveStop.isFirstStop ? "FIRST_STOP" : "AT_STOP";
        if (state.value !== targetState) {
          state.value = targetState;
        }
      }
    } else {
      if (state.value !== "NOT_AT_STOP") {
        state.value = "NOT_AT_STOP";
      }
    }
  });

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
      currentSecondsToArrival.value = getSecondesFromDate(
        currentStop.value.timeOfArrival,
      );
    }

    if (progressionMode.value === "GPS") {
      return;
    }

    if (progressionMode.value === "MANUAL" && forcedState.value !== null) {
      state.value = forcedState.value;
      return;
    }

    if (
      currentStop.value &&
      currentStop.value.isFirstStop &&
      currentSecondsToArrival.value >= -5
    ) {
      state.value = "FIRST_STOP";
    } else if (
      currentStop.value &&
      !currentStop.value.isStopSkipped &&
      currentSecondsToArrival.value <= 10 &&
      ((!currentStop.value.isTerminus &&
        getSecondesFromDate(currentStop.value.timeOfDeparture, true) >= -2) ||
        (currentStop.value.isTerminus &&
          getSecondesFromDate(currentStop.value.timeOfDeparture, true) >= -45))
    ) {
      state.value = "AT_STOP";
    } else if (
      currentStop.value?.isTerminus &&
      getSecondesFromDate(currentStop.value.timeOfDeparture, true) < -45
    ) {
      state.value = "NO_TRIP_DATA_AVAILABLE";
    } else {
      state.value = "NOT_AT_STOP";
    }

    if (progressionMode.value === "MANUAL" && forcedState.value === null) {
      forcedState.value = state.value;
    }
  };

  const skipNextStop = () => {
    if (progressionMode.value !== "MANUAL") return;
    if (desserte.value.stops.length === 0) return;

    if (currentStop.value?.isStopSkipped) {
      desserte.value.stops.shift();
      return;
    }

    if (state.value === "FIRST_STOP") {
      forcedState.value = "NOT_AT_STOP";
      if (currentStop.value) {
        const past = useClock().now.value;
        past.setSeconds(past.getSeconds() - 5);
        currentStop.value.timeOfArrival = useClock().now.value.toISOString();
        currentStop.value.timeOfDeparture = past.toISOString();
      }
      setTimeout(() => {
        desserte.value.stops.shift();
      }, 2000);
      return;
    }

    if (state.value === "NOT_AT_STOP") {
      forcedState.value = "AT_STOP";
    } else if (state.value === "AT_STOP") {
      const currentIsTerminus = currentStop.value?.isTerminus;

      if (currentStop.value) {
        const past = useClock().now.value;
        past.setSeconds(past.getSeconds() - 5);

        currentStop.value.timeOfArrival = useClock().now.value.toISOString();
        currentStop.value.timeOfDeparture = past.toISOString();
      }

      if (currentIsTerminus) {
        desserte.value.stops.shift();
        forcedState.value = "NO_TRIP_DATA_AVAILABLE";
        computeState();
      } else {
        forcedState.value = "NOT_AT_STOP";
        computeState();

        setTimeout(() => {
          desserte.value.stops.shift();
        }, 2000);
      }

      return;
    }
  };

  watch(state, (newState) => {
    if (
      newState === "FIRST_STOP" &&
      !departingAudioPlayed &&
      line.value &&
      desserte.value.stops.length > 0
    ) {
      const finalStop = desserte.value.stops[desserte.value.stops.length - 1];
      AudioManager.playDirection(
        line.value.id,
        finalStop.stop.parentId ?? finalStop.stop.id,
      );
      departingAudioPlayed = true;
    }
  });

  return {
    state,
    progressionMode,
    isAutoPassStops,
    forcedState,
    currentSecondsToArrival,
    computeState,
    skipNextStop,
  };
}