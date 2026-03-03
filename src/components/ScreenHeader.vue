<template>
  <header class="header">
    <img
      v-if="line"
      :src="'/modes/' + line.mode.toLowerCase() + '.svg'"
      class="mode-picto"
    />
    <LineLogo v-if="line" :line="line" className="picto" size="100%" />

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
import { Line } from "../types";
import LineLogo from "./Other/LineLogo.vue";
import Clock from "./Other/Clock.vue";

defineProps<{
  direction: string;
  line: Line;
  isAtStop: boolean;
}>();


</script>

<style lang="scss" scoped>
.header:hover{
  cursor: pointer;

}
.no-data-available header,
.no-data-available header * {
  background-color: rgb(36, 36, 36);
  color: rgb(36, 36, 36) !important;
  font-size: 0 !important;
}

.no-data-available header .picto,
.no-data-available header .mode-picto {
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
  animation: slide-up 0.5s ease-in-out;
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

.slide-move{
  transition: all 0.75s ease-in-out;
}
.direction-label.slide-enter-active,
.direction-label.slide-leave-active {
  transition: all 0.75s ease-in-out;
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
