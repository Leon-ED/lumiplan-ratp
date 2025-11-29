<template>
  <main>
    <section class="search-section">
    <label for="search-input">Rechercher une ligne</label>
    <input name="search-input" class="search-input" type="text" v-model="_search" placeholder="RER A, Metro 5, T5, 393" />
    </section>
    <ol class="line-list">
      <li v-for="line in lines" :key="line.id" @click="selectedLine = line" class="line" :class="{'selected':selectedLine?.id === line.id}">
        <LineLogo :line="line" class-name="line-logo" size="3em" />
      </li>
    </ol>
    <section class="desserte-list" v-if="dessertes.length > 0">
      <h2>Services disponibles pour la ligne {{ selectedLine?.name }}</h2>
      <ul class="service-list">
        <li v-for="desserte in dessertes" @click="selectedDesserte = desserte">
          <RouterLink
            :to="{
              name: 'DesserteDetails',
              query: { tripRef: desserte.id, lineRef: selectedLine?.id },
            }"
          >
          Direction : {{ desserte.direction }}<br />Prochain arret: {{ desserte.stops[0]?.stop.name }}<br />
          <template v-if="desserte.stops[0].isFirstStop">Départ prévu dans {{ getMinutesFromDate(desserte.stops[0].timeOfArrival) }} min</template>
          <template v-if="desserte.stops[0].isTerminus">Terminus</template>
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
import { getMinutesFromDate } from "../utils";
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
  width: min(30em, 90%);
  margin: auto;
}
input[type="text"] {
  font-size: 1.5em;
  border-radius: 0.2em;
  box-shadow: unset;
  width: 100%;
  margin-bottom: 1em;
  box-sizing: border-box;
  padding: .3em 0.1em;
  margin-top: 0.5em;
  border: gray 1px solid;
}
input,
input::placeholder {
  font-size: .8em;
}
input[type="text"]:focus {
  outline: none;
}
ol {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
}
a{
  text-decoration: none;
  color: inherit;
}
li {
  width: fit-content;
}
li:hover {
  cursor: pointer;
  background-color: #f0f0f0;
}
/* target .line-list child if line-lisdt has only one child with .selected class */
.line-list:has(.selected) .line:not(.selected) {
  opacity: 0.1;
}
.service-list {
  padding: 0;
}
.service-list li {
  margin-bottom: 1em;
}
</style>
