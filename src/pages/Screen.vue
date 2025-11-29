<script setup lang="ts">
import Lumiplan from '../components/Lumiplan.vue';
import FitBox from '../components/FitBox.vue';

</script>
<template>
  <div class="content">
    <FitBox :ratio="'32/9'">
      <Lumiplan />
    </FitBox>
  </div>
</template>
<style scoped lang="css">
.content {
 background-color: #242424;
}
</style>
