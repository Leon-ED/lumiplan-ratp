<script setup lang="ts">
import { computed } from "vue";
import BusLineLogo from "./BusLineLogo.vue";
import NoctilienLogo from "./NoctilienLogo.vue";
import { Line, Mode } from "../../types";

interface Props {
  line: Line;
  className: string;
  size?: string;
  fontSize?: string;
  logoStyle?: string;
}

const props = defineProps<Props>();
const logoShape = computed(() =>
  'none'
);
const style = computed(() => {
  return {
    "--bg-color": props.line.color,
    "--text-color": props.line.textColor,
    "--size": props.size,
  };
});
const isLineSpecial = computed(() => {
  const specialModes = [Mode.TRAM, Mode.RER, Mode.METRO,Mode.CABLE,Mode.TRANSILIEN];
     const specialNames = [
      "AUDONIE",
      "TUVIM",
      "TILLBUS",
      "ORLYBUS",
      "FUN",
      "ORLYVAL",
      "TVM",
      "ROISSYBUS",
      "CHARONNE",
      "AMIBUS",
      "MONTBUS",
      "RIVER",
      "PORT",
      "EOLIEN",
      "AS",
      "LBLEUE",
      "THIAIS",
      "CHOISYBUS",
      "BIEVRES",
    ];
  return specialModes.includes(props.line.mode) || specialNames.includes(props.line.name.toLocaleUpperCase().replace(/\s/g, ''));


});


</script>
<template>
  <!-- Logo Tram -->
  <img
    v-if="isLineSpecial"
    :src="'/lines/'+props.line.name.toLowerCase()+'.svg'"
    :class="'line-logo' + ' specialLogo ' + props.className + ' '"
    :style="style"
  />
  <!-- Logo Noctilien -->
  <div
    v-else-if="[Mode.BUS].includes(props.line.mode)"
    :class="props.className"
  >
    <BusLineLogo
      :lineName="props.line.name"
      :height="props.size ? props.size : '100%'"
      :bgColor="props.line.color"
      :base-font-size="fontSize"
      :textColor="props.line.textColor"
      :style="props.logoStyle"
    />
  </div>
  <div
    :class="'line-logo' + ' ' + props.className + ' ' + logoShape"
    v-else-if="props.line.mode === Mode.NOCTILIEN"
  >
  <NoctilienLogo
    :lineName="props.line.name"
    :height="props.size ? props.size : '100%'"
    :bgColor="props.line.color"
    :textColor="props.line.textColor" />
</div>
  <!-- Logo Normal -->
  <div
    :class="'line-logo' + ' ' + props.className + ' ' + logoShape"
    :style="style"
    v-else
  >
    {{ props.line.name }}
  </div>
</template>
<style scoped>
.line-logo {
  font-family: "ParisineBold";
  box-sizing: border-box;
  display: flex;
  height: var(--size);
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);
  color: var(--text-color);

  margin: 0;
  padding: 0 !important;
}
.tram {
  padding: 0 !important;
  box-sizing: border-box;
  background-color: white;
  color: black;
  display: grid;

  flex-direction: column;
}
.tram .bar {
  background-color: var(--bg-color);
  border-radius: min(0.7vw, 5px) !important;
  height: min(0.5vw, 4px);
  width: 100%;
  border-radius: 2%;
}
.tram .line-number {
  padding: 0 min(0.2vw, 10px);
}

.night-bus {
  position: relative;
  box-sizing: border-box;
  color: white;
  padding: min(0.2vw, 10px);
}

.circle {
  aspect-ratio: 1;
  border-radius: 50%;
}

.square {
  border-radius: 15%;
  aspect-ratio: 1;
}

.rectangle {
  height: var(--size);
  min-width: calc(var(--size) * 1.4) !important;
  max-width: fit-content !important;
}
.specialLogo {
  background-color: unset !important;
}
</style>
