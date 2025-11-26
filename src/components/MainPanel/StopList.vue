<script setup lang="ts">
import { computed } from "vue";
import Stop from "./Stop.vue";
import { StopWithTime } from "../../types";

const props = defineProps<{ stops: StopWithTime[]; primaryColor: string }>();

const text = computed(() => {
  return props.stops[props.stops.length - 1].isTerminus &&
    props.stops.length === 1
    ? "Prochain arrêt : terminus"
    : "Prochains arrêts";
});
const getIndexForStop = (i: number) => {
  const stop0 = props.stops[0];
  const stop1 = props.stops[1];

  // Cas 1 : stop 0 n'est pas skip → il est le seul index 0
  if (!stop0.isStopSkipped) {
    return i === 0 ? 0 : 1;
  }

  // Cas 2 : stop 0 est skip → stop 1 prend 0 s'il peut
  if (stop1 && !stop1.isStopSkipped) {
    return i === 1 ? 0 : 1;
  }

  // Cas 3 : les deux sont skip → aucun index 0
  return 1;
};

</script>

<template>
  <div class="stops-list-container">
    <ol class="stops-list">
      <li class="next-stop-container" key="next-stop">
        <div class="next-stop-arrow-indicator">
          <img
            src="../../assets/img/down-arrow.png"
            alt="arrow"
            class="arrow-icon"
          />
        </div>
        <span class="next-stop-description">{{ text }}</span>
      </li>
      <TransitionGroup
        name="stop-transition"
        tag="div"
        class="stops-transition-wrapper"
      >
        <Stop
          v-for="(stopWithTime, index) in stops.slice(0, 2)"
          :index="getIndexForStop(index)"
          :key="stopWithTime.stop.id"
          :stop="stopWithTime"
        />
      </TransitionGroup>
    </ol>
  </div>
</template>

<style lang="css" scoped>
.stops-list-container {
  overflow: hidden;
  height: 100%;
  width: 100%;
  background-color: var(--ratp-blue); /* Fallback */
  font-family: "ParisineBold", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: var(--ratp-beige);
  color: white;
}

.stops-list {
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-around;
  padding-right: 2cqw;
}
.stop-transition-move {
  transition: transform 1s ease-in-out;
  z-index: 10;
}
.stops-list::before {
  content: "";
  position: absolute;
  left: 2.05cqw;
  top: -1000px;
  bottom: 0;
  width: 2.2cqw;
  height: 100000px;
  background-color: v-bind(primaryColor);
  z-index: 1;
}

.arrow-icon {
  position: absolute;
  z-index: 2;
  left: 2.5cqw;
  top: 1.45cqw;
  width: 1.3cqw;
  fill: white;
}
.next-stop-description {
  font-family: "ParisineRegular";
  position: absolute;
  left: 5.5cqw;
  top: 1cqw;
  font-size: 2cqw;
  color: #212121;
}

.next-stop {
  font-family: "ParisineRegular";
  font-size: 2.1cqw;
  color: gray;
  padding: 0;
  padding-left: 2cqw;
}
.next-stop .stop-indicator {
  border-radius: 0;
  background-color: transparent;
  border: none;
  width: 2.5cqw;
  height: 2.5cqw;
  left: 0.9cqw;
  top: 0cqw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stops-transition-wrapper {
  display: contents;
}

.next-stop-container {
  transition: opacity 0.5s ease;
}

.stops-list:has(.stop-transition-enter-active) .next-stop-container,
.stops-list:has(.stop-transition-leave-active) .next-stop-container {
  opacity: 0;
  pointer-events: none; /* Empêche les clics pendant l'animation */
}
</style>
