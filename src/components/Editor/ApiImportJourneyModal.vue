<script setup lang="ts">
import { ref } from "vue";
import { Desserte } from "../../types";
import { Api } from "../../api";

const emit = defineEmits<{
  (e: "import", journey: Desserte): void;
}>();
const dialogRef = ref<HTMLDialogElement | null>(null);
const apiJourneyId = ref("");
const isLoadingApi = ref(false);
const apiPreview = ref<Desserte | null>(null);
const apiError = ref("");

const open = () => {
  apiJourneyId.value = "";
  apiPreview.value = null;
  apiError.value = "";
  dialogRef.value?.showModal();
};

const close = () => {
  dialogRef.value?.close();
};

const searchApiJourney = async () => {
  if (!apiJourneyId.value.trim()) return;
  isLoadingApi.value = true;
  apiError.value = "";
  apiPreview.value = null;

  try {
    const journey = await Api.getJourney(apiJourneyId.value.trim(), false);
    if (journey) {
      apiPreview.value = journey;
    } else {
      apiError.value = "Aucune desserte trouvée pour cet identifiant.";
    }
  } catch (err) {
    apiError.value = "Erreur de connexion à l'API.";
    console.error(err);
  } finally {
    isLoadingApi.value = false;
  }
};

const confirmImport = () => {
  if (!apiPreview.value) return;
  if (
    confirm(
      "⚠️ Attention, l'importation depuis l'API va écraser la desserte actuelle. Voulez-vous continuer ?",
    )
  ) {
    emit("import", apiPreview.value);
    close();
  }
};

defineExpose({ open, close });
</script>

<template>
  <dialog ref="dialogRef" class="custom-modal">
    <header class="dialog-header">
      <h3>Importer depuis l'API</h3>
      <button class="close-btn" @click="close" title="Fermer">✕</button>
    </header>

    <div class="modal-body">
      <p class="modal-text">
        Entrez l'identifiant de la desserte pour obtenir le modèle de la desserte et des lignes en correspodances.
      </p>
      <div class="api-search-bar">
        <input
          type="text"
          v-model="apiJourneyId"
          placeholder="Ex: vehicle_journey:"
          @keyup.enter="searchApiJourney"
        />
        <button
          class="btn btn-primary"
          @click="searchApiJourney"
          :disabled="isLoadingApi"
        >
          {{ isLoadingApi ? "..." : "Chercher" }}
        </button>
      </div>

      <div v-if="apiError" class="api-error">❌ {{ apiError }}</div>

      <div v-if="apiPreview" class="api-preview">
        <h4>Aperçu de la desserte</h4>
        <p><strong>ID :</strong> {{ apiPreview.id }}</p>
        <p><strong>Direction :</strong> {{ apiPreview.direction }}</p>
        <p>
          <strong>Nombre d'arrêts :</strong>
          {{ apiPreview.stops.length }}
        </p>
      </div>
    </div>

    <footer class="modal-footer" v-if="apiPreview">
      <button class="btn btn-secondary" @click="close">Annuler</button>
      <button class="btn btn-danger" @click="confirmImport">
        Écraser et Importer
      </button>
    </footer>
  </dialog>
</template>

<style scoped lang="css">
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
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}
.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

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
}
.api-search-bar {
  display: flex;
  gap: 12px;
}
.api-search-bar input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fafafa;
  transition: border-color 0.2s;
  outline: none;
}
.api-search-bar input:focus {
  border-color: #007bff;
  background-color: #fff;
}
.api-error {
  color: #dc3545;
  font-size: 0.9rem;
  font-weight: 500;
  background: #f8d7da;
  padding: 10px;
  border-radius: 6px;
}
.api-preview {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
}
.api-preview h4 {
  margin: 0 0 12px 0;
  color: #212529;
  font-size: 1.05rem;
}
.api-preview p {
  margin: 4px 0;
  font-size: 0.95rem;
  color: #495057;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}
</style>
