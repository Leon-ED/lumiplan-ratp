<template>
  <header>
    <div class="line-and-mode">
      <BusPicto class="picto" />
      <img src="../assets/303.png" alt="303" class="picto smaller" />
    </div>
    <div class="direction">
      <span class="direction-name"> {{direction}}</span>
    </div>
    <div class="clock">00:00</div>
  </header>
</template>
<script setup lang="ts">
import BusPicto from "./BusPicto.vue";
const props = defineProps<{
  direction: string;
}>();
</script>
<style lang="scss" scoped>
.no-data-available header {
  * {
    background-color: rgb(36, 36, 36);
    color: rgb(36, 36, 36) !important;
    font-size: 0px !important;
  }
  .picto {
    display: none !important;
  }
}
header {
  container-type: inline-size;
  background-color: white;
  display: grid;
  grid-template-columns: 12% 75% 13%;
  grid-template-rows: 100%;
  font-family: "ParisineBold", sans-serif;
  box-shadow: 0 5px 5px -5px black;
  position: relative;
  z-index: 1;
}
.line-and-mode {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.2em;
  padding-left: 1cqw;
  gap: 0.5em;
}
.line-and-mode .picto {
  height: 70%;
  width: fit-content;
}
.line-and-mode .smaller {
  height: 60%;
  width: fit-content;
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
