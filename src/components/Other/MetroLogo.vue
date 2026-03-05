<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    :style="style"
  >
    <rect width="100%" height="100%" rx="50" ry="50" :fill="bgColor" />
    <text
      v-if="lineName"
      x="50%"
      y="50%"
      text-anchor="middle"
      dominant-baseline="central"
      :letter-spacing="letterSpacing"
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
  height: string; 
  bgColor: string;
  textColor: string;
}

const props = defineProps<Props>();

const style = computed(() => ({
  "--height": props.height,
}));

const getFontSize = (length: number): number => {
  const base = 52;
  return base - (length - 1) * 6;
};
const letterSpacing = computed(() => {
  if (props.lineName && props.lineName.length > 1) {
    return -2;
  }
  return 0;
});
</script>

<style scoped>
svg {
  display: block;
  font-family: "ParisineBold";
  height: var(--height);
}
</style>
