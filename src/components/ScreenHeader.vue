<template>
  <header class="header">
    <img
      v-if="line"
      :src="'/modes/' + line.mode.toLowerCase() + '.svg'"
      class="mode-picto"
    />
    <LineLogo
      v-if="line"
      :line="line"
      class-name="picto"
      class="line-logo"
      :size="logoSize"
      :blink="isLimitedService"
    />
    <div
      v-if="vehicleNumber && line && showMissionEnabled"
      class="vehicle-number"
    >
      {{ vehicleNumber }}
    </div>
    <TransitionGroup name="slide" tag="div" class="direction">
      <span v-if="isAtStop" class="direction-label" key="label">Direction</span>
      <span v-if="direction" class="direction-name" key="name">
        <span class="slide-up">{{ direction }}</span>
      </span>
    </TransitionGroup>
    <div class="clock"><Clock /></div>
  </header>
</template>

<script setup lang="ts">
import { Line, Mode } from "../types";
import LineLogo from "./Other/LineLogo.vue";
import Clock from "./Other/Clock.vue";
import { computed } from "vue";
import { useSettings } from "../composables/useSettings.ts";

const props = defineProps<{
  direction: string;
  line: Line;
  isLimitedService: boolean;
  isAtStop: boolean;
  vehicleNumber?: string;
}>();
const { showMissionEnabled } = useSettings();
const logoSize = computed(() => {
  if ([Mode.BUS, Mode.NOCTILIEN, Mode.BUS_AEROPORT].includes(props.line.mode)) {
    return "80%";
  }
  return "100%";
});
</script>

<style lang="scss" scoped>
.header:hover {
  cursor: pointer;
}

.line-logo {
  margin-top: auto;
  margin-bottom: auto;
}
.vehicle-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3cqw 0.5cqw;
  border-radius: 0.2cqw;
  font-size: 1.3cqw;
  height: fit-content;
  white-space: nowrap;
  font-family: "ParisineBold", sans-serif;
  margin-left: 0.5cqw;
  background-color: #625e57;
  color: white;
}

.no-data-available header,
.no-data-available header * {
  background-color: rgb(36, 36, 36);
  color: rgb(36, 36, 36) !important;
  font-size: 0 !important;
}

.no-data-available header .picto,
.no-data-available header .mode-picto,
.no-data-available header .vehicle-number {
  display: none !important;
}

header {
  container-type: inline-size;
  background-color: white;
  display: flex;
  align-items: center;
  gap: 1cqw;
  padding-left: 1cqw;
  font-family: "ParisineBold", sans-serif;
  box-shadow: 0 5px 5px -5px black;
  position: relative;
  z-index: 10;
}

.picto {
  height: 70%;
}

.mode-picto {
  height: 70%;
  width: auto;
}

.direction {
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.direction-label {
  display: inline-block;
  color: #212121;
  font-size: 1.5cqw;
  align-self: last baseline;
  margin-bottom: 0.5cqw;
  margin-right: 0.8ch;
  white-space: nowrap;
  overflow: hidden;
}

.direction-name {
  color: var(--ratp-blue);
  font-size: 3.5cqw;
}
.slide-up {
  display: inline-block;
  animation: slide-up 0.7s ease-in-out;
}
@keyframes slide-up {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.clock {
  position: absolute;
  right: 0cqw;
  width: 13%;
  height: 100%;
  color: var(--ratp-yellow);
  font-family: "ParisineRegular";
  background-color: black;
  font-size: 3cqw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slide-move,
.direction-label.slide-enter-active,
.direction-label.slide-leave-active {
  transition: all 1s ease-in-out;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-75%);
}

.slide-leave-active {
  position: absolute;
  width: 11ch;
}
.direction-name.slide-enter-active,
.direction-name.slide-leave-active {
  transition: none;
}
</style>
