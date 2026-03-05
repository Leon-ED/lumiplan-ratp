<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" :style="style">
    <rect width="100%" height="100%" rx="12" ry="12" :fill="bgColor" />
    <text
      v-if="lineName"
      x="50%"
      y="50%"
      text-anchor="middle"
      dominant-baseline="central"
      :fill="textColor"
      :font-size="getFontSize(lineName.length)"
      font-family="ParisineBold"
    >
      {{ lineName }}
    </text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  lineName: string;
  height: string; // ex: "64px"
  baseFontSize?: string;
  bgColor: string;
  textColor: string;
  style?: string; // pour idfm-style par ex
}

const props = withDefaults(defineProps<Props>(), {
  baseFontSize: "1400",
});

const style = computed(() => ({
  "--height": props.height,
}));

const getFontSize = (length: number): number => {
  const base = 45;
  return base - (length - 1) * 6;
};
</script>

<style scoped>
svg {
  display: block;
  font-family: "ParisineBold";
  height: var(--height);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
}
</style>
