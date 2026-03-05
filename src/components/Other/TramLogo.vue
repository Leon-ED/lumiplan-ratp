<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" :style="style">
    <rect width="30" height="30" rx="3"  fill="none" />

    <path
      d="M28.5 0H1.5C1.102 0 0.720995 0.158001 0.438995 0.439301C0.157995 0.720601 0 1.1022 0 1.5V3C0 3.3978 0.157995 3.7794 0.438995 4.0607C0.720995 4.342 1.102 4.5 1.5 4.5H28.5C28.898 4.5 29.279 4.342 29.561 4.0607C29.842 3.7794 30 3.3978 30 3V1.5C30 1.1022 29.842 0.720601 29.561 0.439301C29.279 0.158001 28.898 0 28.5 0ZM30.001 28.5V27C30.001 26.6022 29.843 26.2206 29.562 25.9393C29.281 25.658 28.899 25.5 28.501 25.5H1.5C1.102 25.5 0.720995 25.658 0.438995 25.9393C0.157995 26.2206 0 26.6022 0 27V28.5C0 28.8978 0.157995 29.2794 0.438995 29.5607C0.720995 29.842 1.102 30 1.5 30H28.5C28.898 30 29.279 29.842 29.561 29.5607C29.842 29.2794 30 28.8978 30 28.5H30.001Z"
      :fill="bgColor"
    />

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
  lineName: string; // ex: "T2", "T3a"
  height: string;   // ex: "64px"
  bgColor?: string;
  bandColor?: string; // La couleur des bandes (ex: #C04191 pour le T2)
  textColor?: string;
  style?: string;
}

const props = withDefaults(defineProps<Props>(), {
  bgColor: "#FFFFFF",
  bandColor: "#C04191", // Rose T2 par défaut
  textColor: "#25303B", // Bleu/Noir par défaut pour le texte
});

const style = computed(() => ({
  "--height": props.height,
}));

// Ajusté pour un viewBox de 30x30
const getFontSize = (length: number): number => {
  const base = 20; 
  // Réduit la taille de la police si le texte est plus long (ex: T3a, T11)
  return base - (length - 1) * 3.5;
};
</script>

<style scoped>
svg {
  display: block;
  font-family: "ParisineBold", sans-serif;
  height: var(--height);
  width: var(--height); /* Assure que le SVG reste carré */
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
}
</style>