<template>
  <div class="lines-connection-container">
    <img
      src="../../assets/img/left-triangle.png"
      alt="lines connection icon"
      class="triangle-icon"
    />

    <div class="line-connection">
      <div class="header">
        <Transition name="text-translation-fade" mode="out-in">
          <span
            class="translation"
            v-html="translation"
            :key="translation"
          ></span>
        </Transition>
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
              <LineLogo
                :line="line"
                class-name="line"
                :size="lineLogoSize(line)"
              />
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
import { useRotatedText } from "../../hooks/useRotatedText";
import { CONNECTING_LINES_TEXTS } from "../../translations";
import { useSettings } from "../../composables/useSettings.ts";

const params = useRoute().query;
const translation = useRotatedText(CONNECTING_LINES_TEXTS);

const props = defineProps<{
  connections: Array<Line>;
}>();

const { showAllLinesEnabled } = useSettings();

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
    Mode.NOCTILIEN,
    Mode.BUS_REMPLACEMENT,
    Mode.BUS_AEROPORT,
  ];

  props.connections.forEach((line) => {
    if (line.id === (params.line as string)) {
      return;
    }

    if ([Mode.NOCTILIEN, Mode.BUS_REMPLACEMENT, Mode.BUS_AEROPORT].includes(line.mode)) {
      line.mode = Mode.BUS;
    }
    if (!grouped[line.mode]) {
      grouped[line.mode] = [];
    }

    grouped[line.mode].push(line);
  });

  if (!showAllLinesEnabled.value) {
    if (grouped[Mode.BUS]) {
      grouped[Mode.BUS] = [];
    }

    if (grouped[Mode.NOCTILIEN]) {
      delete grouped[Mode.NOCTILIEN];
    }
  }

  if (grouped[Mode.TER]) {
    grouped[Mode.TER] = [];
  }

  const sortedGrouped: { [mode: string]: Line[] } = {};

  let index = 1;

  MODES_ORDER.forEach((mode) => {
    if (index > MAX_DISPLAYED_MODES && !showAllLinesEnabled.value) {
      return;
    }

    if (grouped[mode]) {
      sortedGrouped[mode] = [...grouped[mode]].sort((a, b) => {
        return String(a.name).localeCompare(String(b.name), "fr", {
          numeric: true,
          sensitivity: "base",
        });
      });

      index++;
    }
  });

  return sortedGrouped;
});
const totalLines = computed(() => {
  return Object.values(linesByMode.value).reduce(
    (total, lines) => total + lines.length,
    0,
  );
});

const lineLogoSize = (line: Line) => {
  if (line.name.toLocaleLowerCase().includes("remplacement")) {
    return "2.2cqw";
  }

  switch (line.mode) {
    case Mode.BUS_REMPLACEMENT:
      return "2.2cqw";

    case Mode.BUS:
    case Mode.NOCTILIEN:
      if (totalLines.value < 9) {
        return "3cqw";
      }

      if (totalLines.value <= 15) {
        return "2.8cqw";
      }
      if (totalLines.value <= 20) {
        return "2.5cqw";
      }

      return "2.2cqw";

    default:
      return "3.8cqw";
  }
};
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
  gap: 0.4em;
}

.lines-list {
  display: flex;
  align-items: center;
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
  z-index: 1;
  animation: slide-from-behind 0.4s ease-out 1.17s forwards;
  display: none;
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
