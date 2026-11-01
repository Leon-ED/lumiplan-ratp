<script setup lang="ts">
import { computed } from "vue";
import BusLineLogo from "./BusLineLogo.vue";
import NoctilienLogo from "./NoctilienLogo.vue";
import { Line, Mode } from "../../types";
import { cleanId } from "../../utils";
import TrainLogo from "./TrainLogo.vue";
import MetroLogo from "./MetroLogo.vue";
import TramLogo from "./TramLogo.vue";
import BusRemplacementLineLogo from "./BusRemplacementLineLogo.vue";
const SPECIAL_NAMES = new Set([
    "AUDONIE",
    "TUVIM",
    "TILLBUS",
    "TUC",
    "ORLYBUS",
    "FUN",
    "ORLYVAL",
    "TVM",
    "ROISSYBUS",
    "CHARONNE",
    // "AMIBUS",
    "MONTBUS",
    "RIVER",
    "PORT",
    "EOLIEN",
    "AS",
    "THIAIS",
    "CHOISYBUS",
    "BIEVRES",
  ]);
const SPECIAL_IDS = new Set([
    "LUMIPLAN",
    "WAGON",
    "C01366", // Amibus
    "C01342", // TUB
    "C01330", // Bievres : La Traverse Bièvres–Montsouris
    "AUTOBUS_SURESNOIS", // AS : Autobus Suresnois
    "IDFM", // IDFM : Île-de-France Mobilités
    "C01757", // Traverse : La Traverse Brancion-Commerce
    "C01332", // Batigno : La Traverse Batignolles-Bichat
    "C01333", // Ney-Fla : La Traverse Ney–Flandre
    "C01333", // Ney-Fla  // La Traverse Ney - Flandre
    "C01757", // Traverse // La Traverse Brancion-Commerce
    "LIGNE_BLEUE", // LBLEUE : Ligne Bleue
    "C00563", // CDG VAL
    // "C01386", // Métro 3b
    // "C01387", // Métro 7b
    "C01840", // Remplacmeent Transilien U
    "C01841", // Remplacement Transilien P
    "C01842", // Remplacement Transilien H
    "C01844", // Remplacement Transilien K
    "C02534", // Remplacement Métro 13
    "C01357", // ClamiBus
    "C02268", // Remplacement Métro 6
    "C02442", // Remplacement RER A
    "C02471", // Remplacement Métro 12
    "C01683", // Remplacement Tram T4
    "C02406", // Remplacement Tram T3a
    "C02590", // Remplacement Métro 7B
    "C02469", // Remplacement Tram T13
    "C01845", // Remplacement Transilien N
    "C01846", // Remplacement Transilien J
    "C01847", // Remplacement Transilien L
    "C01848", // Remplacement Transilien R
    "C01849", // Remplacement RER A
    "C01850", // Remplacement RER B
    "C01851", // Remplacement RER C
    "C01852", // Remplacement RER D
    "C01853",// Remplacement RER E
    "C02404",
  ]);
interface Props {
  line: Line;
  className: string;
  size?: string;
  transparent?: boolean;
  fontSize?: string;
  logoStyle?: string;
  blink?: boolean;
}

const props = defineProps<Props>();
const logoShape = computed(() => "none");
const style = computed(() => {
  return {
    "--bg-color": props.line.color,
    "--text-color": props.line.textColor,
    "--size": props.size,
  };
});
const isLineSpecial = computed(() => {
  if (props.transparent) {
    return false;
  }
  
  return (
    SPECIAL_NAMES.has(
      props.line.name.toLocaleUpperCase().replace(/\s/g, ""),
    ) || SPECIAL_IDS.has(cleanId(props.line.id))
  );
});
const computeBackupImgLink = computed(() => {
  return "/lines/" + props.line.name.toLowerCase().replace(/\s/g, "_") + ".svg";
});
const computeNormalImgLink = computed(() => {
  return "/lines/" + cleanId(props.line.id) + ".svg";
});
const lineLogoComponent = computed(() => {
  if (isLineSpecial.value) {
    return null;
  }
  if ([Mode.RER, Mode.TRANSILIEN].includes(props.line.mode)) {
    return TrainLogo;
  }
  if ([Mode.METRO].includes(props.line.mode)) {
    return MetroLogo;
  }
  if ([Mode.TRAM, Mode.CABLE].includes(props.line.mode)) {
    return TramLogo;
  }
  return null;
});
</script>
<template>
  <div v-if="lineLogoComponent" :class="className">
    <component
      :is="lineLogoComponent"
      :line-name="line.name"
      :bg-color="line.color"
      :text-color="line.textColor"
      :transparent="props.transparent"
      :height="props.size ? props.size : '100%'"
    />
  </div>
  <img
    v-else-if="isLineSpecial"
    :data-line-mode-and-name="
      props.line.mode.toString().toUpperCase() + ' : ' + props.line.name
    "
    :src="computeNormalImgLink"
    :data-line-id="cleanId(props.line.id)"
    :onerror="'this.onerror=null;this.src=\'' + computeBackupImgLink + '\''"
    :class="'line-logo' + ' specialLogo ' + props.className + ' '"
    :style="style"
  />
  <div
    v-else-if="
      [Mode.BUS, Mode.BUS_AEROPORT].includes(props.line.mode) ||
      (props.line.mode === Mode.BUS_REMPLACEMENT && !props.line.linkedLine)
    "
    :class="props.className"
  >
    <BusLineLogo
      :data-line-mode-and-name="
        props.line.mode.toString().toUpperCase() + ' : ' + props.line.name
      "
      :data-line-id="cleanId(props.line.id)"
      :lineName="props.line.name"
      :blink="props.blink"
      :height="props.size ? props.size : '100%'"
      :bgColor="props.line.color"
      :base-font-size="fontSize"
      :textColor="props.line.textColor"
      :style="props.logoStyle"
    />
  </div>
  <div
    v-else-if="
      [Mode.BUS_REMPLACEMENT].includes(props.line.mode) && props.line.linkedLine
    "
    :class="props.className"
  >
    <BusRemplacementLineLogo
      :data-line-mode-and-name="
        props.line.mode.toString().toUpperCase() + ' : ' + props.line.name
      "
      :data-line-id="cleanId(props.line.id)"
      :lineName="props.line.name"
      :height="props.size ? props.size : '100%'"
      :bgColor="props.line.color"
      :base-font-size="fontSize"
      :textColor="props.line.textColor"
      :style="props.logoStyle"
      :replacedLine="props.line.linkedLine"
    />
  </div>
  <div
    :class="'line-logo' + ' ' + props.className + ' ' + logoShape"
    v-else-if="props.line.mode === Mode.NOCTILIEN"
  >
    <NoctilienLogo
      :data-line-mode-and-name="
        props.line.mode.toString().toUpperCase() + ' : ' + props.line.name
      "
      :data-line-id="cleanId(props.line.id)"
      :blink="props.blink"
      :lineName="props.line.name"
      :height="props.size ? props.size : '100%'"
      :bgColor="props.line.color"
      :textColor="props.line.textColor"
    />
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
  user-select: none;
  -webkit-user-drag: none;

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
