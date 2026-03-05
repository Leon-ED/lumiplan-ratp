<template>
  <LoadSaveModal ref="loadSaveModalRef" @load="handleSaveLoaded" />

  <button
    class="config-btn"
    @click="openLoadModal"
    title="Charger une sauvegarde"
  >
    ⚙️
  </button>

  <div
    class="screen"
    :class="{
      'no-data-available': ['NO_DATA', 'NO_TRIP_DATA_AVAILABLE'].includes(
        state,
      ),
      fullscreen: fullScreen,
    }"
  >
    <ScreenHeader
      :direction="state === 'FIRST_STOP' ? '' : desserte.direction"
      :line="line!"
      :is-at-stop="state === 'AT_STOP'"
      @click="emitEvent('toggle-full-screen')"
    />
    <main
      :class="{
        'split-view': shouldShowSidePanel,
      }"
    >
      <div class="main-panel-wrapper">
        <StopList
          v-show="['FIRST_STOP', 'AT_STOP', 'NOT_AT_STOP'].includes(state)"
          class="background-panel"
          :stops="desserte.stops"
          :primary-color="line?.color || '#000000'"
        />

        <Transition name="slide-over">
          <Direction
            v-if="state === 'FIRST_STOP'"
            class="foreground-panel"
            :direction="desserte.direction"
            :departure-date="currentStop!.timeOfArrival"
          />
          <NotInService
            v-else-if="state === 'NOT_IN_SERVICE'"
            class="foreground-panel"
          />
          <CurrentStop
            v-else-if="state === 'AT_STOP'"
            class="foreground-panel current-stop-panel"
            :stop-with-time="currentStop!"
          />
          <DataUnavailable
            v-else-if="state === 'NO_DATA'"
            class="foreground-panel"
          />
          <TripUnavailable
            v-else-if="state === 'NO_TRIP_DATA_AVAILABLE'"
            class="foreground-panel"
            :line="line!"
          />
        </Transition>
      </div>

      <div class="side-panel">
        <Transition name="slide" mode="out-in">
          <ArrivingToIn
            v-if="currentSlate?.type === 'TRAVEL_TIME'"
            :stops-list="importantStops"
            key="travel-time"
          />

          <LinesConnection
            v-else-if="currentSlate?.type === 'CONNECTIONS'"
            :connections="currentConnections"
            key="connections"
          />

          <Messages
            :withArrow="
              displayedInfosTraffic.length === 1 &&
              specialSkippedStopMessage?.id === 'next-stop-skipped-alert'
            "
            v-else-if="currentSlate?.type === 'INFOS_TRAFFIC'"
            :infosTraffic="displayedInfosTraffic"
            key="messages"
          />
        </Transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useIntervalFn, useTimeoutFn } from "@vueuse/core";
import ScreenHeader from "./ScreenHeader.vue";
import StopList from "./MainPanel/StopList.vue";
import DataUnavailable from "./MainPanel/DataUnavailable.vue";
import Direction from "./MainPanel/Direction.vue";
import CurrentStop from "./MainPanel/CurrentStop.vue";
import NotInService from "./MainPanel/NotInService.vue";
import TripUnavailable from "./MainPanel/TripUnavailable.vue";
import ArrivingToIn from "./SidePanel/ArrivingToIn.vue";
import LinesConnection from "./SidePanel/LinesConnection.vue";
import Messages from "./SidePanel/Messages.vue";
import { getSecondesFromDate } from "../utils";
import { Api } from "../api";
import { Desserte, InfoTraffic, Line, Mode, Stop, SaveFile } from "../types";
import LoadSaveModal from "./Editor/LoadSaveModal.vue";

const SLATE_DURATIONS = {
  CONNECTIONS: 5000,
  TOURIST: 5000,
  TRAVEL_TIME: 10000,
  INFOS_TRAFFIC: 10_000,
};
defineProps<{
  fullScreen?: boolean;
}>();
const emitEvent = defineEmits<{
  (e: "toggle-full-screen"): void;
}>();

const fakeDesserte: Desserte = { direction: "", id: "", stops: [] };
const desserte = ref<Desserte>(fakeDesserte);
const line = ref<Line | null>(null);
const route = useRoute();
const INFOS_TRAFFICMessages = ref<InfoTraffic[]>([]);

