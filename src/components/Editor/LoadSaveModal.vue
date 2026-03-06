<script setup lang="ts">
import { ref } from "vue";
import { SaveFile } from "../../types";

const emit = defineEmits<{
  (e: "load", data: SaveFile): void;
}>();

const AUTOSAVE_KEY = "lumiplan_editor_autosave_data";

const dialogRef = ref<HTMLDialogElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref("");
const hasAutosave = ref(false);

const open = () => {
  errorMessage.value = "";
  hasAutosave.value = !!localStorage.getItem(AUTOSAVE_KEY);
  dialogRef.value?.showModal();
};

const close = () => {
  dialogRef.value?.close();
};

const triggerFileInput = () => fileInputRef.value?.click();

const processJson = (jsonString: string) => {
  try {
    const parsedData = JSON.parse(jsonString) as SaveFile;
    if (parsedData?.header && parsedData?.journey) {
      emit("load", parsedData);
      close();
    } else {
      errorMessage.value = "Le fichier ne correspond pas au format de sauvegarde attendu.";
    }
  } catch (error) {
    errorMessage.value = "Impossible de lire les données JSON. Format invalide.";
  }
};

const loadAutosave = () => {
  const autosaveData = localStorage.getItem(AUTOSAVE_KEY);
  if (autosaveData) {
    processJson(autosaveData);
  } else {
    errorMessage.value = "La sauvegarde automatique est introuvable.";
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => processJson(e.target?.result as string);
  reader.readAsText(file);
  target.value = ""; // Reset
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file && (file.type === "application/json" || file.name.endsWith(".json"))) {
    const reader = new FileReader();
    reader.onload = (e) => processJson(e.target?.result as string);
    reader.readAsText(file);
  } else {
    errorMessage.value = "Veuillez déposer un fichier .json valide.";
  }
};

defineExpose({ open, close, loadAutosave });
</script>

<template>
  <dialog ref="dialogRef" class="load-modal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>Charger une configuration</h3>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <div class="modal-body">
        <div
          class="drop-zone"
          :class="{ 'is-dragging': isDragging }"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
          @click="triggerFileInput"
        >
          <span class="drop-icon">📂</span>
          <p>Glissez votre fichier de sauvegarde <strong>JSON</strong> ici<br />ou cliquez pour parcourir.</p>
          <input type="file" accept=".json" ref="fileInputRef" @change="handleFileUpload" hidden />
        </div>

        <div v-if="hasAutosave" class="autosave-section">
          <div class="divider-text"><span>OU</span></div>
          <button class="btn-autosave" @click="loadAutosave">
            ↺ Restaurer la sauvegarde automatique
          </button>
        </div>

        <div v-if="errorMessage" class="error-msg">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped lang="css">
.load-modal {
  border: none;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 450px;
  background: #ffffff;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  color: #333;
  font-family: inherit;
}
.load-modal::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
}
.modal-content {
  padding: 24px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1a1a1a;
}
.close-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}
.close-btn:hover {
  background: #e0e0e0;
}
.drop-zone {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}
.drop-zone:hover, .drop-zone.is-dragging {
  background-color: #e7f5ff;
  border-color: #007bff;
}
.drop-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
}

.autosave-section {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}
.divider-text {
  text-align: center;
  position: relative;
  margin: 16px 0;
  color: #adb5bd;
  font-size: 0.8rem;
  font-weight: bold;
  width: 100%;
}
.divider-text::before,
.divider-text::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: #e9ecef;
}
.divider-text::before {
  left: 0;
}
.divider-text::after {
  right: 0;
}
.btn-autosave {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: 1px solid #007bff;
  background-color: #f8faff;
  color: #007bff;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-autosave:hover {
  background-color: #007bff;
  color: white;
}

.error-msg {
  margin-top: 16px;
  padding: 12px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}
</style>