<script setup lang="ts">
import { computed, ref } from "vue";
import { DesserteWithLine, Line, StopWithTime } from "../../types";
import LineLogo from "../Other/LineLogo.vue";
import EditorStopItem from "./EditorStopItem.vue";

const props = defineProps<{
  desserteWithLine: DesserteWithLine;
  sortedStops: StopWithTime[];
  allLines: Line[];
}>();

const areAllStopsWithCoordinates = computed(() => {
  return props.sortedStops.every((stop) => stop.stop.lat && stop.stop.lon);
});

const emit = defineEmits<{
  (e: "edit-operated-line", line: Line): void;
  (e: "add-stop"): void;
  (e: "edit-stop", stop: StopWithTime): void;
  (e: "delete-stop", stop: StopWithTime): void;
  (e: "select-base-line", lineId: string): void;
  (e: "move-up", stop: StopWithTime): void;
  (e: "move-down", stop: StopWithTime): void;
}>();

const firstTerminusIndex = computed(() => {
  return props.sortedStops.findIndex((stop) => stop.isTerminus);
});
const terminusCount = computed(() => {
  return props.sortedStops.filter((stop) => stop.isTerminus).length;
});

const hasTooManyTerminuses = computed(() => {
  return terminusCount.value > 2;
});

const onBaseLineChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  emit("select-base-line", select.value);
};

const isCalculating = ref(false);

const calculateTravelTimes = async () => {
  const stops = props.sortedStops;

  if (stops.length < 2) {
    alert("Il faut au moins 2 arrêts pour calculer les temps de parcours.");
    return;
  }

  const missingCoords = stops.some((s) => !s.stop.lat || !s.stop.lon);
  if (missingCoords) {
    alert(
      "Certains arrêts n'ont pas de coordonnées (latitude/longitude) renseignées.\nVeuillez les éditer avant de lancer le calcul.",
    );
    return;
  }

  isCalculating.value = true;

  try {
    const coordinatesString = stops
      .map((s) => `${s.stop.lon},${s.stop.lat}`)
      .join(";");

    const url = `https://signal.eu.org/osm/eu/route/v1/train/${coordinatesString}?overview=full&geometries=geojson&steps=false`;

    const response = await fetch(url);
    const data = await response.json();
    props.desserteWithLine.desserte.geometry = data.routes[0].geometry;
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const legs = data.routes[0].legs;

      for (let i = 0; i < legs.length; i++) {
        const nextStop = stops[i + 1];
        nextStop.travelTime = Math.round(legs[i].duration);
      }

      alert("Temps de parcours calculés et appliqués avec succès !");
    } else {
      alert("Erreur lors du calcul OSRM : " + (data.message || data.code));
    }
  } catch (error) {
    console.error("Erreur appel OSRM:", error);
    alert("Erreur réseau ou impossibilité de joindre l'API OSRM.");
  } finally {
    isCalculating.value = false;
  }
};
</script>

