import { ref, computed, Ref, watch } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import { ScreenState } from "./useScreenState";
import { InfoTraffic, StopWithTime, Line } from "../types";

const SLATE_DURATIONS = {
  CONNECTIONS: 5000,
  TRAVEL_TIME: 10000,
  INFOS_TRAFFIC: 10000,
};

type SlateType = "CONNECTIONS" | "TRAVEL_TIME" | "INFOS_TRAFFIC";
interface Slate {
  type: SlateType;
  duration: number;
}

export function useSlates(
  state: Ref<ScreenState>,
  currentSecondsToArrival: Ref<number>,
  importantStops: Ref<StopWithTime[]>,
  currentConnections: Ref<Line[]>,
  displayedInfosTraffic: Ref<InfoTraffic[]>,
  specialSkippedStopMessage: Ref<InfoTraffic | null>,
  isApproachingStop: Ref<boolean>,
) {
  const currentSlateIndex = ref(0);
  const currentSlateDuration = ref(10000);

  const stopDisplayTimerDone = ref(false);
  const isPostStopLocked = ref(false);

  // Timers
  const { start: startPostStopLock, stop: stopPostStopLock } = useTimeoutFn(
    () => {
      isPostStopLocked.value = false;
    },
    5000,
    { immediate: false },
  );
  const { start: startStopDisplay, stop: stopStopDisplay } = useTimeoutFn(
    () => {
      stopDisplayTimerDone.value = true;
    },
    5000,
    { immediate: false },
  );
  const { start: startSlateTimer, stop: stopSlateTimer } = useTimeoutFn(
    () => {
      rotateSlates();
    },
    currentSlateDuration,
    { immediate: false },
  );

  const shouldShowSidePanel = computed(() => {
    if (isPostStopLocked.value || isApproachingStop.value) return false;
    if (state.value === "NOT_AT_STOP" && availableSlates.value.length > 0)
      return true;
    if (
      state.value === "AT_STOP" &&
      stopDisplayTimerDone.value &&
      availableSlates.value.length > 0
    )
      return true;
    return false;
  });

  const availableSlates = computed<Slate[]>(() => {
    if (isPostStopLocked.value) return [];

    const hasTrafficMessages = displayedInfosTraffic.value.length > 0;
    if (specialSkippedStopMessage.value)
      return [{ type: "INFOS_TRAFFIC", duration: 999999 }];

    if (state.value === "AT_STOP") {
      return hasTrafficMessages
        ? [{ type: "INFOS_TRAFFIC", duration: 999999 }]
        : [];
    }

    if (isApproachingStop.value) {
      return currentConnections.value.length > 0
        ? [{ type: "CONNECTIONS", duration: 5000 }]
        : [];
    }

    const slates: Slate[] = [];
    const timeBudget = currentSecondsToArrival.value - 15; // 15 = APPROACHING_THRESHOLD_START
    const SAFETY_BUFFER = 0.5;

    const canFit = (duration: number) =>
      duration + SAFETY_BUFFER < timeBudget * 1000;

    if (currentConnections.value.length > 0)
      slates.push({
        type: "CONNECTIONS",
        duration: SLATE_DURATIONS.CONNECTIONS,
      });
    if (importantStops.value.length > 0 && canFit(SLATE_DURATIONS.TRAVEL_TIME))
      slates.push({
        type: "TRAVEL_TIME",
        duration: SLATE_DURATIONS.TRAVEL_TIME,
      });
    if (hasTrafficMessages && canFit(SLATE_DURATIONS.INFOS_TRAFFIC))
      slates.push({
        type: "INFOS_TRAFFIC",
        duration: SLATE_DURATIONS.INFOS_TRAFFIC,
      });

    return slates;
  });

  const currentSlate = computed(() => {
    if (availableSlates.value.length === 0) return null;
    return availableSlates.value[
      currentSlateIndex.value % availableSlates.value.length
    ];
  });

  const rotateSlates = () => {
    if (availableSlates.value.length === 0) return;
    currentSlateIndex.value =
      (currentSlateIndex.value + 1) % availableSlates.value.length;
    scheduleNextRotation();
  };

  const scheduleNextRotation = () => {
    stopSlateTimer();
    if (availableSlates.value.length <= 1) return;
    currentSlateDuration.value = currentSlate.value?.duration || 10000;
    startSlateTimer();
  };

  watch(state, (newState, oldState) => {
    if (newState === "AT_STOP") {
      stopDisplayTimerDone.value = false;
      stopStopDisplay();
      startStopDisplay();
    } else if (newState === "NOT_AT_STOP") {
      stopStopDisplay();
      startStopDisplay();
      if (oldState === "AT_STOP" || oldState === "FIRST_STOP") {
        isPostStopLocked.value = true;
        stopPostStopLock();
        startPostStopLock();
      }
    }
  });

  watch(
    availableSlates,
    (newVal, oldVal) => {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        currentSlateIndex.value = 0;
        scheduleNextRotation();
      }
    },
    { deep: true },
  );

  return { shouldShowSidePanel, currentSlate, scheduleNextRotation };
}
