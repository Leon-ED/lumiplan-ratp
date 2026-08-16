<script setup lang="ts">
import { Line } from "../../types";
import LineLogo from "../Other/LineLogo.vue";
defineProps<{
  line: Line;
  isLimitedService: boolean;
}>();
</script>

<template>
  <main class="data-unavailable">
    <div class="welcome-text">
      <span>Bienvenue</span>
      <div class="second-line">
        <span>sur la ligne</span>
        <LineLogo
          :line="line"
          class-name="line-logo"
          size="5.5cqw"
          :blink="isLimitedService"
        />
      </div>
    </div>
  </main>
</template>
<style lang="css" scoped>
.data-unavailable {
  display: grid;
  grid-template-columns: 100%;
  color: white;
  padding-left: 2cqw;
  background-color: rgb(36, 36, 36) !important;
  font-size: 3cqw;
  box-shadow: 0 -5px 5px -5px black;
}
.welcome-text {
  font-size: 6cqw;
  display: flex;
  justify-content: center;
  flex-direction: column;
}
.second-line {
  display: flex;
  gap: 2cqw;
  align-items: center;
}
</style>
