<template>
  <div class="messages-container">
    <img
      v-if="withArrow"
      src="../../assets/img/left-triangle.png"
      alt="lines connection icon"
      class="triangle-icon"
    />

    <div class="message">
      <img
        src="../../assets/img/info.png"
        alt="messages icon"
        class="message-icon"
      />
      <br />
      <span class="message-text" v-if="infosTraffic[0].cause !== 'Cause inconnue'"
        >{{ infosTraffic[0].title }} <br />{{ infosTraffic[0].cause }}</span
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { InfoTraffic } from "../../types";

defineProps<{
  infosTraffic: InfoTraffic[];
  withArrow?: boolean;
}>();
</script>
<style lang="css" scoped>
.messages-container {
  position: relative;
  padding: 0;
  height: 100%;

  overflow: visible;
}

.message {
  position: relative;
  background-color: #f4eeea;
  padding: 2cqw;
  width: 100%;
  height: 100%;
  z-index: 4;
  box-sizing: border-box;
}
.message-icon {
  width: 4cqw;
  height: 4cqw;
  margin-right: 1cqw;
  margin-bottom: 1cqw;
}
.message-text {
  font-size: 2.4cqw;
  font-family: "ParisineBold";
  color: #212121;
}
.triangle-icon {
  position: absolute;
  top: 5.2cqw;
  left: -6.5%;
  height: 5cqw;
  width: auto;
  opacity: 0;
  transform: translateX(100%);
  z-index: 1; /* triangle derrière */
  animation: slide-from-behind 0.2s ease-out 1.17s forwards;
}

@keyframes slide-from-behind {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  1% {
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
