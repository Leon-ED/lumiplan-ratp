<script setup lang="ts">
import Lumiplan from '../components/Lumiplan.vue';
import FitBox from '../components/FitBox.vue';
import { computed, onDeactivated, onUnmounted } from 'vue';
import { AudioManager } from '../audio.ts';
import { useSettings } from '../composables/useSettings';

const { isFullScreen } = useSettings();

const ratio = computed<number | string>(() => (isFullScreen.value ? 0 : '32/9'));
onDeactivated(() => {
  AudioManager.stopAll();
});

onUnmounted(() => {
  AudioManager.stopAll();
});
</script>
<template>
  <div class="content">
    <FitBox :ratio="ratio">
      <Lumiplan />
    </FitBox>
  </div>
</template>
<style scoped lang="css">
.content {
 background-color: #242424;
}
</style>
