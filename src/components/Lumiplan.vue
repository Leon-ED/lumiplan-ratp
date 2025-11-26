<template>
  <div class="screen" :class="{ 'no-data-available': state === 'NO_DATA' }">
    <ScreenHeader
      :direction="state === 'FIRST_STOP' ? '' : desserte.direction"
    />
    <main>
      <Transition name="fade" mode="out-in">
        <Direction
          v-if="state === 'FIRST_STOP'"
          :direction="desserte.direction"
          :departure-date="currentStop?.timeOfArrival"
        />
        <NotInService v-else-if="state === 'NOT_IN_SERVICE'" />
        <CurrentStop
          v-else-if="state === 'AT_STOP'"
          :stop="currentStop?.stop"
        />
        <StopList
          v-else-if="state === 'NOT_AT_STOP'"
          :stops="desserte.stops"
          primary-color="#6E6E00"
        />
        <DataUnavailable v-else-if="state === 'NO_DATA'" />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import ScreenHeader from "./ScreenHeader.vue";
// import ArrivingToIn from "./SidePanel/ArrivingToIn.vue";
import StopList from "./MainPanel/StopList.vue";
// import NextDepartures from "./SidePanel/NextDepartures.vue";
import DataUnavailable from "./MainPanel/DataUnavailable.vue";
import json from "../mock/treated303.json";
import Direction from "./MainPanel/Direction.vue";
import CurrentStop from "./MainPanel/CurrentStop.vue";
import { getMinutesFromDate, getSecondesFromDate } from "../utils";
import { Api } from "../api";
import NotInService from "./MainPanel/NotInService.vue";
const desserteIntact = ref<Desserte>(json as Desserte);
const line = ref<Line | null>(null);

const fetchLineData = async (lineId: string) => {
  try {
    const lineData = await Api.getLine(lineId);
    line.value = lineData;
  } catch (error) {
    console.error("Error fetching line data:", error);
  }
};

// create an enums of possible states of the screen
type ScreenState =
  | "NO_DATA"
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
    if (desserte.value.stops.length === 0) {
    state.value = "NO_DATA";
    return "NO_DATA";
  } else if (
    currentStop.value &&
    currentStop.value.stop &&
    currentStop.value.isFirstStop &&
    getSecondesFromDate(currentStop.value.timeOfArrival) >= -5
  ) {
    state.value = "FIRST_STOP";
  } else if (
    currentStop.value &&
    !currentStop.value.isStopSkipped&&
    getSecondesFromDate(currentStop.value.timeOfArrival) <= 5 &&
    getSecondesFromDate(currentStop.value.timeOfArrival, true) >= -5
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

const desserte = ref<Desserte>({
  ...desserteIntact.value,
  stops: desserteIntact.value.stops.map((stop, i) => ({
    ...stop,
    timeOfArrival: new Date(Date.now() + (i + 1) * 15 * 1000).toISOString()
  }))
});
watch(
  () => desserte.value,
  () => {
    computeState();
  },
  { deep: true }
);
watch(
  () => state.value,
  () => {},
  { deep: true }
);

addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    desserte.value.stops.shift();
  }
});

let updateIntervalId: NodeJS.Timeout;

const updateState = () => {
  computeState();
  if (
    currentStop.value &&
    currentStop.value.isTerminus &&
    getSecondesFromDate(currentStop.value.timeOfArrival, true) < -20
  ) {
    desserte.value.stops.shift();
    console.log(desserte.value);
  } else if (
    currentStop.value &&
    !currentStop.value.isTerminus &&
    getSecondesFromDate(currentStop.value.timeOfArrival, true) < -6
  ) {
    desserte.value.stops.shift();
  }
};

onMounted(() => {
  updateIntervalId = setInterval(updateState, 1_000);
});

onUnmounted(() => {
  if (updateIntervalId) {
    clearInterval(updateIntervalId);
  }
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
  /* grid-template-columns: 65% 35%; */
  grid-template-rows: 100%;
  overflow: hidden;
  background-color: var(--ratp-beige);
}
/* Animation de transition avec glissement */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}
</style>
