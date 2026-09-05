<script setup lang="ts">
import { computed } from "vue";
import { Line, StopWithTime, Mode } from "../../types";
import LineLogo from "../Other/LineLogo.vue";
import { sortedLines } from "../../utils";

const props = defineProps<{
  stop: StopWithTime;
  isFirstStop: boolean;
  isLastStop: boolean;
  isAfterPartialTerminus: boolean;
  partialTerminusIndex: number;
  route: Line;
}>();

const emit = defineEmits<{
  (e: "edit-stop", stop: StopWithTime): void;
  (e: "delete-stop", stop: StopWithTime): void;
  (e: "move-up", stop: StopWithTime): void;
  (e: "move-down", stop: StopWithTime): void;
}>();

const processConnections = (lines: Line[]) => {
  const filteredLines = lines.filter((l) => l.id !== props.route.id);

  const groups = new Map<Mode, Line[]>();
  filteredLines.forEach((l) => {
    if (!groups.has(l.mode)) {
      groups.set(l.mode, []);
    }
    groups.get(l.mode)!.push(l);
  });

  const isBusMode = (m: Mode) =>
    m === Mode.BUS ||
    m === Mode.NOCTILIEN ||
    m === Mode.BUS_REMPLACEMENT ||
    m === Mode.BUS_AEROPORT;

  const groupedConnections = Array.from(groups.entries()).map(
    ([mode, modeLines]) => ({
      mode,
      lines: sortedLines(modeLines),
    }),
  );

  groupedConnections.sort((a, b) => {
    const aIsBus = isBusMode(a.mode);
    const bIsBus = isBusMode(b.mode);
    if (aIsBus && !bIsBus) return 1;
    if (!aIsBus && bIsBus) return -1;
    return String(a.mode).localeCompare(String(b.mode));
  });

  return groupedConnections;
};

const processedConnections = computed(() =>
  processConnections(props.stop.stop.connectedLines),
);
</script>

<template>
  <div
    class="thermometer-stop"
    :class="{
      'is-skipped': stop.isStopSkipped || isAfterPartialTerminus,
      'is-terminus': stop.isTerminus,
    }"
  >
    <div class="move-buttons">
      <button
        class="action-btn move-btn"
        @click.stop="emit('move-up', stop)"
        :disabled="isFirstStop"
        :class="{ disabled: isFirstStop }"
        title="Monter l'arrêt"
        aria-label="Monter l'arrêt"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
      <button
        class="action-btn move-btn"
        @click.stop="emit('move-down', stop)"
        title="Descendre l'arrêt"
        aria-label="Descendre l'arrêt"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>

    <div class="stop-time">
      {{
        stop.travelTime && !isFirstStop
          ? `${stop.travelTime}s`
          : new Date(stop.timeOfArrival).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
      }}
    </div>

    <div class="stop-node"><div class="inner-dot"></div></div>

    <div class="stop-details">
      <div class="stop-header">
        <span
          @click.stop="emit('edit-stop', stop)"
          class="stop-name"
          :class="{
            'invalid-stop': !stop.stop.name,
          }"
        >
          {{ stop.stop.name || "Arrêt à paramétrer" }}
        </span>
        <div class="icons">
          <span
            v-if="!stop.stop.isAccessible"
            class="badge accessible"
            title="Arrêt non accessible aux usagers en fauteuil roulant"
          >
            <img
              class="non-accessible-stop"
              src="../../assets/img/non-accessible-stop.png"
              alt="Arrêt non accessible aux usagers en fauteuil roulant"
              height="23em"
          /></span>
          <span
            v-if="stop.stop.hasGapWhenSteppingOff"
            class="badge"
            title="Attention à la marche à la descente du véhicule"
          >
            <img
              class="non-accessible-stop"
              src="../../assets/img/gap.png"
              alt="Attention à la marche à la descente du véhicule"
              height="25em"
          /></span>
        </div>

        <span class="badges">
          <span v-if="stop.isFirstStop" class="badge terminus"
            >Montée uniquement</span
          >
          <span
            v-if="
              stop.isStopSkipped || (isAfterPartialTerminus && !stop.isTerminus)
            "
            class="badge terminus"
            ><i>Arrêt non desservi </i></span
          >
          <span
            v-if="stop.isTerminus && isLastStop && !isAfterPartialTerminus"
            class="badge terminus"
            >Descente uniquement</span
          >
          <span
            v-if="stop.isTerminus && isLastStop && isAfterPartialTerminus"
            class="badge terminus"
            ><i>Terminus non desservi</i></span
          >
          <span v-if="stop.isTerminus && !isLastStop" class="badge terminus"
            >Terminus partiel</span
          >
        </span>
        <button
          class="action-btn edit-btn"
          @click.stop="emit('edit-stop', stop)"
          title="Éditer cet arrêt"
          aria-label="Éditer cet arrêt"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            ></path>
            <path
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            ></path>
          </svg>
        </button>
        <button
          class="action-btn delete-btn"
          @click.stop="emit('delete-stop', stop)"
          title="Supprimer cet arrêt"
          aria-label="Supprimer cet arrêt"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            ></path>
          </svg>
        </button>
      </div>
      <div class="stop-subtitle" v-if="stop.stop.subtitle">
        {{ stop.stop.subtitle }}
      </div>
      <div class="stop-landmark" v-if="stop.stop.landmarkName">
        {{ stop.stop.landmarkName }}
      </div>

      <div class="stop-connections" v-if="processedConnections.length > 0">
        <div
          v-for="group in processedConnections"
          :key="group.mode"
          class="connection-group"
        >
          <img
            :src="`/modes/${group.mode.toLowerCase()}.svg`"
            :alt="group.mode"
            :title="group.mode"
            class="mode-logo"
          />

          <div class="lines-wrapper">
            <LineLogo
              v-for="cLine in group.lines"
              :key="cLine.id"
              :line="cLine"
              class-name="stop-connection-line-logo"
              size="1.5rem"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.thermometer-stop {
  display: flex;
  align-items: flex-start;
  position: relative;
  min-height: 70px;
}
button:hover {
  cursor: pointer;
}
button.disabled,
button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
  pointer-events: none;
}
.delete-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
}
.edit-btn {
  color: black;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
}

