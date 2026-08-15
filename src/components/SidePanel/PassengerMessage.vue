<template>
  <div
    class="passenger-message-slate"
    :style="{ backgroundColor: message.bgColor }"
  >
    <div class="message-content" v-html="message.message"></div>
    <div v-if="message.subText" class="sub-text" v-html="message.subText"></div>
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
  flex-direction: column;
  justify-content: space-around;
  padding: 1cqw;
  box-sizing: border-box;
  text-align: left;
}

.message-content {
  color: #ffffff;
  font-family: 'ParisineBold', 'Arial', sans-serif;
  font-size: 2.4cqw;
  line-height: 1.35;
}
.sub-text {
  font-family: 'ParisineRegular', 'Arial', sans-serif;
  font-size: 1.8cqw;
  color: #494949;
  line-height: 1.35;
  font-style: italic;
  margin-top: 0.5cqw;
}
</style>