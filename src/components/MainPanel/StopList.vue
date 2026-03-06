<script setup lang="ts">
import { computed } from "vue";
import Stop from "./Stop.vue";
import { StopWithTime } from "../../types";
import { useRotatedText } from "../../hooks/useRotatedText";
import { NEXT_STOP_TEXTS, TERMINUS_TEXTS } from "../../translations";

const props = defineProps<{ stops: StopWithTime[]; primaryColor: string }>();

// 1. On initialise les hooks au niveau supérieur (meilleure performance/stabilité)
const terminusLabel = useRotatedText(TERMINUS_TEXTS);
const nextStopLabel = useRotatedText(NEXT_STOP_TEXTS);

// 2. On calcule simplement quelle chaîne de caractères afficher
const currentDescription = computed(() => {
  if(props.stops.length === 0) return "";
  const isTerminusScenario = props.stops[props.stops.length - 1].isTerminus && props.stops.length === 1;
  
  // On accède à .value ici car useRotatedText retourne une ref/computed
  return isTerminusScenario ? terminusLabel.value : nextStopLabel.value;
});

const getIndexForStop = (i: number) => {
  // ... (votre logique existante inchangée)
  const stop0 = props.stops[0];
  const stop1 = props.stops[1];
  if (!stop0.isStopSkipped) return i === 0 ? 0 : 1;
  if (stop1 && !stop1.isStopSkipped) return i === 1 ? 0 : 1;
  return 1;
};
</script>

<template>
  <div class="stops-list-container">
    <div class="next-stop-container" key="next-stop">
      <div class="next-stop-arrow-indicator">
        <img
          src="../../assets/img/down-arrow.png"
          alt="arrow"
          class="arrow-icon"
        />
      </div>
     <Transition name="text-translation-fade" mode="out-in">
        <span 
          :key="currentDescription" 
          class="next-stop-description translation" 
          v-html="currentDescription"
        ></span>
      </Transition>
    </div>
    <ol class="stops-list">
      <TransitionGroup
        name="stop-transition"
        tag="div"
        class="stops-transition-wrapper"
      >
        <Stop
          v-for="(stopWithTime, index) in stops"
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
  background-color: var(--ratp-beige);
  color: white;
  font-family: "ParisineBold", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  /* Largeur de la colonne de gauche contenant la ligne et les points */
  --gutter-width: 6cqw; 
  --line-width: 2.2cqw;
}

.stops-list {
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  position: relative;
  margin-top: 2cqw;
  gap: 3cqw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.stops-transition-wrapper {
  display: contents;
}

.stop-transition-move {
  transition: transform 1s ease-in-out;
  z-index: 10;
}
.stop.is-out-of-view.stop-transition-move {
  visibility: visible;
transition: transform 1.5s cubic-bezier(0.45, 1, 0.4, 1);

  transition-delay: .7s;

  
}

.stops-list::before {
  content: "";
  position: absolute;
  
  left: calc(var(--gutter-width) / 2);
  transform: translateX(-50%);
  width: var(--line-width);
  
  top: -1000px;
  bottom: 0;
  height: 100000px;
  background-color: v-bind(primaryColor);
  z-index: 1;
}

.next-stop-container {
  position: relative;
  margin-top: .5cqw;
  transition: opacity 0.5s ease;
  display: flex; 
  align-items: center;
}

.next-stop-arrow-indicator {
  width: var(--gutter-width);
  display: flex;
  z-index: 2;
  justify-content: center; 
  flex-shrink: 0;
}

.arrow-icon {
  width: 1.3cqw;
  fill: white;
  display: block;
}

.next-stop-description {
  font-family: "ParisineRegular";
  font-size: 2cqw;
  color: #212121;
  display: inline-block;
}
.stops-list-container:has(.stops-list .stop-transition-enter-active) .next-stop-container,
.stops-list-container:has(.stops-list .stop-transition-leave-active) .next-stop-container {
  opacity: 0;
}
</style>