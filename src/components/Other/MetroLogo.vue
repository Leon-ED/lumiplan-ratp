<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    :class="classes"
    :style="style"
  >
    <rect width="100%" height="100%" rx="50" ry="50" :fill="bgColor" />
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

const classes = computed(() => ({
  chars_3: props.lineName.length <= 3,
  chars_4: props.lineName.length === 4,
  more4chars: props.lineName.length > 4,
  "idfm-style": props.style === "IDFM",
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
}
svg.more4chars text {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
}

</style>