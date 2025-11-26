<template>
  <svg
    width="2704"
    height="1939"
    viewBox="0 0 2704 1939"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="style"
    :class="classes"
  >
    <g clip-path="url(#clip0_28_16)">
      <rect width="2704" height="1939" :fill="bgColor" />
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
    return 1800;
  }
  if (length <= 3){
    return 1300;
  }
  if (length === 4) {
    return 1150;
  }
    if (length === 5) {
    return 750;
  }
  return 700;
};

const wrappedLines = computed(() => {
  const MAX_LINE_LENGTH = 7

  // 1. On commence par séparer la ligne sur les espaces, 
  //    pour traiter chaque "mot" indépendamment.
  const rawParts = props.lineName.split(' ')

  // 2. Pour chaque "mot", on va découper sur "BUS"
  //    en veillant à inclure "BUS" à la fin de la sous-chaîne.
  const segmentsAfterBusSplit: string[] = []
  rawParts.forEach((part) => {
    let cursor = 0
    const token = 'BUS'
    let idxBus: number

    // Tant qu'on trouve "BUS" dans le mot à partir de la position "cursor"
    while ((idxBus = part.indexOf(token, cursor)) !== -1) {
      // On prend tout depuis cursor jusque juste après "BUS"
      segmentsAfterBusSplit.push(part.slice(cursor, idxBus + token.length))
      // On décale cursor après "BUS"
      cursor = idxBus + token.length
    }

    // Si, après la dernière occurrence de "BUS", il reste des caractères,
    // on les pousse aussi comme segment à découper plus loin.
    if (cursor < part.length) {
      segmentsAfterBusSplit.push(part.slice(cursor))
    }
  })

  // 3. Maintenant, chaque segment ne contient ni espace, ni "BUS" à l’intérieur 
  //    (seulement éventuellement en fin de segment). Il faut découper ces segments 
  //    si leur longueur dépasse MAX_LINE_LENGTH (= 7).
  const finalLines: string[] = []
  segmentsAfterBusSplit.forEach((seg) => {
    if (seg.length <= MAX_LINE_LENGTH) {
      finalLines.push(seg)
    } else {
      // On découpe en tranches de 7 caractères
      for (let i = 0; i < seg.length; i += MAX_LINE_LENGTH) {
        finalLines.push(seg.slice(i, i + MAX_LINE_LENGTH))
      }
    }
  })

  return finalLines
})
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
