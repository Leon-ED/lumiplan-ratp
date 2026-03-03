<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Props {
  width?: number | string | null;
  height?: number | string | null;
  ratio?: number | string | null;
}

const props = withDefaults(defineProps<Props>(), {
  width: null,
  height: null,
  ratio: null,
});

const wrapperRef = ref<HTMLElement | null>(null);
const parentRatio = ref<number>(0);
let observer: ResizeObserver | null = null;

const targetRatioNumber = computed<number | null>(() => {
  if (props.ratio === 0) return null;

  if (props.ratio !== null && props.ratio !== undefined) {
    if (typeof props.ratio === "string") {
      if (props.ratio.includes("/")) {
        const [w, h] = props.ratio.split("/").map(Number);
        if (!w || !h) return 16 / 9;
        return w / h;
      }
      const parsed = Number(props.ratio);
      return isNaN(parsed) ? 16 / 9 : parsed;
    }
    return props.ratio;
  }

  if (props.width && props.height) {
    return Number(props.width) / Number(props.height);
  }

  return 16 / 9;
});

const targetRatio = computed<string | undefined>(() => {
  if (targetRatioNumber.value === null) return undefined;
  return targetRatioNumber.value.toString();
});
const isConstrainedByWidth = computed<boolean>(() => {
  if (targetRatioNumber.value === null) return false;
  return parentRatio.value < targetRatioNumber.value;
});

onMounted(() => {
  if (!wrapperRef.value) return;

  observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;

    const { width, height } = entry.contentRect;
    if (height > 0) {
      parentRatio.value = width / height;
    }
  });

  observer.observe(wrapperRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div ref="wrapperRef" class="fit-wrapper">
    <div
      class="fit-content"
      :style="targetRatio ? { aspectRatio: targetRatio } : {}"
      :class="{
        'force-width': targetRatioNumber !== null && isConstrainedByWidth,
        'force-height': targetRatioNumber !== null && !isConstrainedByWidth,
        'full-size': targetRatioNumber === null
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.fit-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.fit-content {
  display: flex;
  flex-direction: column;
  transition: width 0.15s ease, height 0.15s ease;
}

.force-width {
  width: 100%;
  height: auto;
}

.force-height {
  width: auto;
  height: 100%;
}

.full-size {
  width: 100%;
  height: 100%;
}
</style>