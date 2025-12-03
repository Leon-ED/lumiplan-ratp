<script setup lang="ts">
import { ref, watch } from "vue";
import { getMinutesFromDate } from "../../utils";
import { useIntervalFn } from "@vueuse/core";
const element = ref<HTMLElement>();
interface Props {
  direction: string;
  departureDate: string;
}
const props = defineProps<Props>();

const minutes = ref<number>(getMinutesFromDate(props.departureDate));
const displayedMinutes = ref<number>(minutes.value);

const animateChange = async () => {
  if (!element.value) return;
  await element.value.animate(
    [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0.9)", opacity: 0.8 }],
    {
      duration: 2000,
      easing: "ease-out",
      fill: "forwards",
    }
  ).finished;
  await element.value.animate(
    [{ transform: "scale(0.9)", opacity: 0.8 },{ transform: "scale(1.1)", opacity: 1 }],
    {
      duration: 1000,
      easing: "ease-in-out",
      fill: "forwards",
    }
  ).finished;
    displayedMinutes.value = minutes.value;
      await element.value.animate(
    [{ transform: "scale(1.1)", opacity: 1 },{ transform: "scale(1)", opacity: 1 },],
    {
      duration: 1200,
      easing: "ease-in-out",
      fill: "forwards",
    }
  ).finished;
};
watch(minutes, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    animateChange();
  }
});

useIntervalFn(
  () => {
    minutes.value = getMinutesFromDate(props.departureDate);
  },
  10_000,
  { immediate: true }
);
</script>
<template>
  <main class="direction">
    <div class="direction-name-container">
      <span>Direction</span>
      <span class="direction-name">{{ direction }}</span>
    </div>
    <aside class="aside">
      <div class="text">Départ dans</div>
      <div class="time">
        <div :class="{ 'blink-text': displayedMinutes === 0 }" ref="element">
          {{ displayedMinutes }}
        </div>
      </div>
      <div class="unit">min</div>
    </aside>
  </main>
</template>
<style lang="css" scoped>
.direction {
  display: grid;
  grid-template-columns: 65% 35%;
  grid-template-rows: 100%;
  color: gray;
  padding-left: 2cqw;
  background-color: white;
  font-size: 3cqw;
  box-shadow: 0 -5px 5px -5px black;
}
aside {
  padding: 1cqw;
  font-size: 2.5cqw;
  box-shadow: -5px 0 5px -5px black;
  background-color: rgb(36, 36, 36);
}
.direction-name-container {
  display: grid;
  grid-template-rows: 10% 90%;
  padding: 1cqw;
  font-size: 2.5cqw;
  font-family: "ParisineRegular";
}
.direction-name {
  font-size: 5cqw;
  font-family: "ParisineBold";
  text-align: center;
  align-self: center;
  color: var(--ratp-blue);
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
