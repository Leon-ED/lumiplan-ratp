<template>
  <Teleport to="body">
    <LoadSaveModal ref="loadSaveModalRef" @load="handleSaveLoaded" />
    <SettingsModal
      ref="settingsModalRef"
      :full-screen="fullScreen"
      v-model="isAutoPassStops"
      @toggle-full-screen="emitEvent('toggle-full-screen')"
    />
  </Teleport>

  <button
    class="config-btn"
    @click="openLoadModal"
    title="Charger une sauvegarde"
  >
    ⚙️
  </button>
  <button
    class="settings-btn"
    @click="openSettingsModal"
    title="Paramètres de l'écran"
  >
    🔧
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
    <div
      class="manual-skip-zone"
      @click="skipNextStop"
      title="Passer à l'étape suivante"
    ></div>

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
            v-else-if="
              state === 'AT_STOP' &&
              !currentStop?.isStopSkipped &&
              !currentStop?.isFirstStop
            "
            class="foreground-panel current-stop-panel"
            :stop-with-time="currentStop!"
            :line-id="line?.id!"
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
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { useIntervalFn } from "@vueuse/core";

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
import LoadSaveModal from "./Editor/LoadSaveModal.vue";

import { useJourneyData } from "../composables/useJourneyData";
import { useScreenState } from "../composables/useScreenState";
import { useSlates } from "../composables/useSlates";

import { SaveFile } from "../types";
import { getSecondesFromDate } from "../utils";
import SettingsModal from "./Other/SettingsModal.vue";

defineProps<{
  fullScreen: boolean;
}>();
const emitEvent = defineEmits<{
  (e: "toggle-full-screen"): void;
}>();

const route = useRoute();

const {
  desserte,
  line,
  currentStop,
  importantStops,
  currentConnections,
  displayedInfosTraffic,
  specialSkippedStopMessage,
  isUsingLocalSave,
  loadFromSave,
  fetchLineData,
  fetchJourneyData,
  fetchInfosTrafficMessages,
} = useJourneyData(route.query.line as string, route.query.trip as string);

const {
  state,
  isAutoPassStops,
  forcedState,
  currentSecondsToArrival,
  computeState,
  skipNextStop,
} = useScreenState(desserte, line, currentStop);

const isApproachingStop = computed(() => {
  return (
    state.value === "NOT_AT_STOP" &&
    currentSecondsToArrival.value <= 15 &&
    currentSecondsToArrival.value > 10 &&
    desserte.value.stops[0]?.isStopSkipped === false
  );
});

const { shouldShowSidePanel, currentSlate, scheduleNextRotation } = useSlates(
  state,
  currentSecondsToArrival,
  importantStops,
  currentConnections,
  displayedInfosTraffic,
  specialSkippedStopMessage,
  isApproachingStop,
);

const loadSaveModalRef = ref<InstanceType<typeof LoadSaveModal> | null>(null);
const settingsModalRef = ref<InstanceType<typeof SettingsModal> | null>(null);

const openLoadModal = () => loadSaveModalRef.value?.open();
const openSettingsModal = () => settingsModalRef.value?.open();

const handleSaveLoaded = (saveData: SaveFile) => {
  loadFromSave(saveData);
  isAutoPassStops.value = false;
  forcedState.value = null;
  computeState();
  scheduleNextRotation();
  fetchInfosTrafficMessages();
};

const updateState = () => {
  computeState();

  if (
    isAutoPassStops.value &&
    currentStop.value &&
    ((currentStop.value.isTerminus &&
      getSecondesFromDate(currentStop.value.timeOfArrival, true) < -20) ||
      (!currentStop.value.isTerminus &&
        getSecondesFromDate(currentStop.value.timeOfArrival, true) < -3))
  ) {
    desserte.value.stops.shift();
  }
};

watch(
  () => [route.query.trip, route.query.line],
  async () => {
    isUsingLocalSave.value = false;
    isAutoPassStops.value = true;

    await fetchLineData();
    await fetchJourneyData();

    computeState();
    scheduleNextRotation();
  },
);

watch(isAutoPassStops, (newVal) => {
  if (newVal) {
    forcedState.value = null;
    computeState();
  }
});

const handleKeydown = (event: KeyboardEvent) => {
  if (event.code === "Space") openLoadModal();
  if (event.code === "ArrowRight") skipNextStop();
};

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);
  if (route.query.loadSave) {
   loadSaveModalRef.value?.loadAutosave();
  }
  if (!isUsingLocalSave.value && route.query.line && route.query.trip) {
    isAutoPassStops.value = true;
    await fetchLineData();
    await fetchJourneyData();
  }

  fetchInfosTrafficMessages();
  useIntervalFn(updateState, 1_000);
  scheduleNextRotation();
  useIntervalFn(fetchInfosTrafficMessages, 3 * 60 * 1000, {
    immediate: true,
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="css" scoped>
.manual-skip-zone {
  position: absolute;
  top: 0;
  right: 0;
  width: 10%;
  height: 100%;
  z-index: 9000;
  cursor: pointer;
}

.config-btn,
.settings-btn {
  position: fixed;
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
.config-btn {
  top: 10px;
}
.settings-btn {
  top: 60px;
}

.config-btn:hover,
.config-btn:focus,
.settings-btn:hover,
.settings-btn:focus {
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
  position: relative;
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
