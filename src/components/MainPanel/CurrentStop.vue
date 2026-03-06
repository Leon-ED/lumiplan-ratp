<script setup lang="ts">
import { onMounted } from "vue";
import { StopWithTime } from "../../types";
import { cleanText } from "../../utils";
import { AudioManager } from "../../audio";

const { stopWithTime, lineId } = defineProps<{ stopWithTime: StopWithTime, lineId:string }>();
onMounted(() => {
  setTimeout(() => {
    AudioManager.playStop(lineId, stopWithTime.stop.parentId ?? stopWithTime.stop.id);
  }, 1_000);
});
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