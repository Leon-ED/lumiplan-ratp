<template>
  <div
    class="screen"
    :class="{
      'no-data-available': ['NO_DATA', 'NO_TRIP_DATA_AVAILABLE'].includes(
        state
      ),
    }"
  >
    <ScreenHeader
      :direction="state === 'FIRST_STOP' ? '' : desserte.direction"
      :line="line!"
    />
    <main
      :class="{
        'split-view': shouldShowSidePanel,
      }"
    >
      <Transition name="fade" mode="out-in">
        <Direction
          v-if="state === 'FIRST_STOP'"
          :direction="desserte.direction"
          :departure-date="currentStop!.timeOfArrival"
        />
        <NotInService v-else-if="state === 'NOT_IN_SERVICE'" />
        <CurrentStop
          v-else-if="state === 'AT_STOP'"
          :stop="currentStop!.stop"
        />
        <StopList
          v-else-if="state === 'NOT_AT_STOP'"
          :stops="desserte.stops"
          :primary-color="line?.color || '#000000'"
        />
        <DataUnavailable v-else-if="state === 'NO_DATA'" />
        <TripUnavailable
          v-else-if="state === 'NO_TRIP_DATA_AVAILABLE'"
          :line="line!"
        />
      </Transition>

      <div v-if="shouldShowSidePanel" class="side-panel">
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
          :withArrow="displayedInfosTraffic.length === 1 && specialSkippedStopMessage?.id === 'next-stop-skipped-alert'"
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
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute } from "vue-router";

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
import { Desserte, InfoTraffic, Line, Mode, Stop } from "../types";
import { useIntervalFn } from "@vueuse/core";

const SLATE_DURATIONS = {
  CONNECTIONS: 5000,
  TOURIST: 5000,
  TRAVEL_TIME: 10000,
  INFOS_TRAFFIC: 10_000,
};

const fakeDesserte: Desserte = {
  direction: "",
  id: "",
  stops: [],
};
const desserte = ref<Desserte>(fakeDesserte);
const line = ref<Line | null>(null);
const route = useRoute();
const INFOS_TRAFFICMessages = ref<InfoTraffic[]>([]);

INFOS_TRAFFICMessages.value = [];
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
  finalSorted.unshift(line.value!);
  return finalSorted;
});
const INFOS_TRAFFIC_REFRESH_INTERVAL = 60 * 1000 * 3; 
const stopDisplayTimerDone = ref(false);
let stopTimer: NodeJS.Timeout | null = null;

