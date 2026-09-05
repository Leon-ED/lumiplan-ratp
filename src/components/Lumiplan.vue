<template>
  <Teleport to="body">
    <LoadSaveModal ref="loadSaveModalRef" @load="handleSaveLoaded" />
    <SettingsModal ref="settingsModalRef" />
  </Teleport>
  <div v-if="isGpsMode && isGpsDebugEnabled" class="debug-gps-panel">
    <h4>Distances GPS</h4>
    <div v-if="userLocation">
      <ul>
        <li v-for="(stop, index) in stopsDistances" :key="index">
          <span class="stop-name">{{ stop.name }}</span>
          <span class="stop-dist">{{ stop.distance }}</span>
        </li>
      </ul>
    </div>
    <div v-else class="waiting-gps">En attente du signal GPS...</div>
  </div>

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
    :data-state="state"
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
      :is-limited-service="desserte.isLimitedService"
      :vehicle-number="desserte.vehicleNumber"
      :line="line!"
      :is-at-stop="state === 'AT_STOP'"
      @click="toggleFullScreen"
    />

    <main
      :class="{
        'split-view':
          shouldShowSidePanel ||
          isDisplayingPassengerMessage ||
          ['FIRST_STOP', 'NO_TRIP_DATA_AVAILABLE', 'NO_DATA'].includes(state),
      }"
    >
      <div class="main-panel-wrapper">
        <StopList
          v-show="['FIRST_STOP', 'AT_STOP', 'NOT_AT_STOP'].includes(state)"
          class="background-panel"
          :stops="desserte.stops"
          :primary-color="line?.color || '#000000'"
          :text-color="line?.textColor || '#FFFFFF'"
        />

        <Transition name="slide-over">
          <Direction
            v-if="state === 'FIRST_STOP'"
            class="foreground-panel"
            :direction="desserte.direction"
            :departure-date="currentStop!.timeOfDeparture"
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
            :is-limited-service="desserte?.isLimitedService ?? false"
            class="foreground-panel"
            :line="line!"
          />
        </Transition>
      </div>

      <div class="side-panel">
        <Transition name="slide" mode="out-in">
          <PassengerMessage
            v-if="isDisplayingPassengerMessage && currentPassengerMessage"
            :message="currentPassengerMessage"
            :key="'passenger-msg-' + currentPassengerMessage.message"
          />
          <NoData
            v-else-if="['NO_DATA', 'NO_TRIP_DATA_AVAILABLE'].includes(state)"
            :key="state"
          />
          <DepartureTime
            v-else-if="state === 'FIRST_STOP'"
            :departure-date="currentStop?.timeOfDeparture!"
            key="departure-time"
          />
          <ArrivingToIn
            v-else-if="currentSlate?.type === 'TRAVEL_TIME'"
            :stops-list="importantStops"
            :is-in-manual-mode="!isAutoPassStops"
            key="travel-time"
          />

          <LinesConnection
            v-else-if="currentSlate?.type === 'CONNECTIONS'"
            :connections="currentConnections"
            key="connections"
          />

          <Landmark
            v-else-if="currentSlate?.type === 'LANDMARK'"
            :landmark="currentStop?.stop.landmarkName!"
            key="landmark"
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
  <div class="message-triggers" :class="{ 'toolbar-hidden': isToolbarHidden }">
    <button class="toolbar-toggle-large" @click="toggleToolbar">
      {{ isToolbarHidden ? "Afficher" : "Masquer" }}
    </button>
    <button
      v-for="n in 10"
      :key="n"
      @click="triggerMessage(n - 1)"
      :title="`Lancer l'annonce ${n}`"
    >
      {{ n === 10 ? 0 : n }}
    </button>
    <button
      class="toolbar-toggle-large"
      @click="
        AudioManager.toggleSounds(
          AudioManager.areSoundsEnabled() ? false : true,
        )
      "
    >
      {{
        AudioManager.areSoundsEnabled()
          ? "Désactiver les sons"
          : "Activer les sons"
      }}
    </button>
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
import Landmark from "./SidePanel/Landmark.vue";
import LoadSaveModal from "./Editor/LoadSaveModal.vue";
import SettingsModal from "./Other/SettingsModal.vue";

import { useJourneyData } from "../composables/useJourneyData";
import { useScreenState } from "../composables/useScreenState";
import { useSlates } from "../composables/useSlates";
import { usePassengerMessages } from "../composables/usePassengerMessages";
import { useSettings } from "../composables/useSettings";
import { useDevicePosition } from "../composables/useDevicePosition";
import { SaveFile } from "../types";
import { getSecondesFromDate } from "../utils";
import PassengerMessage from "./SidePanel/PassengerMessage.vue";
import { AudioManager } from "../audio.ts";
import DepartureTime from "./SidePanel/DepartureTime.vue";
import NoData from "./SidePanel/NoData.vue";

