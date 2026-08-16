<template>
  <div class="desserte-overview">
    <div class="desserte-overview-content">
      <div class="header">
        <span class="direction">
          {{ desserte.direction }}
        </span>
        <span class="status">{{ status }}</span>
      </div>

      <div class="details-wrapper" v-if="desserte.stops.length > 1">
        <details class="desserte">
          <summary>Voir les arrêts</summary>
          <ul class="stops-list">
            <li
              v-for="(stopInfo, index) in desserte.stops"
              :key="stopInfo.stop.id"
              :data-stop-id="stopInfo.stop.id"
              class="stop-item"
            >
              <div class="stop-visual">
                <div
                  class="line top-line"
                  :class="{ hidden: index === 0 }"
                  :style="{ backgroundColor: line.color }"
                ></div>
                <div class="dot" :style="{ borderColor: line.color }"></div>
                <div
                  class="line bottom-line"
                  :class="{ hidden: index === desserte.stops.length - 1 }"
                  :style="{ backgroundColor: line.color }"
                ></div>
              </div>

              <div class="stop-content">
                <span
                  class="stop-name"
                  :class="{ 'skipped-stop': stopInfo.isStopSkipped }"
                >
                  {{ stopInfo.stop.name }}
                </span>
                <span class="stop-time" v-if="!stopInfo.isStopSkipped">
                  {{
                    new Date(stopInfo.timeOfArrival).toLocaleTimeString([], {
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
import { Desserte, Line } from "../../types";
import { getMinutesFromDate } from "../../utils";

const props = defineProps<{
  line: Line;
  desserte: Desserte;
}>();

const status = computed(() => {
  const minutes = getMinutesFromDate(props.desserte.stops[0].timeOfArrival);
  if (props.desserte.stops[0].isFirstStop) {
    if (minutes <= 0)
      return "Départ imminent de " + props.desserte.stops[0].stop.name;
    return (
      "Départ prévu de " +
      props.desserte.stops[0].stop.name +
      " dans " +
      minutes +
      " min"
    );
  }
  if (props.desserte.stops[0].isTerminus)
    return (
      "Prochain arrêt : " + props.desserte.stops[0].stop.name + " (terminus)"
    );
  if (minutes <= 0)
    return "À l'approche de " + props.desserte.stops[0].stop.name;
  return (
    "Prochain arrêt : " +
    props.desserte.stops[0].stop.name +
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.desserte-overview:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
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

.direction {
  font-weight: 700;
  font-size: 1.15em;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 0.9em;
}

.status {
  color: #636e72;
  font-size: 0.9em;
  font-weight: 500;
}

.details-wrapper {
  margin-top: 8px;
}

.desserte summary {
  cursor: pointer;
  font-weight: 600;
  color: #005fad;
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
}

.stop-name {
  font-weight: 600;
  color: #2d3436;
}

.stop-time {
  font-size: 0.85em;
  color: #636e72;
  margin-top: 2px;
}

.skipped-stop {
  opacity: 0.4;
}

.actions-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 10px;
  border-left: 1px dashed #e0e0e0;
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
  .desserte summary {
    color: #74b9ff;
  }
  .actions-sidebar {
    border-left-color: #333;
  }
  .dot {
    background-color: #1e1e1e;
  }
}
</style>
