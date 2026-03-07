<script setup lang="ts">
import { DesserteWithLine, Line, StopWithTime } from "../../types";
import LineLogo from "../Other/LineLogo.vue";
import EditorStopItem from "./EditorStopItem.vue";

defineProps<{
  desserteWithLine: DesserteWithLine;
  sortedStops: StopWithTime[];
  allLines: Line[];
}>();

const emit = defineEmits<{
  (e: "edit-operated-line", line: Line): void;
  (e: "add-stop"): void;
  (e: "edit-stop", stop: StopWithTime): void;
  (e: "select-base-line", lineId: string): void;
}>();

const onBaseLineChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  emit("select-base-line", select.value);
};

const exportToPDF = () => {
  window.print();
};
</script>

<template>
  <main class="main-content">
    <section
      class="card main-service-card printable-area"
      :style="{ '--route-color': desserteWithLine.line.color }"
    >
      <div class="print-header" style="display: none">
        <div class="print-direction">
          <LineLogo
            :line="desserteWithLine.line"
            class-name="line-logo"
            size="4rem"
          />
          <span class="origin">
          {{
            desserteWithLine.desserte.stops.length > 2
              ? desserteWithLine.desserte.stops[0].stop.name
              : ""
          }}
          </span>
          <span class="print-arrow">➔</span>
          {{ desserteWithLine.desserte.direction || "Direction non définie" }}
        </div>
      </div>

      <div class="card-header no-print">
        <h2>Mon service</h2>
      </div>

      <div class="service-config no-print">
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
                {{ line.mode }} {{ line.name }}
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
        </div>
      </div>

      <hr class="divider no-print" />

      <div class="card-header">
        <h3>{{ desserteWithLine.desserte.stops.length }} arrêts</h3>
        <div class="action-buttons no-print">
          <button class="btn btn-outline" @click="exportToPDF">
            PDF
          </button>
          <button class="btn btn-secondary" @click="emit('add-stop')">
            + Ajouter un arrêt
          </button>
        </div>
      </div>

      <div class="thermometer-list">
        <EditorStopItem
          v-for="stop in sortedStops"
          :key="stop.stop.id"
          :stop="stop"
          :route="desserteWithLine.line"
          @edit-stop="emit('edit-stop', stop)"
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
.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}
.btn-secondary:hover {
  background-color: #e0e0e0;
}
.btn-outline {
  background-color: transparent;
  color: #495057;
  border: 1px solid #ced4da;
}
.btn-outline:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}
.service-config {
  display: flex;
  align-items: center;
  gap: 10px;
}
@media (max-width: 600px) {
  .service-config {
    grid-template-columns: 1fr;
  }
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-group label {
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
}

</style>

<style lang="css">
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body * {
    visibility: hidden;
  }

  .printable-area,
  .printable-area * {
    visibility: visible;
  }

  .printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px; 
    box-shadow: none !important;
    border: none !important;
    background: white !important;
  }

  .printable-area .no-print {
    display: none !important;
  }

  .printable-area .print-header {
    display: block !important;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #000;
  }

  .print-direction {
    font-size: 2.5rem;
    font-weight: bold;
    color: #000;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .print-arrow {
    font-size: 3rem;
  }

  .thermometer-list {
    page-break-inside: auto;
  }
}
</style>
