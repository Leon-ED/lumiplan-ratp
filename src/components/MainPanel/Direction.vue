<script setup lang="ts">
import { useRotatedText } from "../../hooks/useRotatedText";
import {  DIRECTION_TEXTS } from "../../translations";
interface Props {
  direction: string;
}
const props = defineProps<Props>();
const translation = useRotatedText(DIRECTION_TEXTS);
</script>
<template>
  <main class="direction">
    <div class="direction-name-container">
      <Transition name="text-translation-fade" mode="out-in">
        <span
          class="translation"
          v-html="translation"
          :key="translation"
        ></span>
      </Transition>
      <span class="direction-name">{{ props.direction }}</span>
    </div>
  </main>
</template>
<style lang="css" scoped>
.direction {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
  color: gray;
  background-color: white;
  font-size: 3cqw;
  box-shadow: 0 -5px 5px -5px black;
}
.direction-name-container {
  background-color: white;
  display: grid;
  grid-template-rows: 10% 90%;
  padding: 1cqw;
  font-size: 2.5cqw;
  font-family: "ParisineRegular";
}
.direction-name {
  font-size: 5cqw;
  font-family: "ParisineBold";
  text-align: center;
  align-self: center;
  color: var(--ratp-blue);
}


</style>
