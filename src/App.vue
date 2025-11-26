<script setup lang="ts">
import Lumiplan from './components/Lumiplan.vue';
import FitBox from './components/FitBox.vue';

</script>
<template>
<div class="content">
  <FitBox :ratio="'30/10'">
    <Lumiplan />
  </FitBox>

</div>
</template>

<style scoped>
.content{
}

</style>
