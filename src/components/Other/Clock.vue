<template>
  <div>
    <span class="hours">{{ time.split(':')[0] }}</span>
    <span class="divider">:</span>
    <span class="minutes">{{ time.split(':')[1] }}</span>
  </div>
</template>
<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
const time = ref(
  new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date()),
)

const timerId = setInterval(() => {
  time.value = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date())
}, 1_000)
onUnmounted(() => {
  clearInterval(timerId)
})
</script>
<style scoped lang="css">
.divider {
  animation: blink 1s step-start infinite;
}
@keyframes blink {
  0%{
    opacity: 1;
  }
  50% {
    opacity: .3;
  }
  100%{
    opacity: 1;
  }
}
</style>
