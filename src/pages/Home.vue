<template>
  <main>
    <header class="page-header">
      <div class="title-container">
        <h1 class="main-title">Votre écran bus RATP</h1>
        <p class="subtitle">
          Affichez la desserte de n'importe quelle ligne ou créez celle de vos
          rêves avec l'éditeur !
        </p>
      </div>
      <div class="actions-container">
        <button class="news-btn" @click="isModalOpen = true">
          <i class="bi bi-bell-fill"></i> Nouveautés !
        </button>
        <button class="editor-btn" @click="openEditor">
          <i class="bi bi-pencil-fill"></i> Éditeur
        </button>
      </div>
    </header>

    <section class="search-section">
      <label for="search-input" class="section-title"
        >Rechercher une ligne</label
      >
      <input
        name="search-input"
        class="search-input"
        type="text"
        v-model="_search"
        placeholder="Ex: RER A, Metro 5, T5, 393..."
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

    <section class="results-section">
      <div class="status-message" v-if="lines.length !== 0">
        Sélectionner une ligne
      </div>
      <div
        class="status-message loading"
        v-if="linesSearchStatus === 'loading'"
      >
        Chargement des lignes...
      </div>
      <div
        class="status-message error"
        v-if="linesSearchStatus === 'no_results'"
      >
        Aucune ligne n'a pu être trouvée pour cette recherche.
      </div>
      <div class="status-message error" v-if="linesSearchStatus === 'error'">
        Erreur lors de la recherche des lignes. Veuillez réessayer plus tard.
      </div>

      <ul class="line-list">
        <li
          v-for="line in lines"
          :key="line.id"
          @click="dessertes=[];selectedLine = line; desserteSearchStatus = 'loading'"
          class="line"
          :class="{ selected: selectedLine?.id === line.id }"
        >
          <LineLogo :line="line" class-name="line-logo" size="3.5rem" />
        </li>
      </ul>
    </section>

    <section class="service-status">
      <div
        class="status-message loading"
        v-if="desserteSearchStatus === 'loading'"
      >
        Chargement des services de la ligne en cours...
      </div>
      <div class="status-message error" v-if="desserteSearchStatus === 'error'">
        Erreur lors du chargement des services. Veuillez réessayer.
      </div>
      <div
        class="status-message error"
        v-if="desserteSearchStatus === 'no_results'"
      >
        Aucun service n'a pu être trouvé pour cette ligne.<br />
        <span class="sub-message"
          >Elle ne dispose peut-être d'aucun service dans la fourchette
          [-90min;+25min]</span
        >
      </div>
    </section>

    <section class="desserte-list" v-if="dessertes.length > 0 && selectedLine">
      <div class="desserte-list-header">
        <span class="section-title">Sélectionner un service</span>
        <LineLogo :line="selectedLine" class-name="line-logo" size="2rem" />
      </div>

      <!-- Nouvelle barre de recherche pour les services -->
      <div class="service-filter-container">
        <input
          type="text"
          v-model="serviceFilter"
          list="terminus-list"
          class="search-input service-filter-input"
          placeholder="Filtrer par terminus, mission..."
        />
        <datalist id="terminus-list">
          <option
            v-for="option in terminusOptions"
            :key="option"
            :value="option"
          ></option>
        </datalist>
      </div>

      <ul class="service-list">
        <li
          v-for="desserte in filteredDessertes"
          :key="desserte.id"
          @click="selectedDesserte = desserte"
        >
          <ServiceOverview
            :line="selectedLine"
            :desserte="desserte"
          ></ServiceOverview>
        </li>
      </ul>

      <div v-if="filteredDessertes.length === 0" class="status-message">
        Aucun service ne correspond à votre recherche.
      </div>
    </section>

    <footer class="page-footer">
      <div class="social-links">
        <a
          href="https://twitter.com/gwadz_"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
          >Twitter</a
        >
        <a
          href="https://discord.gg/tPyPnxVuxQ"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
          >Discord</a
        >
        <a
          href="https://leon.gp"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
          >Autres projets</a
        >
        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
          >A propos</a
        >
      </div>
      <p class="disclaimer">
        Ce site n'est en aucun cas affilié, soutenu ou validé par Île-de-France
        Mobilités, Lumiplan ou la RATP.
      </p>
    </footer>
    <NewsModal
      v-if="isModalOpen"
      :articles="articles"
      @close="isModalOpen = false"
    />
  </main>
