<script setup lang="ts">
import { StopWithTime } from "../../types";
import { cleanText } from "../../utils";

const { stopWithTime } = defineProps<{ stopWithTime: StopWithTime }>();
</script>
<template>
  <div class="current-stop">
    <div class="current-stop-name">
      {{ cleanText(stopWithTime.stop.name) }}
    </div>
    <div
      class="current-stop-landmark-name"
      v-if="stopWithTime.stop.landmarkName"
    >
      {{ stopWithTime.stop.landmarkName }}
    </div>
  </div>
</template>

<style lang="css" scoped>
.current-stop {
  height: 100%;
  width: 100%;
  background-color: var(--ratp-blue) !important;
  font-family: "ParisineBold", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  container-type: inline-size;
}

.current-stop-name {
  font-size: 9cqw;
  text-align: center;
}
.current-stop-landmark-name {
  font-size: 2.5cqw;
  padding: 1cqw;
  background-color: var(--ratp-brown);
}
</style>