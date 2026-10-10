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
const selectedStops = ref(new Set<string>());

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
const handleToggleSelect = (stop: StopWithTime) => {
  if (selectedStops.value.has(stop.stop.id)) {
    selectedStops.value.delete(stop.stop.id);
  } else {
    selectedStops.value.add(stop.stop.id);
  }
};

const multiLinesModalRef = ref<HTMLDialogElement | null>(null);
const selectedMultiLines = ref<Line[]>([]);

const handleQuickAction = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const action = select.value;
  if (!action) return;

  const stopsToEdit = props.desserteWithLine.desserte.stops.filter((s) =>
    selectedStops.value.has(s.stop.id),
  );

  switch (action) {
    case "make_accessible":
      stopsToEdit.forEach((s) => (s.stop.isAccessible = true));
      break;
    case "make_inaccessible":
      stopsToEdit.forEach((s) => (s.stop.isAccessible = false));
      break;
    case "add_gap":
      stopsToEdit.forEach((s) => (s.stop.hasGapWhenSteppingOff = true));
      break;
    case "remove_gap":
      stopsToEdit.forEach((s) => (s.stop.hasGapWhenSteppingOff = false));
      break;
    case "set_skipped":
      stopsToEdit.forEach((s) => (s.isStopSkipped = true));
      break;
    case "unset_skipped":
      stopsToEdit.forEach((s) => (s.isStopSkipped = false));
      break;
    case "change_radius": {
      const radiusStr = prompt("Nouveau rayon de déclenchement (en mètres) :");
      if (radiusStr !== null) {
        const radius = parseInt(radiusStr);
        if (!isNaN(radius) && radius > 0) {
          stopsToEdit.forEach((s) => (s.stop.radius = radius));
        }
      }
      break;
    }
    case "delete":
      if (
        confirm(`Voulez-vous vraiment supprimer ${stopsToEdit.length} arrêts ?`)
      ) {
        props.desserteWithLine.desserte.stops =
          props.desserteWithLine.desserte.stops.filter(
            (s) => !selectedStops.value.has(s.stop.id),
          );
        selectedStops.value.clear();
      }
      break;
    case "change_connections":
      selectedMultiLines.value = [];
      multiLinesModalRef.value?.showModal();
      break;
  }

  select.value = "";
};

const applyMultiConnections = () => {
  const stopsToEdit = props.desserteWithLine.desserte.stops.filter((s) =>
    selectedStops.value.has(s.stop.id),
  );
  stopsToEdit.forEach((s) => {
    s.stop.connectedLines = [...selectedMultiLines.value];
  });
  closeMultiLinesModal();
};

