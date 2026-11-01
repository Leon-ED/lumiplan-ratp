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
      :font-size="fontSize"
      font-family="ParisineBold"
    >
      <!-- Cas : Chiffre(s) + Lettre(s) -->
      <template v-if="parsedLine.type === 'digits-letters'">
        <tspan>{{ parsedLine.digits }}</tspan>
        <tspan :font-size="fontSize * 0.35" letter-spacing=".4" dx="1.5" dy="-0.1em">{{ parsedLine.letters }}</tspan>
      </template>

      <!-- Cas standard -->
      <template v-else>
        {{ parsedLine.text }}
      </template>
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

const parsedLine = computed(() => {
  const val = props.lineName?.trim() || "";

  // Détecte Chiffre(s) suivi de soit "\B", soit de lettre(s) alphabétiques
  const match = val.match(/^(\d+)(\\B|[A-Za-zÀ-ÿ]+)$/);
  if (match) {
    const digits = match[1];
    let letters = match[2];

    if (letters === "\\B") {
      letters = "B";
    } else if (letters === "B") {
      letters = "bis";
    }

    return {
      type: "digits-letters" as const,
      digits,
      letters,
    };
  }

  return {
    type: "plain" as const,
    text: val,
  };
});

const fontSize = computed(() => {
  if (!props.lineName) return getFontSize(0);

  if (parsedLine.value.type === "digits-letters") {
    const lettersCount = parsedLine.value.letters.length;
    const digitsCount = parsedLine.value.digits.length;
    const baseDigitSize = getFontSize(digitsCount);

    // Si 2 chiffres ou plus : réduction plus agressive par lettre (ex: 3px au lieu de 1.5px)
    // + un petit malus d'encombrement initial (3px) pour éviter le débordement horizontal
    const letterWeight = digitsCount >= 2 ? 3 : 1.5;
    const multiDigitBonusReduction = digitsCount >= 2 ? 3 : 0;

    const smallLettersCount = Math.min(lettersCount, 4);
    const softReduction = (smallLettersCount * letterWeight) + multiDigitBonusReduction;

    // Au-delà de 4 lettres, pénalité normale de 6px par lettre
    const extraOverFour = Math.max(0, lettersCount - 4);
    const hardReduction = extraOverFour * 6;

    return baseDigitSize - softReduction - hardReduction;
  }

  return getFontSize(props.lineName.length);
});

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