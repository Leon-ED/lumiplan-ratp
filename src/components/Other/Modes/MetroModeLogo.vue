<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :style="style"
    viewBox="0 0 283.46 283.46"
  >
    <circle
      cx="141.73"
      cy="141.73"
      r="132.515"
      fill="none"
      :stroke="color"
      :stroke-width="strokeWidth"
    />
    <path
      :fill="color"
      d="M212.25,205.15V81.5c0-7.09-3.9-14.53-15.6-14.53-8.85,0-12.4,3.9-16.29,11.69l-38.27,79.73h-.35L103.11,78.66C99.21,70.87,95.67,67,86.81,67,75.12,67,71.22,74.41,71.22,81.5V205.15c0,6.74,5.32,10.64,11.7,10.64,5.66,0,12-3.9,12-10.64V113h.36L130.4,184.6c2.47,5,5.67,7.8,11.34,7.8s8.85-2.84,11.33-7.8L188.15,113h.36v92.12c0,6.74,6.37,10.64,12.05,10.64,6.37,0,11.69-3.9,11.69-10.64"
    />
  </svg>
</template>
<script setup lang="ts">
import { computed } from "vue";

interface Props {
  color: string;
  height: string;
  strokeWidth: string;
}

const props = defineProps<Props>();

const width = computed(() => props.height);

const style = computed(() => ({
  display: "block",
  width: "auto",
  height: props.height,
  flex: "0 0 auto",
}));
</script>