const specialSkippedStopMessage = computed<InfoTraffic | null>(() => {
  const stops = desserte.value.stops;
  if (!stops || stops.length === 0) return null;

  let skippedCount = 0;
  let nextServedStopName = "";

  // On compte combien d'arrêts consécutifs sont sautés en partant du prochain arrêt immédiat (index 0)
  for (const s of stops) {
    if (s.isStopSkipped) {
      skippedCount++;
    } else {
      nextServedStopName = s.stop.name;
      break; // On a trouvé le prochain arrêt desservi, on arrête de compter
    }
  }

  // Si aucun arrêt n'est sauté au début de la liste, pas de message
  if (skippedCount === 0) return null;
  if(skippedCount === 1){
    nextServedStopName = "non desservi";
  }

  // Création du message
  const messageContent = skippedCount === 1 
    ? "Point d’arrêt" 
    : `Prochain arrêt desservi : `;
  const messageId = skippedCount === 1 
    ? 'next-stop-skipped-alert' 
    : 'multiple-stops-skipped-alert';
  // On retourne un objet simulant une InfoTraffic
  return {
    cause: nextServedStopName,
    effect: 'INFO',
    impactedLines: [],
    message:messageContent,
    id: messageId,
    title: messageContent,
    content: messageContent,
    status: 'ACTIVE',
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


const fetchLineData = async () => {
  try {
    const lineData = await Api.getLine(route.query.lineRef as string);
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
        l.id != route.query.lineRef
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
        (l: Line) => l.id !== line.value?.id
      )
    : [];
});

const fetchJourneyData = async () => {
  try {
    const tripRef = route.query.tripRef as string;
    if (tripRef) {
      const journeyData = await Api.getJourney(tripRef);
      if (!journeyData) {
        return;
      }
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
  desserte.value.stops.length > 0 ? desserte.value.stops[0] : null
);

const state = ref<ScreenState>("NO_DATA");

const computeState = () => {
  if (!line.value) {
    state.value = "NO_DATA";
    return;
  }
  if (desserte.value.stops.length === 0) {
    state.value = "NO_TRIP_DATA_AVAILABLE";
  } else if (
    currentStop.value &&
    currentStop.value.isFirstStop &&
    getSecondesFromDate(currentStop.value.timeOfArrival) >= -5
  ) {
    state.value = "FIRST_STOP";
  } else if (
    currentStop.value &&
    !currentStop.value.isStopSkipped &&
    getSecondesFromDate(currentStop.value.timeOfArrival) <= 10 &&
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

watch(state, (newState) => {
  if (newState === "AT_STOP") {
    stopDisplayTimerDone.value = false;
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      stopDisplayTimerDone.value = true;
    }, 5000);
  } else if (newState === "NOT_AT_STOP") {
    setTimeout(() => {
      stopDisplayTimerDone.value = true;
      if (stopTimer) clearTimeout(stopTimer);
    }, 5000);
  }
});

type SlateType = "CONNECTIONS" | "TRAVEL_TIME" | "INFOS_TRAFFIC";
interface Slate {
  type: SlateType;
  duration: number;
}

const availableSlates = computed<Slate[]>(() => {
  const slates: Slate[] = [];

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

  // Standard
  if (currentConnections.value.length > 0) {
    slates.push({ type: "CONNECTIONS", duration: SLATE_DURATIONS.CONNECTIONS });
  }

  if (importantStops.value.length > 0) {
    slates.push({ type: "TRAVEL_TIME", duration: SLATE_DURATIONS.TRAVEL_TIME });
  }

  if (hasTrafficMessages) {
    slates.push({
      type: "INFOS_TRAFFIC",
      duration: SLATE_DURATIONS.INFOS_TRAFFIC,
    });
  }

  return slates;
});

const currentSlateIndex = ref(0);
let slateTimer: NodeJS.Timeout | null = null;

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
  if (slateTimer) clearTimeout(slateTimer);
  if (availableSlates.value.length <= 1) return;
  const duration = currentSlate.value?.duration || 10000;
  slateTimer = setTimeout(rotateSlates, duration);
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
  { deep: true }
);

let updateIntervalId: NodeJS.Timeout;

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
  if (!line.value || !desserte.value || desserte.value.stops.length === 0){
    return;
  }
  try {
    const allMessages = await Api.getInfosTraffic(
      INFOS_TRAFFIC_LINES.value.map((l) => l.id)
    );
    INFOS_TRAFFICMessages.value = allMessages
      .filter((msg) => msg.status === "ACTIVE")
      .slice(0, 5);
  } catch (error) {
    console.error("Error fetching INFOS_TRAFFIC messages:", error);
  }
};

onMounted(async () => {
  await fetchLineData();
  await fetchJourneyData();
  fetchInfosTrafficMessages();
  updateIntervalId = setInterval(updateState, 1_000);
  scheduleNextRotation();
  useIntervalFn(fetchInfosTrafficMessages, INFOS_TRAFFIC_REFRESH_INTERVAL, {
    immediate: true,
  });
});

onUnmounted(() => {
  if (updateIntervalId) clearInterval(updateIntervalId);
  if (slateTimer) clearTimeout(slateTimer);
  if (stopTimer) clearTimeout(stopTimer);
});
</script>

<style lang="css" scoped>
.screen {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: 22% 78%;
  font-size: 3cqmin;
  container-type: inline-size;
}

main {
  display: grid;
  grid-template-columns: 100% 35%;
  transition: grid-template-columns 2s cubic-bezier(0.25, 0.8, 0.25, 1);
  grid-template-rows: 100%;
  overflow: hidden;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
</style>