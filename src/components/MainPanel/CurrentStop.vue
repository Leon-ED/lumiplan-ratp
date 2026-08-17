<script setup lang="ts">
import { onMounted } from "vue";
import { StopWithTime } from "../../types";
import { cleanText } from "../../utils";
import { AudioManager } from "../../audio";

const { stopWithTime, lineId } = defineProps<{ stopWithTime: StopWithTime, lineId:string }>();
onMounted(() => {
  setTimeout(() => {
    AudioManager.playStopName(lineId, stopWithTime.stop.parentId ?? stopWithTime.stop.id, stopWithTime.isTerminus);
  }, 1_000);
});
</script>
<template>
  <div class="current-stop">
    <div class="current-stop-name">
      {{ cleanText(stopWithTime.stop.name) }}
    </div>
    <div
      class="current-stop-subtitle"
      v-if="stopWithTime.stop.subtitle"
    >
      {{ stopWithTime.stop.subtitle }}
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
  text-wrap:balance;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.current-stop-subtitle{
  font-size: 3cqw;
  padding: .5cqw 1cqw;
  width: 100%;
  margin-top: auto;
  text-align: center;
  border-top: .3cqw solid white;
  font-style: italic;
}
</style>