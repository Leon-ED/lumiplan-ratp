<template>
  <main>
    <section class="search-section">
      <label for="search-input">Rechercher une ligne</label>
      <input
        name="search-input"
        class="search-input"
        type="text"
        v-model="_search"
        placeholder="RER A, Metro 5, T5, 393"
      />
    </section>
    <section class="modes">
      <QuickMode
        v-for="mode in QUICK_MODES"
        :key="mode.name"
        :name="mode.name"
        :onClick="mode.callback"
      />
    </section>
    <section>
      <label for="search-input" v-if="lines.length !== 0"
        >Sélectionner une ligne</label
      >
      <label for="search-input" v-if="linesSearchStatus === 'loading'"
        >Chargement des lignes...</label
      >
      <label for="search-input" v-if="linesSearchStatus === 'no_results'"
        >Aucune ligne n'a pu être trouvée pour cette recherche.</label
      >
      <label for="search-input" v-if="linesSearchStatus === 'error'"
        >Erreur lors de la recherche des lignes. Veuillez réessayer plus tard.
      </label>
      <ul class="line-list">
        <li
          v-for="line in lines"
          :key="line.id"
          @click="selectedLine = line"
          class="line"
          :class="{ selected: selectedLine?.id === line.id }"
        >
          <LineLogo :line="line" class-name="line-logo" size="3rem" />
        </li>
      </ul>
    </section>
    <section>
      <span v-if="desserteSearchStatus === 'loading'"
        >Chargement des services de la ligne en cours ...</span
      >
      <span v-if="desserteSearchStatus === 'error'"
        >Erreur lors du chargement des services. Veuillez réessayer plus
        tard.</span
      >
      <span v-if="desserteSearchStatus === 'no_results'"
        >Aucun service n'a pu être trouvé pour cette ligne.<br />
        Elle ne dispose peut-être d'aucun service dans la fourchette
        [-90min;+25min]</span
      >
    </section>

    <section class="desserte-list" v-if="dessertes.length > 0 && selectedLine">
      <div class="desserte-list-header">
        <span>Sélectionner un service pour la ligne </span>
        <LineLogo :line="selectedLine" class-name="line-logo" size="2rem" />
      </div>
      <ul class="service-list">
        <li v-for="desserte in dessertes" @click="selectedDesserte = desserte">
          <ServiceOverview
            :line="selectedLine"
            :desserte="desserte"
          ></ServiceOverview>
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
import QuickMode from "../components/HomePage/QuickMode.vue";
import LineLogo from "../components/Other/LineLogo.vue";
import ServiceOverview from "../components/HomePage/ServiceOverview.vue";
const selectedLine = ref<Line | null>(null);
const selectedDesserte = ref<Desserte | null>(null);
const dessertes = ref<Desserte[]>([]);
const _search = ref("");
const lines = ref<Line[]>([]);
type DESSERTE_SEARCH_STATUS =
  | "idle"
  | "loading"
  | "error"
  | "done"
  | "no_results";

const QUICK_MODES = [
  {
    name: "RER",
    callback: () => {
      _search.value = "RER ";
    },
  },
  {
    name: "Transilien",
    callback: () => {
      _search.value = "Transilien ";
    },
  },
  {
    name: "Métro",
    callback: () => {
      _search.value = "Metro ";
    },
  },
  {
    name: "Tramway",
    callback: () => {
      _search.value = "Tram ";
    },
  },
  {
    name: "Câble",
    callback: () => {
      _search.value = "Telepherique ";
    },
  },
  {
    name: "Noctiliens",
    callback: () => {
      _search.value = "Noctilien ";
    },
  },
  {
    name: "Bus de remplacement",
    callback: () => {
      _search.value = "BUS_REMPLACEMENT ";
    },
  },
];

type LINES_SEARCH_STATUS = "idle" | "loading" | "error" | "done" | "no_results";
const desserteSearchStatus = ref<DESSERTE_SEARCH_STATUS>("idle");
const linesSearchStatus = ref<LINES_SEARCH_STATUS>("idle");
watchDebounced(
  _search,
  async () => {
    selectedDesserte.value = null;
    desserteSearchStatus.value = "idle";
    dessertes.value = [];
    lines.value = [];
    selectedLine.value = null;
    if (_search.value.trim() === "") {
      linesSearchStatus.value = "idle";
      return;
    }
    try {
      linesSearchStatus.value = "loading";
      const apiLines = await Api.searchLines(_search.value);
      if (!apiLines || apiLines.length === 0) {
        linesSearchStatus.value = "no_results";
        return;
      }
      linesSearchStatus.value = "done";
      lines.value = apiLines;
      console.log("Fetched lines:", lines.value);
    } catch (error) {
      linesSearchStatus.value = "error";
      console.error("Error fetching search results:", error);
    }
  },
  { debounce: 300 }
);
watchDebounced(
  selectedLine,
  async (newLine) => {
    desserteSearchStatus.value = "idle";
    if (newLine) {
      selectedDesserte.value = null;
      dessertes.value = [];
      try {
        desserteSearchStatus.value = "loading";
        console.log("Fetching vehicles for line:", newLine.id);
        const vehicles = await Api.getVehiclesOnLine(newLine.id);
        dessertes.value = vehicles;
        desserteSearchStatus.value = "done";
        if (vehicles.length === 0) {
          desserteSearchStatus.value = "no_results";
        }
      } catch (error) {
        desserteSearchStatus.value = "error";
        console.error("Error fetching vehicles for line:", error);
      }
    }
  },
  { debounce: 300 }
);
</script>
<style scoped>
.desserte-list-header {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 1em;
}
.modes {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
  margin-bottom: 1em;
}
main {
  display: flex;
  container-type: inline-size;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1em;
  box-sizing: border-box;
  width: min(35em, 90%);
  margin: auto;
}
input[type="text"] {
  font-size: 1.3em;
  border-radius: 0.2em;
  box-shadow: unset;
  width: 100%;
  box-sizing: border-box;
  border-bottom-left-radius: 0;
  padding: 0.5em 0.3em;
  margin-top: 0.5em;
  border: gray 0.5px solid;
}
input,
input::placeholder {
  font-size: 0.6em;
}
input[type="text"]:focus {
  outline: none;
}
a {
  text-decoration: none;
  color: inherit;
}
li {
  width: fit-content;
}
.line-list li:hover {
  cursor: pointer;
}
.line-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 1em;
}
/* target .line-list child if line-lisdt has only one child with .selected class */
.line-list:has(.selected) .line:not(.selected) {
  opacity: 0.1;
}
.service-list {
  list-style: none;
  padding: 0;
}
.service-list li {
  margin-bottom: 1em;
  width: 100%;
}
section {
  width: 100%;
}
@media (prefers-color-scheme: dark) {
  main {
    background-color: #121212;
    color: white;
  }
  input[type="text"] {
    background-color: #1e1e1e;
    color: white;
    border: gray 0.5px solid;
  }
}
</style>
