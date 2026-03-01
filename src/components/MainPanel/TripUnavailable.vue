<script setup lang="ts">
import { Line } from "../../types";
import LineLogo from "../Other/LineLogo.vue";
defineProps<{
  line: Line;
}>();
</script>

<template>
  <main class="data-unavailable">
    <div class="welcome-text">
      <span>Bienvenue</span>
      <div class="second-line">
        <span>sur la ligne</span>
        <LineLogo :line="line" class-name="line-logo" size="6.3cqw" />
      </div>
    </div>
    <aside class="aside">
      Informations<br />sur le parcours <br />du bus<br />indisponibles
      <img
        src="../../assets/img/screw-driver.svg"
        class="tool-icon"
      />
    </aside>
  </main>
</template>
<style lang="css" scoped>
.data-unavailable {
  display: grid;
  grid-template-columns: 65% 35%;

  color: white;
  padding-left: 2cqw;
  background-color: rgb(36, 36, 36) !important;
  font-size: 3cqw;
  box-shadow: 0 -5px 5px -5px black;
}
aside {
  padding: 2cqw;
  font-size: 2.5cqw;
  box-shadow: -5px 0 5px -5px black;
  position: relative;
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

.tool-icon {
position: absolute;
  width: 20cqw;
  bottom: -5cqw;
  right: -5cqw;
}
</style>
