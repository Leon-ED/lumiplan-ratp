<script setup lang="ts">
import { ref } from "vue";
import { Line, StopWithTime } from "../../types";
import LineLogo from "../Other/LineLogo.vue";

defineProps<{
  allLines: Line[];
  stop: StopWithTime | null;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

const open = () => {
  dialogRef.value?.showModal();
};

const close = () => {
  dialogRef.value?.close();
};

defineExpose({
  open,
});
</script>

<template>
  <dialog class="line-edition" ref="dialogRef">
    <header class="dialog-header">
      <h3>Modifier l'arrêt</h3>
      <button class="close-btn" @click="close" title="Fermer">✕</button>
    </header>

    <div class="line-edition_fields" v-if="stop">
      <div class="field-group">
        <label for="stop-name">Nom de l'arrêt</label>
        <input
          type="text"
          id="stop-name"
          v-model="stop.stop.name"
          placeholder="Ex: Châtelet"
        />
      </div>

      <div class="row-fields">
        <div class="field-group">
          <label for="stop-landmark">Sous-titre</label>
          <input
            type="text"
            id="stop-landmark"
            v-model="stop.stop.landmarkName"
            placeholder="Ex: Grande Arche"
          />
        </div>
      </div>
      <div class="row-fields">
        <div class="field-group">
          <label for="stop-time">Heure d'arrivée</label>
          <input type="time" id="stop-time" v-model="stop.timeOfArrival" />
        </div>
        <div class="field-group">
          <label for="stop-time-departure">Heure de départ</label>
          <input type="time" id="stop-time-departure" v-model="stop.timeOfDeparture" />
        </div>
      </div>

      <div class="checkbox-grid">
        <label class="checkbox-item">
          <input type="checkbox" v-model="stop.stop.isAccessible" />
          <span>Accès UFR</span>
        </label>
        <!-- <label class="checkbox-item">
          <input type="checkbox" v-model="stop.isTerminus" />
          <span>Terminus</span>
        </label>
        <label class="checkbox-item">
          <input type="checkbox" v-model="stop.isFirstStop" />
          <span>Premier arrêt</span>
        </label> -->
        <label class="checkbox-item">
          <input type="checkbox" v-model="stop.isStopSkipped" />
          <span>Arrêt non desservi</span>
        </label>
      </div>

      <div class="field-group">
        <label>Lignes en correspondance (0 à plusieurs)</label>
        <div class="connected-lines-list">
          <div v-if="allLines.length === 0" class="empty-lines">
            Aucune ligne disponible.
          </div>

          <label
            class="connected-line-item"
            v-for="line in allLines"
            :key="line.id"
          >
            <input
              type="checkbox"
              :value="line"
              v-model="stop.stop.connectedLines"
            />
            <LineLogo :line="line" class-name="line-logo-small" size="1.5rem" />
            <span class="line-name-label">{{ line.mode }} {{ line.name }}</span>
          </label>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style lang="css" scoped>
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
}

dialog.line-edition::backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-header h3 {
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

.line-edition_fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row-fields {
  display: flex;
  gap: 16px;
}

.row-fields .field-group {
  flex: 1;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
}

input[type="text"],
input[type="time"] {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fafafa;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
  font-family: inherit;
}

input[type="text"]:focus,
input[type="time"]:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  background-color: #fff;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #444;
}

.checkbox-item input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #007bff;
}

.connected-lines-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 160px; 
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  background-color: #fafafa;
}

.connected-line-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.connected-line-item:hover {
  background-color: #ebebeb;
}

.connected-line-item input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #007bff;
}

.line-name-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.empty-lines {
  padding: 12px;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  font-style: italic;
}
</style>
