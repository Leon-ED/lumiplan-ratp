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
      /><br />
      <Transition name="message-text" mode="out-in">
        <span
          v-if="currentInfo"
          :key="currentInfo.id ?? currentIndex"
          class="message-text"
        >
          {{ currentInfo.title }} <br />
          <template v-if="currentInfo.cause !== 'Cause inconnue'">
            {{ currentInfo.cause }}
          </template>
        </span>
      </Transition>

      <div v-if="limitedInfos.length > 1" class="dots-container">
        <span
          v-for="(_, index) in limitedInfos"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="setCurrentIndex(index)"
        ></span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onUnmounted, watch } from "vue";
import { useMessagesIndex } from "../../composables/useMessagesIndex";
import { InfoTraffic } from "../../types";

const props = defineProps<{
  infosTraffic: InfoTraffic[];
  withArrow?: boolean;
}>();

const { currentIndex } = useMessagesIndex();

const limitedInfos = computed(() => {
  return props.infosTraffic.slice(0, 5);
});

const currentInfo = computed(() => {
  if (!limitedInfos.value.length) {
    return null;
  }

  return limitedInfos.value[
    Math.min(currentIndex.value, limitedInfos.value.length - 1)
  ];
});
let intervalId: ReturnType<typeof setInterval> | null = null;

const stopAutoPlay = () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const startAutoPlay = () => {
  stopAutoPlay();

  if (limitedInfos.value.length <= 1) {
    return;
  }

  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % limitedInfos.value.length;
  }, 3_500);
};

const setCurrentIndex = (index: number) => {
  currentIndex.value = index;
  startAutoPlay();
};
watch(
  () => props.infosTraffic,
  () => {
    const length = limitedInfos.value.length;

    if (length === 0) {
      currentIndex.value = 0;
      stopAutoPlay();
      return;
    }

    if (currentIndex.value >= length) {
      currentIndex.value = 0;
    }

    startAutoPlay();
  },
  {
    deep: true,
    immediate: true,
  },
);
onUnmounted(() => {
  stopAutoPlay();
});
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
  padding-right: 6cqw;
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
  flex-shrink: 0;
}

.message-text {
  display: block;
  font-size: 2.4cqw;
  font-family: "ParisineBold";
  color: #212121;
}

.message-text-enter-active,
.message-text-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.message-text-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.message-text-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
.dots-container {
  position: absolute;
  right: 0.8cqw;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5cqw;
  z-index: 5;
}

.dot {
  width: 1cqw;
  height: 1cqw;
  border-radius: 50%;
  background-color: #d1c8c1;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.dot.active {
  background-color: #212121;
}

.triangle-icon {
  position: absolute;
  top: 5.2cqw;
  left: -6.5%;
  height: 5cqw;
  width: auto;
  opacity: 0;
  transform: translateX(100%);
  z-index: 1;
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