const isUsingLocalSave = ref(false);

const loadSaveModalRef = ref<InstanceType<typeof LoadSaveModal> | null>(null);

const openLoadModal = () => {
  loadSaveModalRef.value?.open();
};

const handleSaveLoaded = (saveData: SaveFile) => {
  isUsingLocalSave.value = true;
  line.value = saveData.journey.line;
  desserte.value = saveData.journey.desserte;
  computeState();
  currentSlateIndex.value = 0;
  scheduleNextRotation();
  fetchInfosTrafficMessages();
};

const stopDisplayTimerDone = ref(false);
const currentSecondsToArrival = ref<number>(9999);
const isPostStopLocked = ref(false);

const INFOS_TRAFFIC_REFRESH_INTERVAL = 60 * 1000 * 3;


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

const currentSlateDuration = ref(10000);
const { start: startSlateTimer, stop: stopSlateTimer } = useTimeoutFn(
  () => {
    rotateSlates();
  },
  currentSlateDuration,
  { immediate: false },
);

const APPROACHING_THRESHOLD_START = 15;
const APPROACHING_THRESHOLD_END = 10;

const isApproachingStop = computed(() => {
  return (
    state.value === "NOT_AT_STOP" &&
    currentSecondsToArrival.value <= APPROACHING_THRESHOLD_START &&
    currentSecondsToArrival.value > APPROACHING_THRESHOLD_END &&
    desserte.value.stops[0]?.isStopSkipped === false
  );
});

const INFOS_TRAFFIC_LINES = computed(() => {
  const whitelistedModes = [Mode.RER, Mode.TRANSILIEN, Mode.METRO];
  const allLines: Line[] = [];
  const linesIdsSet = new Set<string>();
  desserte.value.stops.forEach((ds) => {
    ds.stop.connectedLines.forEach((l) => {
      if (
        l.id !== line.value?.id &&
        !linesIdsSet.has(l.id) &&
        whitelistedModes.includes(l.mode)
      ) {
        allLines.push(l);
        linesIdsSet.add(l.id);
      }
    });
  });
  const finalSorted = allLines.sort((a, b) => {
    return whitelistedModes.indexOf(a.mode) - whitelistedModes.indexOf(b.mode);
  });
  if (line.value) finalSorted.unshift(line.value);
  return finalSorted;
});

const specialSkippedStopMessage = computed<InfoTraffic | null>(() => {
  const stops = desserte.value.stops;
  if (!stops || stops.length === 0) return null;
  let skippedCount = 0;
  let nextServedStopName = "";
  for (const s of stops) {
    if (s.isStopSkipped) skippedCount++;
    else {
      nextServedStopName = s.stop.name;
      break;
    }
  }
  if (skippedCount === 0) return null;
  if (skippedCount === 1) nextServedStopName = "non desservi";

  const messageContent =
    skippedCount === 1 ? "Point d’arrêt" : `Prochain arrêt desservi : `;
  const messageId =
    skippedCount === 1
      ? "next-stop-skipped-alert"
      : "multiple-stops-skipped-alert";

  return {
    cause: nextServedStopName,
    effect: "INFO",
    impactedLines: [],
    message: messageContent,
    id: messageId,
    title: messageContent,
    content: messageContent,
    status: "ACTIVE",
    updatedAt: new Date().toISOString(),
  } as InfoTraffic;
});

const displayedInfosTraffic = computed(() => {
  const messages = [...INFOS_TRAFFICMessages.value];
  if (specialSkippedStopMessage.value) {
    return [specialSkippedStopMessage.value];
  }
  return messages;
});

watch(
  () => [route.query.trip, route.query.line],
  async ([newTrip, newLine], [oldTrip, oldLine]) => {
    isUsingLocalSave.value = false;

    if (newLine !== oldLine) {
      line.value = null;
      await fetchLineData();
    }

    if (newTrip !== oldTrip) {
      desserte.value = fakeDesserte;
      await fetchJourneyData();
    }

    computeState();
    currentSlateIndex.value = 0;
    scheduleNextRotation();
  },
);

const fetchLineData = async () => {
  if (isUsingLocalSave.value) return; // Ignore l'API si sauvegarde chargée
  try {
    const lineData = await Api.getLine(route.query.line as string);
    line.value = lineData;
  } catch (error) {
    console.error("Error fetching line data:", error);
  }
};

