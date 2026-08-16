<template>
  <aside class="aside">
    <div class="text">
      <Transition name="text-translation-fade" mode="out-in">
        <span
          class="translation"
          v-html="departureInTranslation"
          :key="departureInTranslation"
        ></span>
      </Transition>
    </div>
    <div class="time-information">
      <div class="time">
        <div :class="{ 'blink-text': displayedMinutes <= 0 }" ref="element">
          {{ displayedMinutes }}
        </div>
      </div>
      <div class="unit">min</div>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getSecondesFromDate } from "../../utils";
import { useIntervalFn } from "@vueuse/core";
import { useRotatedText } from "../../hooks/useRotatedText";
import { DEPARTURE_IN_TEXTS } from "../../translations";
interface Props {
  departureDate: string;
}
const element = ref<HTMLElement>();
const props = defineProps<Props>();
const secondes = ref<number>(getSecondesFromDate(props.departureDate));
const minutes = computed(() => Math.round(secondes.value / 60));
const displayedMinutes = ref<number>(minutes.value);

const animateChange = async () => {
  if (!element.value) return;
  await element.value.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(0.9)", opacity: 0.8 },
    ],
    {
      duration: 2000,
      easing: "ease-out",
    },
  ).finished;
  await element.value.animate(
    [
      { transform: "scale(0.9)", opacity: 0.8 },
      { transform: "scale(1.1)", opacity: 1 },
    ],
    {
      duration: 1000,
      easing: "ease-in-out",
    },
  ).finished;
  displayedMinutes.value = minutes.value;
  await element.value.animate(
    [
      { transform: "scale(1.1)", opacity: 1 },
      { transform: "scale(1)", opacity: 1 },
    ],
    {
      duration: 1200,
      easing: "ease-in-out",
    },
  ).finished;
};
watch(minutes, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    animateChange();
  }
});

useIntervalFn(
  () => {
    const _secondes = getSecondesFromDate(props.departureDate);
    secondes.value = _secondes;
  },
  10_000,
  { immediate: true },
);
const departureInTranslation = useRotatedText(DEPARTURE_IN_TEXTS);
</script>
<style lang="css" scoped>
aside {
  padding: 1cqw;
  font-size: 2.5cqw;
  box-shadow: -5px 0 5px -5px black;
  background-color: rgb(36, 36, 36);
  display: grid;
  grid-template-rows: 10% 1fr;
  grid-template-columns: 100%;
  width: 100%;
  height: 100%;
}
.time-information {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.departure-in {
  display: flex;
  padding: 1cqw;
  flex-direction: column;
  background-color: rgb(36, 36, 36);
  justify-content: space-between;
  color: var(--ratp-yellow);
}
.text {
  color: white;
}
.time,
.unit {
  text-align: center;
  font-family: "ParisineBold";
  color: var(--ratp-yellow);
}
.time {
  font-size: 12cqw;
}
.unit {
  font-size: 3cqw;
  opacity: 0.8;
}
</style>
