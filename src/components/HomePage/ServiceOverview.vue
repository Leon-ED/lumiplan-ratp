<template>
  <div class="desserte-overview">
    <div class="desserte-overview-content">
      <div class="header">
        <div class="direction-container">
          <div
            v-if="badgesList.length > 0"
            class="mission-badge"
            :style="{ backgroundColor: line.color, color: line.textColor }"
          >
            <span v-for="badge in badgesList">
              {{ badge }}
            </span>
          </div>
          <span class="direction">
            {{ desserte.destinationStop.stopName }}
          </span>
        </div>

        <span
          v-if="
            desserte.stopTimes.length > 0 && isPassed(desserte.stopTimes[0])
          "
          class="provenance"
        >
          Origine: {{ desserte.originStop.stopName }}
        </span>
        <span class="status">{{ status }}</span>
      </div>

      <div class="details-wrapper" v-if="desserte.stopTimes.length > 1">
        <details class="desserte">
          <summary>Voir les arrêts</summary>
          <ul class="stops-list">
            <li
              v-for="(stopTime, index) in desserte.stopTimes"
              :key="stopTime.stopPoint.stopRef"
              :data-stop-id="stopTime.stopPoint.stopRef"
              class="stop-item"
              :class="{ 'passed-stop': isPassed(stopTime) }"
            >
              <div class="stop-visual">
                <div
                  class="line top-line"
                  :class="{ hidden: index === 0 }"
                  :style="{
                    backgroundColor: isPassed(stopTime) ? '' : line.color,
                  }"
                ></div>
                <div
                  class="dot"
                  :style="{ borderColor: isPassed(stopTime) ? '' : line.color }"
                ></div>
                <div
                  class="line bottom-line"
                  :class="{ hidden: index === desserte.stopTimes.length - 1 }"
                  :style="{
                    backgroundColor: isPassed(stopTime) ? '' : line.color,
                  }"
                ></div>
              </div>

              <div class="stop-content">
                <span class="stop-name">
                  {{ stopTime.stopPoint.stopName }}
                </span>
                <span class="stop-time">
                  {{
                    new Date(stopTime.arrivalTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </span>
              </div>
            </li>
          </ul>
        </details>
      </div>
    </div>

    <div class="actions-sidebar">
      <RouterLink
        :to="{
          name: 'DesserteDetails',
          query: { line: line.id, trip: desserte.id },
        }"
        class="action-btn go-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-play-fill"
          viewBox="0 0 16 16"
        >
          <path
            d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"
          />
        </svg>
        Lancer
      </RouterLink>
      <RouterLink
        :to="{ name: 'Editor', query: { line: line.id, trip: desserte.id } }"
        class="action-btn edit-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-pencil-square"
          viewBox="0 0 16 16"
        >
          <path
            d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
          />
          <path
            fill-rule="evenodd"
            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
          />
        </svg>
        Éditer
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Line } from "../../types";
import { getMinutesFromDate } from "../../utils";
import { VehicleJourney, Status, StopTime } from "../../types";

const props = defineProps<{
  line: Line;
  desserte: VehicleJourney;
}>();

const badgesList = computed(() => {
  const list = [];

  if (
    props.desserte.headsign &&
    props.desserte.headsign.length <= 6 && props.desserte.shortName &&
    !props.desserte.shortName.startsWith(props.desserte.headsign)
  ) {
    list.push(props.desserte.headsign);
  }
  if (props.desserte.shortName && props.desserte.shortName.length <= 6) {
    list.push(props.desserte.shortName);
  }
  return list;
});

const isPassed = (stopTime: StopTime) => {
  const timeToEvaluate = stopTime.departureTime || stopTime.arrivalTime;
  if (!timeToEvaluate) return false;

  // Si le temps de l'arrêt est inférieur à l'heure actuelle, il est passé.
  return new Date(timeToEvaluate).getTime() < Date.now();
};

const firstUpcomingStop = computed(() => {
  return props.desserte.stopTimes?.find((st) => !isPassed(st)) || null;
});

const status = computed(() => {
  if (!props.desserte.stopTimes || props.desserte.stopTimes.length === 0)
    return "";

  const upcomingStop = firstUpcomingStop.value;

  if (!upcomingStop) {
    return "Terminus atteint";
  }
  const minutes = getMinutesFromDate(upcomingStop.arrivalTime);

  if (upcomingStop.status === Status.FirstStop) {
    if (minutes <= 0)
      return "Départ imminent de " + upcomingStop.stopPoint.stopName;
    return (
      "Départ prévu de " +
      upcomingStop.stopPoint.stopName +
      " dans " +
      minutes +
      " min"
    );
  }

  if (upcomingStop.status === Status.LastStop) {
    return (
      "Prochain arrêt : " + upcomingStop.stopPoint.stopName + " (terminus)"
    );
  }

  if (minutes <= 0) return "À l'approche de " + upcomingStop.stopPoint.stopName;

  return (
    "Prochain arrêt : " +
    upcomingStop.stopPoint.stopName +
    " dans " +
    minutes +
    " min"
  );
});
</script>
<style scoped>
.desserte-overview {
  box-sizing: border-box;
  width: 100%;
  padding: 1.2rem;
  border-radius: 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #dcdde1;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.desserte-overview:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.desserte-overview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.direction-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.mission-badge {
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-weight: 800;
  font-size: 0.9em;
  text-transform: uppercase;
  min-width: 40px;
}

.direction {
  font-weight: 700;
  font-size: 1.15em;
  color: #111111;
}

.provenance {
  color: #576574;
  font-size: 0.85em;
  font-weight: 600;
  font-style: italic;
}

.status {
  color: #2d3436;
  font-size: 0.9em;
  font-weight: 600;
}

.details-wrapper {
  margin-top: 8px;
}

.desserte summary {
  cursor: pointer;
  font-weight: 600;
  color: #004b8a;
  user-select: none;
  font-size: 0.95em;
  padding: 4px 0;
}

.desserte summary:hover {
  text-decoration: underline;
}

.stops-list {
  list-style: none;
  padding: 0;
  margin: 1em 0 0 0;
}

.stop-item {
  display: flex;
  align-items: stretch;
  min-height: 40px;
}

.stop-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 24px;
  margin-right: 12px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: white;
  border-width: 3px;
  border-style: solid;
  flex-shrink: 0;
  z-index: 1;
}