const importantStops = computed(() => {
  const stops = desserte.value.stops;
  if (!stops || stops.length === 0) return [];
  const validStops = stops.filter((s) => !s.isStopSkipped);
  if (validStops.length === 0) return [];

  const terminus = validStops[validStops.length - 1];
  const getHeavyConnectionCount = (stop: Stop) => {
    if (!stop) return 0;
    return stop.connectedLines.filter(
      (l: Line) =>
        l.mode !== Mode.BUS &&
        l.mode !== Mode.NOCTILIEN &&
        l.id != route.query.line,
    ).length;
  };

  const candidates = validStops.filter((s) => s.stop.id !== terminus.stop.id);
  const topConnectedStops = [...candidates].sort((a, b) => {
    return getHeavyConnectionCount(b.stop) - getHeavyConnectionCount(a.stop);
  });

  const bestTwo = topConnectedStops
    .filter((stop) => getHeavyConnectionCount(stop.stop) > 0)
    .slice(0, 2);
  const idsToKeep = new Set([
    terminus.stop.id,
    ...bestTwo.map((s) => s.stop.id),
  ]);

  return validStops.filter((s) => idsToKeep.has(s.stop.id));
});

const currentConnections = computed(() => {
  return currentStop.value
    ? currentStop.value.stop.connectedLines.filter(
        (l: Line) => l.id !== line.value?.id,
      )
    : [];
});

const fetchJourneyData = async () => {
  if (isUsingLocalSave.value) return; // Ignore l'API si sauvegarde chargée
  try {
    const tripRef = route.query.trip as string;
    if (tripRef) {
      const journeyData = await Api.getJourney(tripRef);
      if (!journeyData) return;
      desserte.value = journeyData;
    }
  } catch (error) {
    console.error("Error fetching journey data:", error);
  }
};

type ScreenState =
  | "NO_DATA"
  | "NO_TRIP_DATA_AVAILABLE"
  | "FIRST_STOP"
  | "AT_STOP"
  | "NOT_AT_STOP"
  | "LAST_STOP"
  | "NOT_IN_SERVICE";

const currentStop = computed(() =>
  desserte.value.stops.length > 0 ? desserte.value.stops[0] : null,
);

const state = ref<ScreenState>("NO_DATA");

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
    getSecondesFromDate(currentStop.value.timeOfArrival, true) >= -2
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
};

