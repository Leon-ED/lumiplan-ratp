<template>
  <aside class="arriving-to-in">
    <div class="header">
      <div class="text">Arrivée prévue dans</div>
      <div class="unit">min</div>
    </div>
    <ol class="stops-list">
      <li
        v-for="desserte in stopsList.slice(stopsList.length - 1, 999)"
        class="desserte"
      >
        <span class="stop-name">{{ desserte.stop.name }}</span>
        <span class="minutes-before-arrival">{{
          getMinutesFromDate(desserte.timeOfArrival)
        }}</span>
      </li>
    </ol>
  </aside>
</template>
<script setup lang="ts">
import { StopWithTime } from "../../types";
import { getMinutesFromDate } from "../../utils";

interface Props {
  stopsList: StopWithTime[];
}
defineProps<Props>();
</script>
<style lang="css" scoped>
.arriving-to-in {
  display: flex;
  flex-direction: column;
  background-color: #f4efea;
  font-family: "ParisineBold";
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .5cqw 2.4cqw 0 2cqw;
  font-size: 1.3cqw;
  font-family: "ParisineRegular";
  color: #212121;
}
.stops-list {
  list-style: none;
}
.desserte {
  display: grid;
  grid-template-columns: 90% 30%;
  font-size: 1.5cqw;
  align-items: center;
  justify-content: space-between;
}
.minutes-before-arrival {
  color: black;
  font-size: 3cqw;
}
.stop-name {
  color: var(--ratp-blue);
}
ol {
  padding: 0;
}
li {
  padding: 1cqw 2cqw;
}
li:nth-child(odd) {
  background-color: #dedad6;
}
</style>