const route = useRoute();
const isToolbarHidden = ref(false);

const toggleToolbar = () => {
  isToolbarHidden.value = !isToolbarHidden.value;
};

const {
  isFullScreen: fullScreen,
  toggleFullScreen,
  progressionMode,
  isGpsMode,
  isGpsDebugEnabled,
} = useSettings();
const { position: userLocation } = useDevicePosition();

const getDistance = (
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
  return Math.round(R * c);
};

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

const stopsDistances = computed(() => {
  if (!userLocation.value || !desserte.value?.stops) return [];
  return desserte.value.stops.map((s) => {
    const lat = s.stop.lat;
    const lon = s.stop.lon;
    if (!lat || !lon) return { name: s.stop.name, distance: "N/A" };

    const dist = getDistance(
      userLocation.value!.lat,
      userLocation.value!.lon,
      lat,
      lon,
    );
    return { name: s.stop.name, distance: `${dist}m` };
  });
});

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
  currentStop,
  isAutoPassStops,
);
const {
  currentPassengerMessage,
  isDisplayingPassengerMessage,
  triggerMessage,
} = usePassengerMessages();
const loadSaveModalRef = ref<InstanceType<typeof LoadSaveModal> | null>(null);
const settingsModalRef = ref<InstanceType<typeof SettingsModal> | null>(null);

const openLoadModal = () => loadSaveModalRef.value?.open();
const openSettingsModal = () => settingsModalRef.value?.open();

const handleSaveLoaded = (saveData: SaveFile) => {
  loadFromSave(saveData);
  progressionMode.value = "MANUAL";
  forcedState.value = null;
  computeState();
  scheduleNextRotation();
};

const updateState = () => {
  computeState();

  if (
    isAutoPassStops.value &&
    currentStop.value &&
    ((!currentStop.value.isTerminus &&
      getSecondesFromDate(currentStop.value.timeOfDeparture, true) < -3) ||
      (currentStop.value.isTerminus &&
        getSecondesFromDate(currentStop.value.timeOfDeparture, true) < -45))
  ) {
    desserte.value.stops.shift();
  }
};

watch(
  () => [route.query.trip, route.query.line],
  async () => {
    isUsingLocalSave.value = false;
    progressionMode.value = "TIME";

    await fetchLineData();
    await fetchJourneyData();

    computeState();
    scheduleNextRotation();
  },
);

watch(progressionMode, (newVal) => {
  if (newVal === "TIME" || newVal === "GPS") {
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
    progressionMode.value = "TIME";
    await fetchLineData();
    await fetchJourneyData();
  }
  const safeFetchInfosTraffic = () => {
    if (!isUsingLocalSave.value) {
      fetchInfosTrafficMessages();
    }
  };

  useIntervalFn(updateState, 1_000);
  scheduleNextRotation();

  useIntervalFn(safeFetchInfosTraffic, 3 * 60 * 1000, {
    immediate: true,
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="css" scoped>
.debug-gps-panel {
  position: absolute;
  opacity: 0.3;
  top: 10px;
  left: 10px;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.75);
  color: #00ff00;
  padding: 12px;
  overflow-y: scroll;

  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  max-height: 20vh;
  width: 250px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
}
.debug-gps-panel h4 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 14px;
  border-bottom: 1px solid #555;
  padding-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.debug-gps-panel:hover {
  opacity: 1;
}
.debug-gps-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.debug-gps-panel li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
  padding-bottom: 2px;
}
.debug-gps-panel .stop-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
.debug-gps-panel .stop-dist {
  font-weight: bold;
}
.waiting-gps {
  color: #ffaa00;
  font-style: italic;
}

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
  grid-template-rows: 6.25cqw 1fr;
  font-size: 3cqmin;
  container-type: inline-size;
  position: relative;
  overflow: hidden;
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
.message-triggers {
  position: fixed;
  display: flex;
  flex-wrap: wrap;
  bottom: 5px;
  box-sizing: border-box;
  width: 100%;
  padding: 0 10%;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 5px;
  opacity: 0.15;
  transition: opacity 0.3s ease;
  z-index: 9999;
}

.message-triggers:hover {
  opacity: 0.8;
}

.message-triggers.toolbar-hidden {
  opacity: 0;
}

.message-triggers.toolbar-hidden .toolbar-toggle {
  opacity: 0.8;
}

.message-triggers.toolbar-hidden button {
  pointer-events: auto;
}

.message-triggers.toolbar-hidden:hover {
  opacity: 0.8;
}

.message-triggers button {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  width: 30px;
  height: 30px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
button.toolbar-toggle-large {
  width: fit-content !important;
}

.message-triggers button:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: white;
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
