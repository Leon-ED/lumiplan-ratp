<script setup lang="ts">
import { ref } from "vue";
import { SaveFile } from "../../types";

const emit = defineEmits<{
  (e: "load", data: SaveFile): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref("");

const open = () => {
  errorMessage.value = "";
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
    errorMessage.value = "Impossible de lire le fichier JSON. Format invalide.";
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

defineExpose({ open, close });
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