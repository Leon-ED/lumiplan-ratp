<template>
  <div
    class="passenger-message-slate"
    :style="{ backgroundColor: message.bgColor }"
  >
    <div class="message-content" v-html="message.message"></div>
  </div>
</template>

<script setup lang="ts">
import { PassengerMessage } from '../../types';


defineProps<{
  message: PassengerMessage;
}>();
</script>

<style scoped>
.passenger-message-slate {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 1cqw;
  box-sizing: border-box;
  text-align: left;
  color: #ffffff;
}

.message-content {
  font-family: 'ParisineBold', 'Arial', sans-serif;
  font-size: 2.4cqw;
  line-height: 1.35;
}
</style>