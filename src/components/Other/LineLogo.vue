<script setup lang="ts">
import { computed } from "vue";
import BusLineLogo from "./BusLineLogo.vue";
import NoctilienLogo from "./NoctilienLogo.vue";
import { Line, Mode } from "../../types";
import { cleanId } from "../../utils";
import TrainLogo from "./TrainLogo.vue";
import MetroLogo from "./MetroLogo.vue";
import TramLogo from "./TramLogo.vue";

interface Props {
  line: Line;
  className: string;
  size?: string;
  fontSize?: string;
  logoStyle?: string;
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
  const specialNames = [
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
  const specialIds = [
    "C01389",
    "C01390",
    "C01391",
    "C01679",
    "C01843",
    "C01684",
    "C01794",
    "C01774",
    "C01795",
    "C02317",
    "C02528",
    "C01999",
    "C02529",
    "C02344",
    "C02732",
    "C01742",
    "C01743",
    "C00563",
    "C01386",
    "C01387",
    "C01384",
    "C01383",
    "C01840",
    "C01841",
    "C02310",
    "C01842",
    "C02512",
    "C01844",
    "C02405",
    "C02483",
    "C02534",
    "C01357",
    "C02494",
    "C02527",
    "C02492",
    "C02268",
    "C02475",
    "C02533",
    "C02442",
    "C02385",
    "C02019",
    "C02514",
    "C02532",
    "C02531",
    "C02471",
    "C01683",
    "C02406",
    "C02590",
    "C02407",
    "C02408",
    "C02409",
    "C02410",
    "C02411",
    "C02573",
    "C02469",
    "C02180",
    "C01845",
    "C01846",
    "C01847",
    "C01848",
    "C01849",
    "C01850",
    "C01851",
    "C01852",
    "C01853",
    "C02404",
  ];
  return (
    specialNames.includes(
      props.line.name.toLocaleUpperCase().replace(/\s/g, ""),
    ) ||
    specialIds.includes(cleanId(props.line.id))
  );
});
const computeBackupImgLink = computed(() => {
  return "/lines/" + props.line.name.toLowerCase().replace(/\s/g, "_") + ".svg";
});
const computeNormalImgLink = computed(() => {
  return "/lines/" + cleanId(cleanId(props.line.id)) + ".svg";
});
const lineLogoComponent = computed(() => {
  if(isLineSpecial.value) {
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
      :height="props.size ? props.size : '100%'"
    />
  </div>
  <img
    :data-line-mode-and-name="
      props.line.mode.toString().toUpperCase() + ' : ' + props.line.name
    "
    v-else-if="isLineSpecial"
    :src="computeNormalImgLink"
    :data-line-id="cleanId(props.line.id)"
    :onerror="'this.onerror=null;this.src=\'' + computeBackupImgLink + '\''"
    :class="'line-logo' + ' specialLogo ' + props.className + ' '"
    :style="style"
  />
  <div
    v-else-if="[Mode.BUS].includes(props.line.mode)"
    :class="props.className"
  >
    <BusLineLogo
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
