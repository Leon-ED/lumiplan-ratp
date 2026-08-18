<script setup lang="ts">
import Lumiplan from '../components/Lumiplan.vue';
import FitBox from '../components/FitBox.vue';
import { onDeactivated, onUnmounted, ref } from 'vue';
import { AudioManager } from '../audio.ts';
const ratio = ref<number|string>('32/9');
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
      <Lumiplan :full-screen="ratio === 0 ? true : false" @toggle-full-screen="ratio = ratio === 0 ? '32/9' : 0" />
    </FitBox>
  </div>
</template>
<style scoped lang="css">
.content {
 background-color: #242424;
}
</style>