</template>

<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import { ref, computed } from "vue";
import {  Line, VehicleJourney } from "../types";
import { Api } from "../api";
import QuickMode from "../components/HomePage/QuickMode.vue";
import LineLogo from "../components/Other/LineLogo.vue";
import ServiceOverview from "../components/HomePage/ServiceOverview.vue";
import { articles } from "../articles.ts";
import NewsModal from "../components/NewsModal.vue";

const selectedLine = ref<Line | null>(null);
const selectedDesserte = ref<VehicleJourney | null>(null);
const dessertes = ref<VehicleJourney[]>([]);
const _search = ref("");
const lines = ref<Line[]>([]);

// Filtre des services
const serviceFilter = ref("");

const isModalOpen = ref(false);
type DESSERTE_SEARCH_STATUS =
  | "idle"
  | "loading"
  | "error"
  | "done"
  | "no_results";
type LINES_SEARCH_STATUS = "idle" | "loading" | "error" | "done" | "no_results";

const desserteSearchStatus = ref<DESSERTE_SEARCH_STATUS>("idle");
const linesSearchStatus = ref<LINES_SEARCH_STATUS>("idle");

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
    name: "Bus de remplacement",
    callback: () => {
      _search.value = "REMPLACEMENT ";
    },
  },
];

const openEditor = () => {
  window.open("/editor", "_blank");
};

const terminusOptions = computed(() => {
  const options = new Set<string>();
  dessertes.value.forEach((d) => {
    if (d.destinationStop?.stopName) options.add(d.destinationStop.stopName);
  });
  return Array.from(options).sort();
});

const filteredDessertes = computed(() => {
  if (!serviceFilter.value.trim()) return dessertes.value;

  const searchLower = serviceFilter.value.toLowerCase().trim();
  return dessertes.value.filter((d) => {
    const destination = d.destinationStop?.stopName?.toLowerCase() || "";
    const headsign = d.headsign?.toLowerCase() || "";
    const shortName = d.shortName?.toLowerCase() || "";

    return (
      destination.includes(searchLower) ||
      headsign.includes(searchLower) ||
      shortName.includes(searchLower)
    );
  });
});

watchDebounced(
  _search,
  async () => {
    selectedDesserte.value = null;
    desserteSearchStatus.value = "idle";
    dessertes.value = [];
    lines.value = [];
    selectedLine.value = null;
    serviceFilter.value = "";
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
    } catch (error) {
      linesSearchStatus.value = "error";
    }
  },
  { debounce: 300 },
);

watchDebounced(
  selectedLine,
  async (newLine) => {
    desserteSearchStatus.value = "idle";
    serviceFilter.value = ""; // Réinitialiser le filtre quand on change de ligne
    if (newLine) {
      selectedDesserte.value = null;
      dessertes.value = [];
      try {
        desserteSearchStatus.value = "loading";
        const vehicles = await Api.getVehiclesOnLine(newLine.id);
        dessertes.value = vehicles;
        desserteSearchStatus.value = "done";
        if (vehicles.length === 0) {
          desserteSearchStatus.value = "no_results";
        }
      } catch (error) {
        desserteSearchStatus.value = "error";
      }
    }
  },
  { debounce: 300 },
);
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2em 1em;
  box-sizing: border-box;
  width: min(40em, 95%);
  margin: auto;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  min-height: 100vh;
}

.page-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1em;
  margin-bottom: 2em;
  padding-bottom: 1.5em;
  border-bottom: 1px solid #e0e0e0;
}

.title-container {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}

.main-title {
  margin: 0;
  font-size: 2em;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  font-size: 0.95em;
  color: #636e72;
  line-height: 1.4;
}

.actions-container {
  flex-shrink: 0;
  display: flex;
  gap: 0.8em;
}
.news-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  background-color: #c2185b; 
  color: white;
  border: 1px solid #c2185b;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.news-btn:hover {
  background-color: #ad1457; 
  border-color: #ad1457;
  box-shadow: 0 4px 8px rgba(194, 24, 91, 0.3);
  transform: translateY(-2px);
}

