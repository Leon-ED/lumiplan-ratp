<template>
  <div class="screen" :class="{ 'no-data-available': noData }">
    <ScreenHeader />
    <!-- <CurrentStop :stop="stops[0]"/> -->
    <main>
      <StopList v-if="!noData" :stops="desserte.stops" primary-color="#6E6E00" />
      <DataUnavailable v-else />
      <!-- <ArrivingToIn :stops-list="desserte" /> -->
       <!-- <NextDepartures /> -->
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import ScreenHeader from "./ScreenHeader.vue";
import ArrivingToIn from "./SidePanel/ArrivingToIn.vue";
import StopList from "./MainPanel/StopList.vue";
import NextDepartures from "./SidePanel/NextDepartures.vue";
import DataUnavailable from "./MainPanel/DataUnavailable.vue";
import json from "../mock/treated303.json";
//@ts-expect-error
const desserte = ref<Desserte>(json as Desserte);
const noData = computed(() => desserte.value.stops.length === 0);

addEventListener('keydown', (event) => {
if(event.key === "ArrowRight"){
    desserte.value.stops.shift();
}
});


</script>
<style lang="css" scoped>
.screen {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: 25% 75%;
  font-size: 3cqmin;
  container-type: inline-size;

}
main {
  display: grid;
  /* grid-template-columns: 65% 35%; */
}
</style>