.thermometer-stop:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 102px;
  top: 24px;
  bottom: -12px;
  width: 6px;
  background-color: var(--route-color);
  transform: translateX(-50%);
  z-index: 1;
}
.icons {
  display: flex;
  gap: 4px;
  align-items: center;
}
.is-terminus .stop-name {
  background-color: black;
  color: white;
  padding: 0.2em 0.5em;
}

.move-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 8px;
  margin-right: 8px;
  width: 20px;
  flex-shrink: 0;
}
.move-btn {
  background: transparent;
  color: #adb5bd;
  border: none;
  border-radius: 4px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.move-btn:hover {
  color: #212529;
  background-color: #f8f9fa;
}

.stop-time {
  width: 50px;
  padding-top: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #495057;
  text-align: right;
  margin-right: 14px;
}
.stop-node {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fff;
  border: 5px solid var(--route-color);
  margin-top: 9px;
  z-index: 2;
  flex-shrink: 0;
  box-sizing: border-box;
}
.stop-details {
  margin-left: 20px;
  padding-bottom: 24px;
  flex: 1;
  transition: transform 0.2s ease;
  padding-top: 8px;
}
.stop-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stop-name {
  font-weight: 700;
  font-size: 1.15rem;
  color: #212529;
  cursor: pointer;
}
.stop-subtitle {
  font-weight: 500;
  font-size: 0.9rem;
  color: #495057;
}
.stop-landmark {
  font-weight: 600;
  background-color: #6e491e;
  font-size: 1rem;
  color: white;
  padding: 2px 6px;
  width: fit-content;
  margin-top: 2px;
}
.badges {
  margin-left: auto;
  display: flex;
  gap: 6px;
}
.badge {
  font-size: 0.7rem;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
}
.badge.terminus {
  background-color: #212529;
  color: #fff;
}

.stop-connections {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.connection-group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.mode-logo {
  height: 1.5rem;
  width: auto;
  flex-shrink: 0;
  margin-top: 1px;
}

.lines-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.is-skipped .stop-node {
  border-color: #dee2e6;
  background-color: #f8f9fa;
}
.is-skipped .stop-time {
  color: #adb5bd;
}
.is-skipped .stop-name {
  text-decoration: line-through !important;
  color: #adb5bd !important;
  background-color: transparent !important;
  opacity: 0.7;
}
.invalid-stop {
  color: crimson;
  font-style: italic;
}
</style>