const shouldShowSidePanel = computed(() => {
  if (isPostStopLocked.value) {
    return false;
  }
  if (isApproachingStop.value) return false;

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

type SlateType = "CONNECTIONS" | "TRAVEL_TIME" | "INFOS_TRAFFIC";
interface Slate {
  type: SlateType;
  duration: number;
}

const availableSlates = computed<Slate[]>(() => {
  if (isPostStopLocked.value) {
    return [];
  }

  const hasTrafficMessages = displayedInfosTraffic.value.length > 0;

  if (specialSkippedStopMessage.value) {
    return [{ type: "INFOS_TRAFFIC", duration: 999999 }];
  }

  if (state.value === "AT_STOP") {
    if (hasTrafficMessages) {
      return [{ type: "INFOS_TRAFFIC", duration: 999999 }];
    }
    return [];
  }

  if (isApproachingStop.value) {
    if (currentConnections.value.length > 0) {
      return [{ type: "CONNECTIONS", duration: 5000 }];
    }
    return [];
  }

  const slates: Slate[] = [];
  const timeBudgetBeforeApproach =
    currentSecondsToArrival.value - APPROACHING_THRESHOLD_START;
  const SAFETY_ANIMATION_BUFFER = 0.5;

  const canFitInBudget = (duration: number) => {
    return (
      duration + SAFETY_ANIMATION_BUFFER < timeBudgetBeforeApproach * 1_000
    );
  };

  if (currentConnections.value.length > 0) {
    slates.push({ type: "CONNECTIONS", duration: SLATE_DURATIONS.CONNECTIONS });
  }

  if (
    importantStops.value.length > 0 &&
    canFitInBudget(SLATE_DURATIONS.TRAVEL_TIME)
  ) {
    slates.push({ type: "TRAVEL_TIME", duration: SLATE_DURATIONS.TRAVEL_TIME });
  }

  if (hasTrafficMessages && canFitInBudget(SLATE_DURATIONS.INFOS_TRAFFIC)) {
    slates.push({
      type: "INFOS_TRAFFIC",
      duration: SLATE_DURATIONS.INFOS_TRAFFIC,
    });
  }
  return slates;
});

const currentSlateIndex = ref(0);

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
  const nextDuration = currentSlate.value?.duration || 10000;
  currentSlateDuration.value = nextDuration;
  startSlateTimer();
};

watch(
  availableSlates,
  (newVal, oldVal) => {
    const isDifferent = JSON.stringify(newVal) !== JSON.stringify(oldVal);
    if (isDifferent) {
      currentSlateIndex.value = 0;
      scheduleNextRotation();
    }
  },
  { deep: true },
);

const updateState = () => {
  computeState();
  if (
    currentStop.value &&
    ((currentStop.value.isTerminus &&
      getSecondesFromDate(currentStop.value.timeOfArrival, true) < -20) ||
      (!currentStop.value.isTerminus &&
        getSecondesFromDate(currentStop.value.timeOfArrival, true) < -3))
  ) {
    desserte.value.stops.shift();
  }
};

const fetchInfosTrafficMessages = async () => {
  if (!line.value || !desserte.value || desserte.value.stops.length === 0) {
    return;
  }
  try {
    const allMessages = await Api.getInfosTraffic(
      INFOS_TRAFFIC_LINES.value.map((l) => l.id),
    );
    INFOS_TRAFFICMessages.value = allMessages
      .filter((msg) => msg.status === "ACTIVE")
      .slice(0, 5);
  } catch (error) {
    console.error("Error fetching INFOS_TRAFFIC messages:", error);
  }
};

onMounted(async () => {
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      loadSaveModalRef.value?.open();
    }
  });
  if (!isUsingLocalSave.value && route.query.line && route.query.trip) {
    await fetchLineData();
    await fetchJourneyData();
  }

  fetchInfosTrafficMessages();
  useIntervalFn(updateState, 1_000);
  scheduleNextRotation();
  useIntervalFn(fetchInfosTrafficMessages, INFOS_TRAFFIC_REFRESH_INTERVAL, {
    immediate: true,
  });
});
</script>
<style lang="css" scoped>
.config-btn {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}
.config-btn:hover,
.config-btn:focus {
  opacity: 1;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.screen {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: 22% 78%;
  font-size: 3cqmin;
  container-type: inline-size;
}
.screen.fullscreen {
  grid-template-rows: min(22%, 100px) 1fr;
}
@media (orientation: portrait) {
  .screen.screen.fullscreen {
    grid-template-rows: min(22%, 50px) 1fr;
  }
}
main {
  display: grid;
  grid-template-columns: 100% 35%;
  transition: grid-template-columns 2s cubic-bezier(0.25, 0.8, 0.25, 1);
  grid-template-rows: 100%;
  overflow: hidden;
  background-color: var(--ratp-beige);
}
.main-panel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.background-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.foreground-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-color: var(--ratp-beige);
}
main.split-view {
  grid-template-columns: 65% 35%;
}

.side-panel {
  height: 100%;
  width: 100%;
  position: relative;
  background-color: #f4eeea;
  border-left: 2px solid var(--ratp-beige-dark);
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 1s cubic-bezier(0.25, 1, 0.5, 1);
}
.split-view :deep(.triangle-icon) {
  display: block;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-enter-active {
  transition-delay: 0.2s;
  transition: all 0.4s ease-in;
}
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-leave-to {
  opacity: 0;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20%);
}
.slide-over-enter-active,
.slide-over-leave-active {
  transition: transform 0.8s ease-in-out;
}
.current-stop-panel.slide-over-enter-active,
.current-stop-panel.slide-over-leave-active {
  transition: opacity 0.7s linear;
}
.current-stop-panel.slide-over-leave-to {
  transform: translateY(0);
  opacity: 0;
}
.current-stop-panel.slide-over-enter-from {
  opacity: 0;
}

.slide-over-enter-from {
  transform: translateY(100%);
}

.slide-over-leave-to {
  transform: translateY(-100%);
}
</style>
