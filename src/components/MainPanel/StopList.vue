<script setup lang="ts">
import { computed } from "vue";
import Stop from "./Stop.vue";
import { StopWithTime } from "../../types";
import { useRotatedText } from "../../hooks/useRotatedText";
import { NEXT_STOP_TEXTS, TERMINUS_TEXTS } from "../../translations";

const props = defineProps<{ stops: StopWithTime[]; primaryColor: string;textColor: string }>();

const terminusLabel = useRotatedText(TERMINUS_TEXTS);
const nextStopLabel = useRotatedText(NEXT_STOP_TEXTS);

const currentDescription = computed(() => {
  if (props.stops.length === 0) return "";
  const isTerminusScenario =
    props.stops[props.stops.length - 1].isTerminus && props.stops.length === 1;

  return isTerminusScenario ? terminusLabel.value : nextStopLabel.value;
});

const getIndexForStop = (i: number) => {
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
        >
          <path
            d="M12 2V18M12 18L4 10M12 18L20 10"
            :stroke="textColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
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
          :real-index="index"
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
  width: 60vw;
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
.stop-transition-move:nth-child(n + 3) {
  visibility: visible;
  transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
  transition-delay: 0.8s;
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
  margin-top: 0.5cqw;
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
  display: block;
}

.next-stop-description {
  font-family: "ParisineRegular";
  font-size: 2cqw;
  color: #212121;
  display: inline-block;
}
.stops-list-container:has(.stops-list .stop-transition-enter-active)
  .next-stop-container,
.stops-list-container:has(.stops-list .stop-transition-leave-active)
  .next-stop-container {
  opacity: 0;
}
</style>
