<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { cleanText, getSecondesFromDate } from "../../utils";
import { StopWithTime } from "../../types";

const props = defineProps<{ stop: StopWithTime; index: number }>();

const nowTrigger = ref(Date.now());
let timer: ReturnType<typeof setInterval>;

const stopRef = ref<HTMLElement | null>(null);
const isVisible = ref(true);
let observer: IntersectionObserver;

onMounted(() => {
  timer = setInterval(() => {
    nowTrigger.value = Date.now();
  }, 1000);

  observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = entry.isIntersecting;
    },
    {
      root: null, 
      threshold: 1,
    }
  );

  if (stopRef.value) {
    observer.observe(stopRef.value);
  }
});

onUnmounted(() => {
  clearInterval(timer);

  if (observer && stopRef.value) {
    observer.unobserve(stopRef.value);
  }
});

const stopNameClass = computed(() => {
  return {
    "stop-name-long": props.stop.stop.name.length >= 21,
    "stop-name-very-long": props.stop.stop.name.length >= 29,
  };
});

const isStopCurrent = (stop: StopWithTime, index: number) => {
  //@ts-ignore
  const _ = nowTrigger.value;

  return (
    !stop.isStopSkipped &&
    getSecondesFromDate(stop.timeOfArrival, true) <= 0 &&
    index === 0 &&
    getSecondesFromDate(stop.timeOfDeparture, true) > -20
  );
};
</script>

<template>
  <li
    ref="stopRef"
    class="stop"
    :class="{
      'is-out-of-view': !isVisible,
      blinkable: index === 0 && !stop.isStopSkipped,
      'is-last-stop': stop.isTerminus,
      'is-current': isStopCurrent(stop, index),
      'is-skipped': stop.isStopSkipped,
    }"
    :data-time="getSecondesFromDate(stop.timeOfArrival, true)"
  >
    <div class="stop-indicator-wrapper">
      <div class="stop-indicator"></div>
    </div>

    <span class="stop-name" :class="stopNameClass">
      <div class="text-bg">
        {{ cleanText(stop.stop.name) }}

        <img
          class="non-accessible-stop"
          src="../../assets/img/non-accessible-stop.png"
          alt="non accessible stop"
          v-if="!stop.stop.isAccessible && !stop.isTerminus && !isStopCurrent(stop, index) && !stop.isStopSkipped"
        />

        <img
          class="non-accessible-stop"
          src="../../assets/img/non-accessible-stop-white-bg.png"
          alt="non accessible stop"
          v-if="!stop.stop.isAccessible && !stop.isStopSkipped && (stop.isTerminus || isStopCurrent(stop, index))"
        />
      </div>
    </span>
  </li>
</template>

<style scoped>
.stop {
  display: flex;
  position: relative;
  align-items: center;
  gap: 0;
}

.stop.is-out-of-view {
  visibility: hidden;
}
.stop-indicator-wrapper {
  width: var(--gutter-width);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  z-index: 2;
}

.stop-indicator {
  width: 2.5cqw;
  height: 2.5cqw;
  background-color: white;
  border: 0.5cqw solid black;
  border-radius: 50%;
}

.stop.is-last-stop::after {
  content: "";
  position: absolute;
  left: calc(var(--gutter-width) / 2);
  transform: translateX(-50%);
  width: 2.8cqw;
  top: 50%;
  height: 100vh;
  background-color: var(--ratp-beige);
  z-index: 1;
  pointer-events: none;
}
.stop-name {
  color: var(--ratp-blue);
  font-size: 5cqw;
}

.stop-name-long {
  font-size: 4cqw;
}

.stop-name-very-long {
  font-size: 3.5cqw;
}

.non-accessible-stop {
  height: 0.8em;
}
.non-accessible-stop {
  height: .8em;
}



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
  transition: transform 1.5s ease-in-out;
  z-index: 10;
  position: absolute;
  width: 100%;
}
.stop-transition-enter-from {
  transform: translateY(200%);
}
.stop-transition-leave-to {
  transform: translateY(-450%);
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


.stop.is-last-stop .stop-name .text-bg {
  background-color: black;
  color: white;
  padding: 0.1em 0.2em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.stop.is-current:first-of-type .stop-name .text-bg {
  background-color: var(--ratp-blue);
  color: white;
  padding: 0.1em 0.2em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.stop.is-current:first-of-type .stop-name {
  background-color: transparent;
  padding: 0;
}

.stop.is-skipped .stop-indicator::before,
.stop.is-skipped .stop-indicator::after {
  content: "";
  position: absolute;
  background-color: #ff1400;
  width: 4.5cqw;
  height: 0.7cqw;
  left: 3cqw;
  top: 50%;
  border-radius: 1px;
  z-index: 15;
}
.stop.is-skipped .stop-indicator::before {
  transform: translate(-50%, -50%) rotate(45deg);
}
.stop.is-skipped .stop-indicator::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
</style>