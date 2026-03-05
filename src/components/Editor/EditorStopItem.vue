<script setup lang="ts">
import { computed } from "vue";
import { Line, StopWithTime, Mode } from "../../types";
import LineLogo from "../Other/LineLogo.vue";
import { sortedLines } from "../../utils";

const props = defineProps<{
  stop: StopWithTime;
  route: Line;
}>();

const emit = defineEmits<{
  (e: "edit-stop", stop: StopWithTime): void;
}>();

const processConnections = (lines: Line[]) => {
  const busLines = lines.filter(
    (l) =>
      (l.mode === Mode.BUS || l.mode === Mode.NOCTILIEN) &&
      l.id !== props.route.id,
  );
  const terLines = lines.filter((l) => l.mode === Mode.TER);
  const otherLines = lines.filter(
    (l) =>
      l.mode !== Mode.BUS &&
      l.mode !== Mode.NOCTILIEN &&
      l.mode !== Mode.TER &&
      l.id !== props.route.id,
  );

  const showGenericBus =
    busLines.length > 10 ||
    otherLines.some((l) => [Mode.RER, Mode.TRANSILIEN].includes(l.mode));
  const showSncf = terLines.length >= 1;

  const linesToDisplay = [...otherLines];

  if (!showGenericBus) {
    linesToDisplay.push(...busLines);
  }

  return {
    linesToDisplay,
    showGenericBus,
    showSncf,
  };
};

const processedConnections = computed(() =>
  processConnections(props.stop.stop.connectedLines),
);
</script>

<template>
  <div
    class="thermometer-stop"
    :class="{
      'is-skipped': stop.isStopSkipped,
      'is-terminus': stop.isTerminus,
    }"
    @click="emit('edit-stop', stop)"
  >
    <div class="stop-time">
      {{
        new Date(stop.timeOfArrival).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      }}
    </div>
    <div class="stop-node"><div class="inner-dot"></div></div>
    <div class="stop-details">
      <div class="stop-header">
        <span
          class="stop-name"
          :class="{
            'strike-through': stop.isStopSkipped,
            'invalid-stop': !stop.stop.name,
          }"
        >
          {{ stop.stop.name || "Arrêt à paramétrer" }}
        </span>
        <span
          v-if="!stop.stop.isAccessible"
          class="badge accessible"
          title="Arrêt non accessible aux usagers en fauteuil roulant"
        >
          <img
            class="non-accessible-stop"
            src="../../assets/img/non-accessible-stop.png"
            alt="Arrêt non accessible aux usagers en fauteil roulant"
            height="20em"
        /></span>
        <span class="badges">
          <span v-if="stop.isFirstStop" class="badge terminus"
            >Montée uniquement</span
          >
          <span v-if="stop.isStopSkipped" class="badge terminus no-print"
            ><i>Arrêt non desservi </i></span
          >
          <span v-if="stop.isTerminus" class="badge terminus"
            >Descente uniquement</span
          >
        </span>
      </div>
      <div class="stop-landmark" v-if="stop.stop.landmarkName">
        {{ stop.stop.landmarkName }}
      </div>

      <div class="stop-connections" v-if="stop.stop.connectedLines.length > 0">
        <LineLogo
          v-for="cLine in sortedLines(processedConnections.linesToDisplay)"
          :key="cLine.id"
          :line="cLine"
          class-name="stop-connection-line-logo"
          size="1.5rem"
        />
        <img
          v-if="processedConnections.showSncf"
          src="/modes/ter.svg"
          alt="SNCF"
          title="SNCF"
          class="generic-logo sncf-logo"
        />
        <img
          v-if="processedConnections.showGenericBus"
          src="/modes/bus.svg"
          alt="BUS"
          title="Correspondances Bus"
          class="generic-logo bus-logo"
        />
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
  cursor: pointer;
}
.thermometer-stop:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 74px;
  top: 24px;
  bottom: -12px;
  width: 6px;
  background-color: var(--route-color);
  transform: translateX(-50%);
  z-index: 1;
}
.is-terminus .stop-name {
  background-color: black;
  color: white;
  padding: 0.2em 0.5em;
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
}
.strike-through {
  text-decoration: line-through;
  color: #adb5bd;
}
.stop-landmark {
  font-size: 0.9rem;
  color: #6c757d;
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
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  align-items: center;
}

.generic-logo {
  height: 1.5em;
  width: auto;
  display: inline-block;
  vertical-align: middle;
}

.is-skipped .stop-node {
  border-color: #dee2e6;
  background-color: #f8f9fa;
}
.is-skipped .stop-time {
  color: #adb5bd;
}
.invalid-stop {
  color: crimson;
  font-style: italic;
}
</style>