<template>
  <main class="main-content">
    <section
      class="card main-service-card"
      :style="{ '--route-color': desserteWithLine.line.color }"
    >
      <div class="card-header">
        <h2>Mon service</h2>
      </div>

      <div class="service-config">
        <div class="field-group">
          <label for="base-line-select">Ligne principale</label>
          <div class="operated-line-selector">
            <div
              class="operated-line-preview"
              @click="emit('edit-operated-line', desserteWithLine.line)"
              title="Modifier les couleurs/nom de cette desserte spécifiquement"
            >
              <LineLogo
                :line="desserteWithLine.line"
                :blink="desserteWithLine.desserte.isLimitedService"
                class-name="line-logo"
                size="2.5rem"
              />
              <span class="edit-text">Éditer</span>
            </div>
            <select
              id="base-line-select"
              @change="onBaseLineChange"
              :value="desserteWithLine.line.id"
              class="line-select"
            >
              <option
                v-if="!allLines.find((l) => l.id === desserteWithLine.line.id)"
                :value="desserteWithLine.line.id"
                disabled
              >
                {{ desserteWithLine.line.name }} (Actuelle)
              </option>
              <option v-for="line in allLines" :key="line.id" :value="line.id">
                {{ line.mode.replace("_", " ").replace("REMPLACEMENT", "") }}
                {{ line.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="field-group direction">
          <label for="direction-input">Nom de la direction</label>
          <input
            id="direction-input"
            type="text"
            v-model="desserteWithLine.desserte.direction"
            placeholder="Ex: Gare de Lyon"
          />
          <label for="direction-input">Nom de la mission</label>
          <input
            id="direction-input"
            type="text"
            v-model="desserteWithLine.desserte.vehicleNumber"
            placeholder="ex : LEON93, ARNO77"
          />
          <label class="checkbox-label" for="is-limited-service">
            <input
              id="is-limited-service"
              type="checkbox"
              v-model="desserteWithLine.desserte.isLimitedService"
            />
            Service Partiel
          </label>
        </div>
      </div>

      <hr class="divider" />

      <div class="card-header">
        <h3>{{ desserteWithLine.desserte.stops.length }} arrêts</h3>
        <div class="action-buttons">
          <button
            v-if="areAllStopsWithCoordinates"
            class="btn btn-outline"
            @click="calculateTravelTimes"
            :disabled="isCalculating"
            :title="'Calcule le temps de parcours entre chaque arrêt avec OpenStreetMap'"
          >
            {{ isCalculating ? "Calcul en cours..." : "Calculer les temps" }}
          </button>
          <button class="btn btn-secondary" @click="emit('add-stop')">
            + Ajouter un arrêt
          </button>
        </div>
      </div>
      <div v-if="hasTooManyTerminuses" class="warning-alert">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          ></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Vous avez défini {{ terminusCount }} terminus. Un service ne peut avoir
        au maximum qu'un seul terminus partiel et un terminus final.<br />
        Terminus définis :
        {{
          desserteWithLine.desserte.stops
            .filter((stop) => stop.isTerminus)
            .map((stop) => stop.stop.name)
            .join(", ")
        }}.
      </div>
      <div class="thermometer-list">
        <EditorStopItem
          v-for="(stop, index) in sortedStops"
          :key="stop.stop.id"
          :is-first-stop="index === 0"
          :is-last-stop="index === sortedStops.length - 1"
          :is-after-partial-terminus="
            firstTerminusIndex !== -1 && index > firstTerminusIndex
          "
          :partial-terminus-index="firstTerminusIndex"
          :stop="stop"
          :route="desserteWithLine.line"
          @edit-stop="emit('edit-stop', stop)"
          @delete-stop="emit('delete-stop', stop)"
          @move-up="emit('move-up', stop)"
          @move-down="emit('move-down', stop)"
        />
      </div>
    </section>
  </main>
</template>

<style scoped lang="css">
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #eaeaea;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}
.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
}
.action-buttons {
  display: flex;
  gap: 12px;
}
.divider {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 28px 0;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}
.btn-outline {
  background-color: transparent;
  color: #495057;
  border: 1px solid #ced4da;
}
.btn-outline:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}
.service-config {
  display: flex;
  align-items: flex-start; /* Changé de center à flex-start pour aligner en haut avec la checkbox */
  gap: 10px;
}
@media (max-width: 600px) {
  .service-config {
    flex-direction: column;
  }
  .direction {
    margin-left: 0 !important;
    width: 100%;
  }
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-group label:not(.checkbox-label) {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
input[type="text"] {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fafafa;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
  outline: none;
}
input[type="text"]:focus {
  border-color: #007bff;
  background-color: #fff;
}

/* Nouveaux styles pour la checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.9rem;
  font-weight: 500 !important;
  color: #333;
  cursor: pointer;
  text-transform: none !important;
  letter-spacing: normal !important;
}
.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  accent-color: #007bff;
}

.operated-line-selector {
  display: flex;
  align-items: center;
  gap: 16px;
}
.line-select {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fafafa;
  transition: border-color 0.2s;
  outline: none;
  cursor: pointer;
  height: 100%;
  min-height: 58px;
}
.line-select:focus {
  border-color: #007bff;
  background-color: #fff;
}
.operated-line-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.operated-line-preview:hover {
  background: #f1f3f5;
  border-color: #ced4da;
}
.edit-text {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
}
.thermometer-list {
  display: flex;
  flex-direction: column;
  padding-top: 10px;
}
.direction {
  margin-left: auto;
  min-width: 250px;
}
</style>

<style lang="css">
.warning-alert {
  background-color: #fcf1f1;
  color: #dc3545;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c2c7;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
}

.warning-alert svg {
  flex-shrink: 0;
  color: #dc3545;
}
</style>
