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
        'split-view': isSplit && ['AT_STOP', 'NOT_AT_STOP'].includes(state),
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
      <ArrivingToIn
        v-if="['AT_STOP', 'NOT_AT_STOP'].includes(state)"
        :stops-list="desserte.stops"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import ScreenHeader from "./ScreenHeader.vue";
import StopList from "./MainPanel/StopList.vue";
import DataUnavailable from "./MainPanel/DataUnavailable.vue";
import Direction from "./MainPanel/Direction.vue";
import CurrentStop from "./MainPanel/CurrentStop.vue";
import { getSecondesFromDate } from "../utils";
import { Api } from "../api";
import NotInService from "./MainPanel/NotInService.vue";
import { useRoute } from "vue-router";
import TripUnavailable from "./MainPanel/TripUnavailable.vue";
import { Desserte, Line } from "../types";
import { useIntervalFn } from "@vueuse/core";
import ArrivingToIn from "./SidePanel/ArrivingToIn.vue";
const fakeDesserte:Desserte = {
  direction: "",
  id: "",
  stops: [],
}
const desserte = ref<Desserte>(fakeDesserte);
const line = ref<Line | null>(null);
const route = useRoute();
const fetchLineData = async () => {
  try {
    const lineData = await Api.getLine(route.query.lineRef as string);
    line.value = lineData;
  } catch (error) {
    console.error("Error fetching line data:", error);
  }
};

const fetchJourneyData = async () => {
  try {
    const tripRef = route.query.tripRef as string;
    if (tripRef) {
      const journeyData = await Api.getJourney(tripRef);
      if (!journeyData) {
        console.warn("No journey data found for tripRef:", tripRef);
        return;
      }
      desserte.value = journeyData;
    }
  } catch (error) {
    console.error("Error fetching journey data:", error);
  }
};

// create an enums of possible states of the screen
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
    currentStop.value.stop &&
    currentStop.value.isFirstStop &&
    getSecondesFromDate(currentStop.value.timeOfArrival) >= -5
  ) {
    state.value = "FIRST_STOP";
  } else if (
    currentStop.value &&
    !currentStop.value.isStopSkipped &&
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
watch(
  () => desserte.value,
  () => {
    computeState();
  },
  { deep: true }
);
watch(
  () => state.value,
  () => {
    console.log(state);
  },
  { deep: true }
);

let updateIntervalId: NodeJS.Timeout;

const updateState = () => {
  computeState();
  if (
    currentStop.value &&
    // Si c'est un terminus on attend un peu plus longtemps avant de supprimer l'arrêt
    ((currentStop.value.isTerminus &&
      getSecondesFromDate(currentStop.value.timeOfArrival, true) < -20) ||
      // Sinon on supprime dès que le bus est parti depuis plus de 6 secondes
      (!currentStop.value.isTerminus &&
        getSecondesFromDate(currentStop.value.timeOfArrival, true) < -6))
  ) {
    desserte.value.stops.shift();
  }
};
const isSplit = ref(false);
onMounted(() => {
  fetchLineData();
  fetchJourneyData();
  updateIntervalId = setInterval(updateState, 1_000);
  useIntervalFn(() => {
    const oldValue = isSplit.value;
    isSplit.value = !oldValue;
  }, 15_000);
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
  grid-template-columns: 100% 35%;
  transition: grid-template-columns 2s cubic-bezier(0.25, 0.8, 0.25, 1);
  grid-template-rows: 100%;
  overflow: hidden;
  background-color: var(--ratp-beige);
}
main.split-view {
  grid-template-columns: 65% 35%;
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
