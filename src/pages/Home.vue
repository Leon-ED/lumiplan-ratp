<template>
  <main>
    <input class="search-input" type="text" v-model="_search" />
    <ol>
      <li v-for="line in lines" :key="line.id" @click="selectedLine = line">
        <LineLogo :line="line" class-name="line-logo" size="3em" />
      </li>
    </ol>
    <section class="desserte-list" v-if="dessertes.length > 0">
      <h2>Dessertes pour la ligne {{ selectedLine?.name }}</h2>
      <ul>
        <li v-for="desserte in dessertes" @click="selectedDesserte = desserte">
          <RouterLink
            :to="{
              name: 'DesserteDetails',
              query: { tripRef: desserte.id, lineRef: selectedLine?.id },
            }"
          >
          {{ desserte.direction }} - Prochain arret: {{ desserte.stops[0]?.stop.name }}
          </RouterLink>
        </li>
      </ul>
    </section>
  </main>
</template>
<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import { ref } from "vue";
import { Desserte, Line } from "../types";
import { Api } from "../api";
import LineLogo from "../components/Other/LineLogo.vue";
const selectedLine = ref<Line | null>(null);
const selectedDesserte = ref<Desserte | null>(null);
const dessertes = ref<Desserte[]>([]);
const _search = ref("");
const lines = ref<Line[]>([]);
watchDebounced(
  _search,
  async () => {
    try {
      const apiLines = await Api.searchLines(_search.value);
      if (!apiLines || apiLines.length === 0) {
        return;
      }
      lines.value = apiLines;
      console.log("Fetched lines:", lines.value);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  },
  { debounce: 300 }
);
watchDebounced(
  selectedLine,
  async (newLine) => {
    if (newLine) {
      try {
        const vehicles = await Api.getVehiclesOnLine(newLine.id);
        dessertes.value = vehicles;
        console.log("Fetched vehicles for line:", vehicles);
      } catch (error) {
        console.error("Error fetching vehicles for line:", error);
      }
    }
  },
  { debounce: 300 }
);
</script>
<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3em;
}
input[type="text"] {
  font-size: 1.5em;
  border-radius: 0.3em;
  box-shadow: unset;
  margin-bottom: 1em;
  width: 40%;
  box-sizing: border-box;
  padding: 1vw 0.5vw;
  border: gray 1px solid;
}
input[type="text"]:focus {
  outline: none;
}
ol {
  list-style: none;
  padding: 0;
}
li {
  width: fit-content;
}
li:hover {
  cursor: pointer;
  background-color: #f0f0f0;
}
</style>
