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
            :src="`/public/modes/${mode.toString().toLowerCase()}.svg`"
            :alt="mode.toString()"
            class="mode-logo"
          />
          <div v-for="line in lines" :key="line.id" class="line">
            <LineLogo :line="line" class-name="line-logo" size="4cqw" />
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
  props.connections.forEach((line) => {
    console.log("line", line);
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

  return grouped;
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
  
  padding: 1.5cqw;
  padding-top: 0.5cqw;
  width: 100%;
  height: 100%;
}

.header {
  font-size: 1.6cqw;
  margin-bottom: 1cqw;
}
.content {
  display: flex;
  flex-direction: column;
  gap: 1cqw;
}
.mode-logo {
  height: 4cqw;
  width: auto;
}
.mode-group {
  display: flex;
  align-items: center;
  gap: 1cqw;
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
