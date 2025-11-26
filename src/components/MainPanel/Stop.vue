<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { getSecondesFromDate } from "../../utils";
import { StopWithTime } from "../../types";

const props = defineProps<{ stop: StopWithTime; index: number }>();

const nowTrigger = ref(Date.now());
let timer: ReturnType<typeof setInterval>;

const stopNameClass = computed(() => {
  return {
    'stop-name-long': props.stop.stop.name.length >= 22
  }
});

onMounted(() => {
  timer = setInterval(() => {
    nowTrigger.value = Date.now();
  }, 1000);
});
const isStopCurrent = (stop: StopWithTime, index: number) => {
  // @ts-ignore
  const _ = nowTrigger.value;
  return !stop.isStopSkipped  && getSecondesFromDate(stop.timeOfArrival, true) <= 0 && index === 0 && getSecondesFromDate(stop.timeOfArrival, true) > -20;
};

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <li
    class="stop"
    :class="{
      blinkable: index === 0 && !stop.isStopSkipped,
      'is-last-stop': stop.isTerminus,
      'is-current': isStopCurrent(stop, index),
      'is-skipped': stop.isStopSkipped
    }"
    :data-time="getSecondesFromDate(stop.timeOfArrival, true)"
  >
    <div class="stop-indicator"></div>
    <span class="stop-name" :class="stopNameClass">{{ stop.stop.name }}</span>
    <div>
      <img class="non-accessible-stop" src="../../assets/img/non-accessible-stop.png" alt="non accessible stop" v-if="!stop.stop.isAccessible" />
    </div>
  </li>
</template>
<style lang="css" scoped>
.stop {
  display: flex;
  gap: 3cqw;
  position: relative;
}

.stop.is-last-stop::after {
  content: "";
  position: absolute;
  left: 2cqw;
  width: 2.5cqw;
  top: 4cqw;
  height: 100px;
  background-color: var(--ratp-beige);
  z-index: 1;
  pointer-events: none;
}
.next-stop-arrow-indicator {
  position: relative;
}
.non-accessible-stop {
  height: 5cqw;
}
.stop-indicator {
  width: 2.5cqw;
  height: 2.5cqw;
  background-color: white;
  border: 0.5cqw solid black;
  border-radius: 50%;
  left: 1.4cqw;
  top: 1.5cqw;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.stop-name {
  color: var(--ratp-blue);
  font-size: 5cqw;
}
.stop-name-long{
  font-size: 4cqw;
}


/* Animations pour les transitions */
.stop-transition-enter-active,
.stop-transition-leave-active {
  transition: transform 2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.stop-transition-enter-active .stop-indicator,
.stop-transition-leave-active .stop-indicator {
  z-index: 10;
}
.stop-transition-leave-active {
  transition: transform 1s ease-in-out;
  z-index: 10;

  position: absolute;
  width: 100%;
}
.stop-transition-enter-from {
  transform: translateY(200%);
}

.stop-transition-leave-to {
  transform: translateY(-400%);
}

.blinkable:not(
    .stop-transition-leave-active,
    .stop-transition-enter-active,
    .stop-transition-enter-from,
    .stop-transition-leave-to,
    .stop-transition-move
  )
  .stop-indicator {
  animation: blink 1.2s infinite steps(1);
}



.stop.is-current:first-of-type .stop-name {
  background-color: var(--ratp-blue);
  color: white;
  padding: 0.6cqw;
}
.stop.is-last-stop .stop-name {
  background-color: black !important;
  color: white;
  padding: 0.6cqw;
}
.stop.is-skipped .stop-indicator::before,
.stop.is-skipped .stop-indicator::after {
  content: "";
  position: absolute;
  background-color: #ff1400;
  width: 180%; 
  height: .7cqw; 
  left: 50%;
  top: 50%;
  border-radius: 1px;
  z-index: 15; 
}

/* Barre 1 : Rotation 45 deg */
.stop.is-skipped .stop-indicator::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

/* Barre 2 : Rotation -45 deg */
.stop.is-skipped .stop-indicator::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.stop.is-skipped .stop-name {
  color: gray;
}
</style>
