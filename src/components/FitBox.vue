<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Props {
  // Option 1 : Dimensions en pixels (servent à calculer le ratio)
  width?: number | string | null;
  height?: number | string | null;
  // Option 2 : Ratio direct (ex: 16/9 ou 1.77)
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

// 1. Calcul du ratio cible basé sur les props
const targetRatio = computed((): string => {
  if (props.ratio) {
    if (typeof props.ratio === 'string') {
      // Gérer le format "21/7"
      if (props.ratio.includes('/')) {
        const [width, height] = props.ratio.split('/').map(Number);
        return `${width} / ${height}`;
      }
      return props.ratio;
    }
    return props.ratio.toString();
  }
  if (props.width && props.height) {
    const ratio = Number(props.width) / Number(props.height);
    return ratio.toString();
  }
  return '16 / 9'; // Valeur par défaut
});

const targetRatioNumber = computed((): number => {
  if (props.ratio) {
    if (typeof props.ratio === 'string') {
      if (props.ratio.includes('/')) {
        const [width, height] = props.ratio.split('/').map(Number);
        if(!width || !height) return 16/9;
        return width / height;
      }
      return Number(props.ratio);
    }
    return props.ratio;
  }
  if (props.width && props.height) {
    return Number(props.width) / Number(props.height);
  }
  return 16 / 9;
});

// 2. Logique de contrainte (Largeur vs Hauteur)
// Si le parent est plus "étroit" que la cible => On est limité par la largeur (width: 100%)
// Si le parent est plus "plat" que la cible => On est limité par la hauteur (height: 100%)
const isConstrainedByWidth = computed((): boolean => {
  return parentRatio.value < targetRatioNumber.value;
});

onMounted(() => {
  if (!wrapperRef.value) return;

  // On observe la taille du conteneur parent
  observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (entry) {
      const { width, height } = entry.contentRect;
      if (height > 0) {
        parentRatio.value = width / height;
      }
    }
  });

  observer.observe(wrapperRef.value);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<template>
  <div ref="wrapperRef" class="fit-wrapper">
    <div
      class="fit-content"
      :style="{ aspectRatio: targetRatio }"
      :class="{
        'force-width': isConstrainedByWidth,
        'force-height': !isConstrainedByWidth,
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Le wrapper s'assure de prendre tout l'espace et de centrer le contenu */
.fit-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  container-type: size;
}

/* La boite qui contient votre slot */
.fit-content {
  display: flex;
  flex-direction: column;
  /* Transition fluide si la fenêtre change de taille */
  transition: width 0.1s, height 0.1s;
}

/* Les deux états possibles */
.force-width {
  width: 100%;
  height: auto;
}

.force-height {
  width: auto;
  height: 100%;
}
</style>
