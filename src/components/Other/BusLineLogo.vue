<template>
  <svg
    width="3016"
    height="1939"
    viewBox="0 0 3016 1939"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="style"
    :class="classes"
  >
    <g clip-path="url(#clip0_28_16)">
      <rect width="3016" height="1939" :fill="bgColor" />
      <text
        x="50%"
        :y="wrappedLines.length > 1 ? '30%' : '50%'"
        text-anchor="middle"
        :fill="textColor"
        :letter-spacing="-40"
        :font-size="getFontSize(props.lineName.length)"
      >
        <tspan
          v-for="(line, i) in wrappedLines"
          :key="i"
          x="50%"
          :dy="i === 0 ? '.35em' : '1em'"
          font-size="inherit"
        >
          {{ line }}
        </tspan>
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  lineName: string;
  height: string;
  baseFontSize?: string;
  bgColor: string;
  textColor: string;
  style?: string;
}

const props = withDefaults(defineProps<Props>(), {
  baseFontSize: "1400",
  style: "RATP",
});

const style = computed(() => ({
  "--height": props.height,
  "font-size": "1400",
}));

const classes = computed(() => ({
  chars_3: props.lineName.length <= 3,
  chars_4: props.lineName.length === 4,
  more4chars: props.lineName.length > 4,
  "idfm-style": props.style === "IDFM",
}));

const getFontSize = (length: number): number => {
  if (length <= 2) {
    return 2000;
  }
  if (length <= 3) {
    return 1500;
  }
  if (length === 4) {
    return 1200;
  }
  if (length === 5) {
    return 1000;
  }
  return 800;
};

const wrappedLines = computed(() => {
  const MAX_LINE_LENGTH = 7;
  const rawParts = props.lineName.split(" ");

  const segmentsAfterBusSplit: string[] = [];
  rawParts.forEach((part) => {
    let cursor = 0;
    const token = "BUS";
    let idxBus: number;

    while ((idxBus = part.indexOf(token, cursor)) !== -1) {
      segmentsAfterBusSplit.push(part.slice(cursor, idxBus + token.length));
      cursor = idxBus + token.length;
    }

    if (cursor < part.length) {
      segmentsAfterBusSplit.push(part.slice(cursor));
    }
  });

  const finalLines: string[] = [];
  segmentsAfterBusSplit.forEach((seg) => {
    if (seg.length <= MAX_LINE_LENGTH) {
      finalLines.push(seg);
    } else {
      for (let i = 0; i < seg.length; i += MAX_LINE_LENGTH) {
        finalLines.push(seg.slice(i, i + MAX_LINE_LENGTH));
      }
    }
  });

  return finalLines;
});
</script>

<style scoped>
svg {
  display: block;
  height: var(--height);
  width: auto;
  font-family: "ParisineBold";
}
svg.more4chars text {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
}
svg.idfm-style {
  font-family: "IDFMMedium" !important;
  border-radius: 10% !important;
}
</style>
