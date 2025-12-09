<template>
  <div class="desserte-overview">
    <div class="desserte-overview-content">
      <div class="header">
        <span class="direction">➡️ {{ desserte.direction }}</span>
        <span class="status">{{ status }}</span>
      </div>
      <div v-if="desserte.stops.length > 1">
        <details class="desserte">
          <summary>Desserte</summary>
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
                  >{{ stopInfo.stop.name }}</span
                >
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
    <div class="go-to-screen">
      <RouterLink
        :to="{
          name: 'DesserteDetails',
          query: { tripRef: desserte.id, lineRef: line.id },
        }">
      <div class="go-button">
        GO
      </div>
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
  // If the first stop has the firstStop flag then
  const minutes = getMinutesFromDate(props.desserte.stops[0].timeOfArrival);
  if (props.desserte.stops[0].isFirstStop) {
    // if minutes <= 0 then say "Départ imminent"
    if (minutes <= 0) {
      return "⌛️ Départ imminent de " + props.desserte.stops[0].stop.name;
    }
    return (
      "⏳ Départ prévu de " +
      props.desserte.stops[0].stop.name +
      " dans " +
      getMinutesFromDate(props.desserte.stops[0].timeOfArrival) +
      " min"
    );
  }
  if (props.desserte.stops[0].isTerminus) {
    return "❗️ Prochain arrêt : terminus";
  }
  if (minutes <= 0) {
    return "🔜 À l'approche de " + props.desserte.stops[0].stop.name;
  }
  return (
    "📍 Prochain arrêt : " +
    props.desserte.stops[0].stop.name +
    " dans " +
    getMinutesFromDate(props.desserte.stops[0].timeOfArrival) +
    " min"
  );
});
</script>

<style scoped>
.desserte summary:hover {
  cursor: pointer;
}
.stops-list {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 1em;
}
a{
  height: fit-content;
}

.stop-item {
  display: flex;
  align-items: stretch;
  padding-bottom: 0;
}
.skipped-stop {
  opacity: 0.5;
}
/* --- Visuel --- */
.stop-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 30px;
  margin-right: 10px;
}
.direction {
  font-weight: bold;
  font-size: 1.2em;
}
.status {
  color: #666;
  font-size: 0.9em;
  margin-top: 4px;
}
.desserte-overview {
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  display: grid;
  grid-template-columns: 80% 20%;
  background-color: #f9f9f9;
}
.desserte-overview-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.go-to-screen {
  display: flex;
  justify-content: center;
  padding-top: 20%;
}
.go-button {
  background-color: #2cbf53;
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
  a::visited {
  text-decoration: none;
  color: white;
  }
  a{
    text-decoration: none;
    color: white;
  }

.dot {
  width: 12px;
  height: 12px;
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
  height: 1px;
  flex-grow: 0;
}

.bottom-line {
  flex-grow: 1;
}
.header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top-line.hidden,
.bottom-line.hidden {
  visibility: hidden;
}

.stop-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-bottom: 5px;
}
.stop-content:has(.skipped-stop) {
  opacity: 0.5;
  padding-bottom: 10px;
}

.stop-name {
  font-weight: bold;
}

.stop-time {
  font-size: 0.85em;
  color: #666;
  margin-top: 4px;
}
@media (prefers-color-scheme: dark) {
  .desserte-overview {
    background-color: #1e1e1e;
    color: white;
  }
  .status {
    color: #aaa;
  }
}
</style>