.line {
  width: 3px;
}

.top-line {
  height: 4px;
  flex-grow: 0;
}

.bottom-line {
  flex-grow: 1;
  min-height: 20px;
}

.top-line.hidden,
.bottom-line.hidden {
  visibility: hidden;
}

.stop-content {
  display: flex;
  flex-direction: column;
  padding-bottom: 15px;
  transition: all 0.2s ease;
}

.stop-name {
  font-weight: 700;
  color: #1e272e;
}

.stop-time {
  font-size: 0.85em;
  color: #485460;
  margin-top: 2px;
  font-weight: 500;
}

.passed-stop .stop-name {
  color: #7f8fa6;
  font-weight: 600;
  font-size: 0.9em;
}

.passed-stop .stop-time {
  color: #7f8fa6;
  font-size: 0.8em;
}

.passed-stop .dot {
  border-color: #bdc3c7 !important;
  background-color: #f1f2f6;
}

.passed-stop .line {
  background-color: #bdc3c7 !important;
}

.actions-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 10px;
  border-left: 1px dashed #c8d6e5;
}

.action-btn {
  text-align: center;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9em;
  text-decoration: none;
  color: white;
  transition:
    filter 0.2s ease,
    transform 0.1s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
}

.action-btn:active {
  transform: scale(0.98);
}

.go-button {
  background-color: #2cbf53;
  box-shadow: 0 2px 8px rgba(44, 191, 83, 0.3);
}

.edit-button {
  background-color: #dc9600;
  box-shadow: 0 2px 8px rgba(220, 150, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  .desserte-overview {
    background-color: #1e1e1e;
    border-color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .direction,
  .stop-name {
    color: #f5f6fa;
  }
  .status,
  .stop-time {
    color: #a4b0be;
  }
  .provenance {
    color: #718093;
  }
  .desserte summary {
    color: #74b9ff;
  }
  .actions-sidebar {
    border-left-color: #333;
  }
  .dot {
    background-color: #1e1e1e;
  }

  .passed-stop .stop-name,
  .passed-stop .stop-time {
    color: #576574;
  }
  .passed-stop .dot {
    border-color: #2f3640 !important;
    background-color: #1e1e1e;
  }
  .passed-stop .line {
    background-color: #2f3640 !important;
  }
}
</style>