.editor-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  background-color: #2ca27b; 
  color: white; 
  border: 1px solid #2ca27b;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.editor-btn:hover {
  background-color: #238263; 
  border-color: #238263;
  box-shadow: 0 4px 8px rgba(44, 162, 123, 0.3);
  transform: translateY(-2px);
}

section {
  width: 100%;
  margin-bottom: 2em;
}

.section-title {
  display: block;
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 0.8em;
  color: #333;
}

.search-input {
  width: 100%;
  font-size: 1.2em;
  padding: 0.8em 1.2em;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #ffffff;
}

.search-input:focus {
  outline: none;
  border-color: #005fad;
  box-shadow: 0 4px 12px rgba(0, 95, 173, 0.15);
}

/* Nouveaux styles pour le champ de filtre */
.service-filter-container {
  margin-bottom: 1.5em;
}

.service-filter-input {
  font-size: 1rem;
  padding: 0.6em 1em;
}

.modes {
  display: flex;
  gap: 0.8em;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2.5em;
}

.line-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.2em;
}

.line {
  transition:
    transform 0.2s ease,
    opacity 0.3s ease;
  cursor: pointer;
}

.line:hover {
  transform: translateY(-3px) scale(1.05);
}

.line-list:has(.selected) .line:not(.selected) {
  opacity: 0.2;
  transform: scale(0.95);
}

.desserte-list-header {
  display: flex;
  align-items: center;
  gap: 0.8em;
  margin-bottom: 1.2em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid #f0f0f0;
}

.service-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}

.status-message {
  text-align: center;
  padding: 1em;
  color: #555;
  font-weight: 500;
}

.status-message.error {
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 8px;
}

.sub-message {
  font-size: 0.85em;
  font-weight: normal;
  opacity: 0.8;
}

.page-footer {
  width: 100%;
  margin-top: auto;
  padding-top: 2em;
  padding-bottom: 1em;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1.5em;
  margin-bottom: 1.2em;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  color: #005fad;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05em;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.social-link:hover {
  opacity: 0.7;
  transform: translateY(-2px);
}

.disclaimer {
  font-size: 0.85em;
  color: #888;
  line-height: 1.5;
  max-width: 90%;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
  }
  .actions-container {
    align-self: flex-end;
  }
}

@media (prefers-color-scheme: dark) {
  main {
    background-color: #121212;
    color: #e0e0e0;
  }

  .page-header {
    border-bottom-color: #333;
  }

  .main-title {
    color: #ffffff;
  }

  .subtitle {
    color: #a0a0a0;
  }

  .editor-btn {
    background-color: #064e3b;
    color: #34d399;
    border-color: #065f46;
  }

  .editor-btn:hover {
    background-color: #10b981;
    color: #111827;
  }

  .news-btn {
    background-color: #4a001a;
    color: #f48fb1;
    border-color: #880e4f;
  }

  .news-btn:hover {
    background-color: #f48fb1;
    color: #121212;
  }

  .modal-content {
    background-color: #1e1e1e;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    border-bottom: 1px solid #333;
  }

  .modal-header h2 {
    color: #ffffff;
  }

  .close-btn {
    color: #a0a0a0;
  }

  .close-btn:hover {
    color: #ffffff;
  }

  .article-title {
    color: #60a5fa;
  }

  .article-text {
    color: #d1d5db;
  }

  .section-title {
    color: #e0e0e0;
  }

  .search-input {
    background-color: #1e1e1e;
    color: white;
    border: 1px solid #333;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  .search-input:focus {
    border-color: #4da6ff;
  }

  .desserte-list-header {
    border-bottom: 2px solid #333;
  }

  .status-message {
    color: #bbb;
  }

  .status-message.error {
    background-color: #3b1919;
    color: #ff8a80;
  }

  .page-footer {
    border-top-color: #333;
  }

  .social-link {
    color: #60a5fa;
  }

  .disclaimer {
    color: #777;
  }
}
</style>
