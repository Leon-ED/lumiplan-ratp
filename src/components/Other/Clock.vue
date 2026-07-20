<template>
  <div>
    <span class="hours">{{ time.split(':')[0] }}</span>
    <span class="divider">:</span>
    <span class="minutes">{{ time.split(':')[1] }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useClock } from "../../composables/useClock";

const { now } = useClock();

const time = computed(() =>
  new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(now.value)
);
</script>

<style scoped>
.divider {
  animation: blink 1s step-start infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: .3;
  }
  100% {
    opacity: 1;
  }
}
</style>