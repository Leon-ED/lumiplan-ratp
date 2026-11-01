<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" :style="style">
    <rect
      width="33"
      height="33"
      rx="3"
      ry="3"
      fill="white"
      v-if="!props.transparent"
    />

    <g transform="translate(1.5, 1.5)">
      <path
        d="M28.5 0H1.5C1.102 0 0.720995 0.158001 0.438995 0.439301C0.157995 0.720601 0 1.1022 0 1.5V3C0 3.3978 0.157995 3.7794 0.438995 4.0607C0.720995 4.342 1.102 4.5 1.5 4.5H28.5C28.898 4.5 29.279 4.342 29.561 4.0607C29.842 3.7794 30 3.3978 30 3V1.5C30 1.1022 29.842 0.720601 29.561 0.439301C29.279 0.158001 28.898 0 28.5 0ZM30.001 28.5V27C30.001 26.6022 29.843 26.2206 29.562 25.939C29.281 25.658 28.899 25.5 28.501 25.5H1.5C1.102 25.5 0.720995 25.658 0.438995 25.939C0.157995 26.2206 0 26.6022 0 27V28.5C0 28.8978 0.157995 29.2794 0.438995 29.5607C0.720995 29.842 1.102 30 1.5 30H28.5C28.898 30 29.279 29.842 29.561 29.5607C29.842 29.2794 30 28.8978 30 28.5H30.001Z"
        :fill="bgColor"
      />
    </g>

    <text
      v-if="lineName"
      x="50%"
      y="50%"
      text-anchor="middle"
      dominant-baseline="central"
      :fill="transparent ? textColor : '#25303b'"
      :font-size="fontSize"
      font-family="ParisineBold"
    >
      <!-- Cas 1 : Lettre(s) + Chiffre(s) + 1 Lettre (en exposant et taille 50%) -->
      <template v-if="parsedLine.type === 'with-suffix'">
        <tspan letter-spacing="1.7">{{ parsedLine.prefix }}</tspan>
        <tspan>{{ parsedLine.digits }}</tspan>
        <tspan :font-size="fontSize * 0.75" dy="-0.1em">{{ parsedLine.suffix }}</tspan>
      </template>

      <!-- Cas 2 : Lettre(s) + Chiffre(s) -->
      <template v-else-if="parsedLine.type === 'prefix-digits'">
        <tspan letter-spacing="1.7">{{ parsedLine.prefix }}</tspan>
        <tspan>{{ parsedLine.digits }}</tspan>
      </template>

      <!-- Cas 3 : Basique -->
      <template v-else>
        {{ lineName }}
      </template>
    </text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  lineName: string;
  height: string;
  bgColor?: string;
  bandColor?: string;
  transparent?: boolean;
  textColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  bgColor: "#FFFFFF",
  bandColor: "#C04191",
  textColor: "#25303B",
});

const style = computed(() => ({
  "--height": props.height,
}));

const fontSize = computed(() => {
  const base = 16.5;
  return base - Math.min(0, props.lineName.length - 1) * 3.5;
});

const parsedLine = computed(() => {
  const val = props.lineName.trim();
  const suffixMatch = val.match(/^([A-Za-zÀ-ÿ]+)(\d+)([A-Za-zÀ-ÿ])$/);
  if (suffixMatch) {
    return {
      type: "with-suffix" as const,
      prefix: suffixMatch[1],
      digits: suffixMatch[2],
      suffix: suffixMatch[3],
    };
  }
  const digitsMatch = val.match(/^([A-Za-zÀ-ÿ]+)(\d+)$/);
  if (digitsMatch) {
    return {
      type: "prefix-digits" as const,
      prefix: digitsMatch[1],
      digits: digitsMatch[2],
    };
  }

  return { type: "plain" as const };
});
</script>

<style scoped>
svg {
  display: block;
  font-family: "ParisineBold", sans-serif;
  height: var(--height);
  width: var(--height);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
}
</style>