<template>
  <div class="lines-connection-container">
    <img
      src="../../assets/img/left-triangle.png"
      alt="lines connection icon"
      class="triangle-icon"
    />
    <div class="line-connection">
      <div class="header">
        <span>Correspondances</span>
      </div>

      <div class="content">
        <div
          v-for="(lines, mode) in linesByMode"
          :key="mode"
          class="mode-group"
        >
          <img
            :src="`/modes/${mode.toString().toLowerCase()}.svg`"
            :alt="mode.toString()"
            class="mode-logo"
          />
          <div class="lines-list">
            <div v-for="line in lines" :key="line.id" class="line">
              <LineLogo :line="line" class-name="line-logo" size="3.8cqw" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { Line, Mode } from "../../types";
import LineLogo from "../Other/LineLogo.vue";
import { useRoute } from "vue-router";
const params = useRoute().query;
const props = defineProps<{
  connections: Array<Line>;
}>();
const linesByMode = computed(() => {
  const grouped: { [mode: string]: Line[] } = {};
  const MAX_DISPLAYED_MODES = 3;
  const MODES_ORDER = [
    Mode.RER,
    Mode.TRANSILIEN,
    Mode.METRO,
    Mode.CABLE,
    Mode.TRAM,
    Mode.TER,
    Mode.BUS,
    Mode.BUS,
    Mode.NOCTILIEN,
  ];
  props.connections.forEach((line) => {
    if (line.id === (params.lineRef as string)) {
      console.log("skip line", line.id);
      return;
    }
    // si noctilien on ajoute en bus
    if (line.mode === Mode.NOCTILIEN) {
      line.mode = Mode.BUS;
    }
    if (!grouped[line.mode]) {
      grouped[line.mode] = [];
    }

    grouped[line.mode].push(line);
  });
  if (grouped[Mode.BUS]) {
    grouped[Mode.BUS] = [];
  }
  if (grouped[Mode.TER]) {
    grouped[Mode.TER] = [];
  }
  // trier les modes selon MODES_ORDER
  console.log("grouped lines by mode:", grouped);
  const sortedGrouped: { [mode: string]: Line[] } = {};
  let index = 1;
  MODES_ORDER.forEach((mode) => {
    if (index > MAX_DISPLAYED_MODES) {
      return;
    }
    if (Object.keys(grouped).includes(mode.toString())) {
      index++;
      sortedGrouped[mode] = grouped[mode];
    }
  });
  console.log("sorted grouped lines by mode:", sortedGrouped);

  return sortedGrouped;
});
</script>
<style lang="css" scoped>
.lines-connection-container {
  width: 100%;
  position: relative;
  padding: 0;
  height: 100%;
  overflow: visible;
}

.line-connection {
  background-color: #f4eeea;
  position: relative;
  z-index: 4;
  box-sizing: border-box;
  padding: 1.5cqw;
  padding-top: 0.5cqw;
  width: 100%;
  height: 100%;
}

.header {
        color: #212121;
  font-size: 1.6cqw;
  margin-bottom: 1cqw;
}
.content {
  display: flex;
  flex-direction: column;
  gap: 1cqw;
}
.mode-logo {
  height: 3.8cqw;
  width: auto;
}
.mode-group {
  display: flex;
  gap: .4em;
}
.lines-list {
  display: flex;
  gap: 0.4em;
  flex-wrap: wrap;
}
.triangle-icon {
  position: absolute;
  top: 5.2cqw;
  left: -6.5%;
  height: 5cqw;
  width: auto;
  opacity: 0;
  transform: translateX(100%);
  z-index: 1; /* triangle derrière */
  animation: slide-from-behind 0.2s ease-out 1.17s forwards;
}

@keyframes slide-from-behind {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  1% {
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