const closeMultiLinesModal = () => {
  multiLinesModalRef.value?.close();
};
const areAllSelected = computed(() => {
  return (
    props.sortedStops.length > 0 &&
    selectedStops.value.size === props.sortedStops.length
  );
});
const toggleSelectAll = () => {
  if (areAllSelected.value) {
    selectedStops.value.clear();
  } else {
    props.sortedStops.forEach((stop) => selectedStops.value.add(stop.stop.id));
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
        <h2>Service</h2>
      </div>

      <div class="service-config">
        <div class="field-group">
          <label for="base-line-select">Ligne</label>
          <div class="operated-line-selector">
            <div
              class="operated-line-preview"
              @click="emit('edit-operated-line', desserteWithLine.line)"
              title="Modifier les couleurs/nom de cette desserte spécifiquement"
            >
              <img
                :src="
                  '/modes/' + desserteWithLine.line.mode.toLowerCase() + '.svg'
                "
                alt="Mode"
                class="mode-picto"
              />
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
          <label class="checkbox-label" for="is-limited-service">
            <input
              id="is-limited-service"
              type="checkbox"
              v-model="desserteWithLine.desserte.isLimitedService"
            />
            Service Partiel
          </label>
          <label class="checkbox-label" for="serves-airport">
            <input
              id="serves-airport"
              type="checkbox"
              v-model="desserteWithLine.desserte.servesAirport"
            />
            Dessert un aéroport
          </label>
          <label class="checkbox-label" for="has-wheelchair-access">
            <input
              id="has-wheelchair-access"
              type="checkbox"
              v-model="desserteWithLine.desserte.hasWheelchairAccess"
            />
            <span>
              Accessible aux
              <abbr title="Usagers en fauteuil roulant">UFR</abbr>
            </span>
          </label>
        </div>

        <div class="field-group direction">
          <label for="direction-input">Direction</label>
          <input
            id="direction-input"
            type="text"
            v-model="desserteWithLine.desserte.direction"
            placeholder="Ex: Gare de Lyon"
          />
          <label for="direction-input">Mission</label>
          <input
            id="direction-input"
            type="text"
            v-model="desserteWithLine.desserte.vehicleNumber"
            placeholder="ex : LEON93, ARNO77"
          />
        </div>
      </div>

      <hr class="divider" />

      <div class="card-header">
        <div
          style="
            display: flex; flex-direction: row; flex-wrap: wrap; gap: 10px; align-items: center;
          "
        >
          <h3>{{ desserteWithLine.desserte.stops.length }} arrêts</h3>
          <small v-if="selectedStops.size > 0"
            >{{ selectedStops.size }} sélectionné(s)</small
          >

          <select
            v-if="selectedStops.size > 0"
            class="btn btn-outline"
            @change="handleQuickAction"
            style="padding: 4px 8px"
          >
            <option value="">Actions rapides...</option>
            <option value="make_accessible">Rendre Accessible UFR</option>
            <option value="make_inaccessible">Rendre Inaccessible UFR</option>
            <option value="add_gap">Ajouter Écart quai/véhicule</option>
            <option value="remove_gap">Enlever Écart quai/véhicule</option>
            <option value="set_skipped">
              Mettre les arrêts en arrêts non desservis
            </option>
            <option value="unset_skipped">
              Mettre les arrêts en arrêts desservis
            </option>
            <option value="change_radius">
              Changer le rayon de déclenchement
            </option>
            <option value="change_connections">
              Modifier les correspondances
            </option>
            <option value="delete" style="color: red">Supprimer</option>
          </select>
        </div>

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
            .map(
              (stop) =>
                stop.stop.name ||
                "Arrêt non paramétré n°" +
                  (desserteWithLine.desserte.stops.indexOf(stop) + 1),
            )
            .join(", ")
        }}.
      </div>
      <label v-if="sortedStops.length > 0">
        <input
          type="checkbox"
          :checked="areAllSelected"
          @change="toggleSelectAll"
        />
        Tout sélectionner
      </label>

      <div class="thermometer-list">
        <EditorStopItem
          v-for="(stop, index) in sortedStops"
          :key="stop.stop.id"
          :is-first-stop="index === 0"
          :is-selected="selectedStops.has(stop.stop.id)"
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
          @toggle-select="handleToggleSelect(stop)"
        />
      </div>
    </section>

    <dialog ref="multiLinesModalRef" class="line-edition">
      <div class="modal-header">
        <h3>Modifier les correspondances ({{ selectedStops.size }} arrêts)</h3>
        <button class="close-btn" @click="closeMultiLinesModal" title="Fermer">
          ✕
        </button>
      </div>

      <div class="modal-body">
        <p>
          Sélectionnez les lignes qui seront communes à tous les arrêts
          sélectionnés :
        </p>
        <div class="line-selection-grid">
          <label
            v-for="line in allLines"
            :key="line.id"
            class="line-checkbox-item"
            :class="{
              'is-active': selectedMultiLines.some((l) => l.id === line.id),
            }"
          >
            <input type="checkbox" :value="line" v-model="selectedMultiLines" />
            <LineLogo :line="line" class-name="line-logo-small" size="1.5rem" />
            <span class="line-name-label">{{ line.mode }} {{ line.name }}</span>
          </label>
        </div>
      </div>

      <div
        class="modal-footer"
        style="
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        "
      >
        <button class="btn btn-secondary" @click="closeMultiLinesModal">
          Annuler
        </button>
        <button class="btn btn-primary" @click="applyMultiConnections">
          Appliquer
        </button>
      </div>
    </dialog>
  </main>
</template>

<style scoped lang="css">
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #eaeaea;
  min-width: 0;
}
.card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
  flex-wrap: wrap;
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
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
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
  flex-wrap: wrap;
  align-items: flex-start;
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
  min-width: 0;
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
  width: fit-content;
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
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.line-select {
  flex: 1;
  min-width: 120px;
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
  flex-direction: row;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.operated-line-preview .mode-picto {
  width: 2.5rem;
  height: 2.5rem;
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
  min-width: 0;
}
.direction {
  margin-left: auto;
  min-width: 250px;
  flex-grow: 1;
}
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
dialog.line-edition {
  border: none;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  color: #333;
  font-family: inherit;
  margin: auto;
}
dialog.line-edition::backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a1a1a;
}
.close-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  font-weight: bold;
  transition: all 0.2s ease;
}
.close-btn:hover {
  background: #e0e0e0;
  color: #000;
}
.line-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}
.line-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}
.line-checkbox-item:hover {
  border-color: #007bff;
}
.line-checkbox-item.is-active {
  border-color: #007bff;
  background: #f0f7ff;
}
.line-checkbox-item input {
  display: none;
}
.line-name-label {
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
