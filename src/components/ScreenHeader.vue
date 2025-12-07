<template>
  <header>
    <img v-if="line" :src="'/modes/' + line.mode.toLowerCase() + '.svg'" class="mode-picto" />
    <LineLogo v-if="line" :line="line" className="picto" size="100%" />
    <div class="direction">
      <span class="direction-name"> {{ direction }}</span>
    </div>
    <div class="clock">00:00</div>
  </header>
</template>
<script setup lang="ts">
import { Line } from "../types";
import LineLogo from "./Other/LineLogo.vue";
defineProps<{
  direction: string;
  line: Line;
}>();
</script>
<style lang="scss" scoped>
.no-data-available header,
.no-data-available header * {
  background-color: rgb(36, 36, 36);
  color: rgb(36, 36, 36) !important;
  font-size: 0 !important;
}

.no-data-available header .picto,
.no-data-available header .mode-picto{
  display: none !important;
}
.clock {
  position: absolute;
  right: 0cqw;
  width: 13%;
  height: 100%;
}
header {
  container-type: inline-size;
  background-color: white;
  display: grid;
  display: flex;
  align-items: center;
  gap: 1.5cqw;
  padding-left: 1cqw;
  font-family: "ParisineBold", sans-serif;
  box-shadow: 0 5px 5px -5px black;
  position: relative;
  z-index: 10;
}
.line-and-mode {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.2em;
  padding-left: 1cqw;
  gap: 0.2em;
}
.picto {
  height: 70%;
}
.mode-picto {
  height: 70%;
  width: auto;
}

.clock {
  color: var(--ratp-yellow);
  font-family: "ParisineRegular";
  background-color: black;
  font-size: 3cqw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.direction {
  display: flex;
  align-items: center;
}
.direction-name {
  color: var(--ratp-blue);
  font-size: 3.5cqw;
}
</style>
