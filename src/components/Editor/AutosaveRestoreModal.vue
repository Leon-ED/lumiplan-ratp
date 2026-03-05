<script setup lang="ts">
import { ref, computed } from "vue";
import { SaveFile } from "../../types";
import LineLogo from "../Other/LineLogo.vue";

const emit = defineEmits<{
  (e: "restore", data: SaveFile): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const savedData = ref<SaveFile | null>(null);

const isExpanded = ref(false);

const open = (data: SaveFile) => {
  savedData.value = data;
  isExpanded.value = false; 
  dialogRef.value?.showModal();
};

const close = () => {
  dialogRef.value?.close();
};

const confirmRestore = () => {
  if (savedData.value) {
    emit("restore", savedData.value);
    close();
  }
};

const formattedDate = computed(() => {
  if (!savedData.value?.header.dateTime) return "";
  const date = new Date(savedData.value.header.dateTime);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "medium",
  }).format(date);
});

const allStops = computed(() => {
  return savedData.value?.journey.desserte.stops || [];
});

const firstStopName = computed(() => {
  if (allStops.value.length === 0) return "Aucun arrêt";
  return allStops.value[0].stop.name || "Arrêt sans nom";
});

const lastStopName = computed(() => {
  if (allStops.value.length <= 1) return "";
  return (
    allStops.value[allStops.value.length - 1].stop.name || "Arrêt sans nom"
  );
});

const middleStops = computed(() => {
  if (allStops.value.length <= 2) return [];
  return allStops.value.slice(1, -1);
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

defineExpose({ open, close });
</script>

<template>
  <dialog ref="dialogRef" class="custom-modal autosave-modal">
    <header class="dialog-header">
      <h3>Sauvegarde trouvée</h3>
      <button class="close-btn" @click="close" title="Ignorer">✕</button>
    </header>

    <div class="modal-body" v-if="savedData">
      <p class="modal-text">
        Il semblerait que vous ayez quitté la page lors de votre dernière
        session. Voulez-vous reprendre là où vous en étiez ?
      </p>

      <div class="save-preview">
        <div class="preview-header">
          <LineLogo
            :line="savedData.journey.line"
            class-name="line-logo"
            size="2.5rem"
          />
          <div class="preview-title">
            <strong>{{ savedData.header.name || "Projet sans nom" }}</strong>
            <span class="save-date">Modifié le {{ formattedDate }}</span>
          </div>
        </div>

        <div class="preview-route">
          <div class="route-point">
            <span class="dot origin"></span>
            <span>{{ firstStopName }}</span>
          </div>

          <template v-if="middleStops.length > 0">
            <button class="expand-btn" @click="toggleExpand">
              <span class="route-line-dotted"></span>
              <span class="expand-text">
                {{
                  isExpanded
                    ? "▲ Masquer"
                    : `▼ ${middleStops.length} arrêt${middleStops.length > 1 ? "s" : ""} supplémentaire${middleStops.length > 1 ? "s" : ""}`
                }}
              </span>
            </button>

            <div v-show="isExpanded" class="middle-stops-list">
              <div
                v-for="stop in middleStops"
                :key="stop.stop.id"
                class="route-point middle-point"
              >
                <span class="dot small"></span>
                <span>{{ stop.stop.name || "Arrêt sans nom" }}</span>
              </div>
            </div>

            <div class="route-line" v-show="!isExpanded"></div>
          </template>

          <div class="route-line" v-else-if="allStops.length > 1"></div>

          <div class="route-point" v-if="allStops.length > 1">
            <span class="dot terminus"></span>
            <span>{{ lastStopName }}</span>
          </div>
        </div>
      </div>

      <p class="info-text">
        <em
          >Note : Si vous ignorez ce message, la sauvegarde ne sera pas
          supprimée, mais elle sera écrasée lors de votre prochaine
          modification.</em
        >
      </p>
    </div>

    <footer class="modal-footer">
      <button class="btn btn-secondary" @click="close">Ignorer</button>
      <button class="btn btn-primary" @click="confirmRestore">
        Restaurer la session
      </button>
    </footer>
  </dialog>
</template>

<style scoped lang="css">
dialog.custom-modal {
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
dialog.custom-modal::backdrop {
  background: rgba(0, 0, 0, 0.5);
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
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal-text {
  font-size: 0.95rem;
  color: #555;
  margin: 0;
  line-height: 1.4;
}

.save-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.preview-header {
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 16px;
}
.preview-title {
  display: flex;
  flex-direction: column;
  text-wrap: wrap;
  word-break: break-all;
  flex-wrap: wrap;
  gap: 4px;
}
.preview-title strong {
  font-size: 1.1rem;
  color: #212529;
}
.save-date {
  font-size: 0.85rem;
  color: #6c757d;
}
.preview-route {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 8px;
}
.route-point {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: #495057;
  min-height: 24px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #000;
  background: #fff;
  z-index: 2;
  flex-shrink: 0;
}
.dot.origin {
  border-color: #007bff;
}
.dot.terminus {
  border-color: #333;
  background: #333;
}

.middle-point {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 400;
}
.dot.small {
  width: 8px;
  height: 8px;
  border: 2px solid #adb5bd;
  margin-left: 2px; 
}

.route-line {
  width: 4px;
  height: 16px;
  background-color: #dee2e6;
  margin-left: 7px;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: pointer;
  color: #007bff;
  font-size: 0.85rem;
  font-weight: 600;
  transition: opacity 0.2s;
  width: fit-content;
}
.expand-btn:hover {
  opacity: 0.7;
}

.route-line-dotted {
  width: 4px;
  height: 24px;
  background-image: linear-gradient(to bottom, #dee2e6 50%, transparent 50%);
  background-size: 100% 8px; 
  margin-left: 7px;
}

.middle-stops-list {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 4px; 
  position: relative;
}

.middle-stops-list::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #dee2e6;
  z-index: 1;
}

.info-text {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover {
  background-color: #0056b3;
}
.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
}
.btn-secondary:hover {
  background-color: #dde2e6;
}
</style>
