<script setup lang="ts">
import { ref, computed } from "vue";
import { Line, Mode } from "../../types";
import LineLogo from "../Other/LineLogo.vue";

const props = defineProps<{
  lines: Line[];
  selectedLine?: Line | null;
  fileName: string;
  copySuccess: boolean;
  downloadSuccess: boolean;
}>();

const emit = defineEmits<{
  (e: "update:fileName", value: string): void;
  (e: "add-line"): void;
  (e: "edit-line", line: Line): void;
  (e: "delete-line", line: Line): void;
  (e: "select-base-line", lineId: string): void;
  (e: "copy-export"): void;
  (e: "download-export"): void;
  (e: "open-api"): void;
  (e: "import-json", jsonString: string): void;
}>();

const searchQuery = ref("");
const selectedMode = ref<string>("ALL");
const availableModes = Object.values(Mode);

const filteredLines = computed(() => {
  const filtered = props.lines.filter((line) => {
    if(selectedMode.value === 'UNCONFIGURED' && line.name == 'TODO !' && line.mode === Mode.BUS){
      return true;
    }
    // 1. Filtre par nom
    const matchesSearch = line.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());

    // 2. Filtre  mode
    const matchesMode =
      selectedMode.value === "ALL" || line.mode === selectedMode.value;


    // La ligne sélectionnée tjs en 1ère
    if (props.selectedLine && line.id === props.selectedLine.id) {
      return matchesSearch && matchesMode;
    }

    return matchesSearch && matchesMode;
  });

  return filtered.sort((a, b) => {
    if (props.selectedLine && a.id === props.selectedLine.id) return -1;
    if (props.selectedLine && b.id === props.selectedLine.id) return 1;
    return 0; 
  });
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const updateFileName = (e: Event) => {
  emit("update:fileName", (e.target as HTMLInputElement).value);
};

const triggerFileInput = () => fileInputRef.value?.click();

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => emit("import-json", e.target?.result as string);
  reader.readAsText(file);
  target.value = "";
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
  if (
    file &&
    (file.type === "application/json" || file.name.endsWith(".json"))
  ) {
    const reader = new FileReader();
    reader.onload = (e) => emit("import-json", e.target?.result as string);
    reader.readAsText(file);
  } else {
    alert("Veuillez déposer un fichier .json valide.");
  }
};
</script>

<template>
  <aside class="sidebar">
    <section class="card mb-24">
      <div class="card-header">
        <h2>Lignes disponibles</h2>
        <button class="btn btn-primary btn-sm" @click="emit('add-line')">
          + Nouvelle
        </button>
      </div>

      <div class="filters-container" v-if="lines.length > 0">
        <select v-model="selectedMode" class="mode-select">
          <option value="ALL">Tous les modes</option>
          <option value="UNCONFIGURED">Lignes non configurées</option>
          <option v-for="mode in availableModes" :key="mode" :value="mode">
            {{ mode }}
          </option>
        </select>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher (ex: 1, A...)"
          class="search-input"
        />
      </div>

      <div class="my-lines" v-if="filteredLines.length > 0">
        <div
          v-for="line in filteredLines"
          :key="line.id"
          class="line-item-container"
        >
          <button
            v-if="!selectedLine || line.id !== selectedLine.id"
            class="action-btn select-line-btn"
            title="Définir comme service principal"
            @click.stop="emit('select-base-line', line.id)"
          >
            📌
          </button>

          <button
            v-if="!selectedLine || line.id !== selectedLine.id"
            class="action-btn delete-line-btn"
            title="Supprimer cette ligne"
            @click.stop="emit('delete-line', line)"
          >
            ✕
          </button>

          <div
            class="clickable line-item"
            :class="{
              'is-selected': selectedLine && line.id === selectedLine.id,
            }"
            title="Modifier cette ligne"
            @click="emit('edit-line', line)"
          >
            <LineLogo :line="line" class-name="line-logo" :size="'3rem'" />
            <span class="line-edit-hint">Éditer</span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else-if="lines.length > 0">
        Aucune ligne ne correspond à votre recherche.
      </div>
      <div class="empty-state" v-else>
        Aucune ligne créée. Commencez par en ajouter une.
      </div>
    </section>

    <section class="card mb-24">
      <div class="card-header">
        <h2>Sauvegarder</h2>
      </div>
      <div class="export-actions">
        <div class="field-group">
          <input
            type="text"
            :value="fileName"
            @input="updateFileName"
            placeholder="Nom du fichier..."
            class="input-sm"
          />
        </div>
        <button
          class="btn btn-primary"
          @click="emit('download-export')"
          :class="{ 'success-state': downloadSuccess }"
        >
          {{ downloadSuccess ? "✓ Téléchargé !" : "Exporter (.json)" }}
        </button>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <h2>Importer</h2>
      </div>
      <div class="import-actions">
        <button class="btn btn-primary mb-16" @click="emit('open-api')">
          Importer depuis l'API
        </button>
        <div
          class="drop-zone"
          :class="{ 'is-dragging': isDragging }"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
          @click="triggerFileInput"
        >
          <span class="drop-icon">📂</span>
          <p>
            Glissez un JSON ici<br />ou <strong>cliquez pour parcourir</strong>.
          </p>
          <input
            type="file"
            accept=".json"
            ref="fileInputRef"
            @change="handleFileUpload"
            hidden
          />
        </div>
      </div>
    </section>
  </aside>
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
.mb-24 {
  margin-bottom: 24px;
}
.mb-16 {
  margin-bottom: 16px;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
  width: auto;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover {
  background-color: #0056b3;
}
.success-state {
  background-color: #d4edda !important;
  color: #155724 !important;
  border-color: #c3e6cb !important;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
input[type="text"],
.search-input,
.mode-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #fafafa;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
  outline: none;
}
input[type="text"]:focus,
.search-input:focus,
.mode-select:focus {
  border-color: #007bff;
  background-color: #fff;
}
.empty-state {
  color: #888;
  font-size: 0.9rem;
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ddd;
}
.export-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.import-actions {
  display: flex;
  flex-direction: column;
}
.drop-zone {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}
.drop-zone p {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.4;
}
.drop-zone .drop-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
  color: #adb5bd;
}
.drop-zone:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}
.drop-zone.is-dragging {
  background-color: #e7f5ff;
  border-color: #007bff;
}
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.mode-select {
  cursor: pointer;
}
.my-lines {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
  padding-left: 10px;
  padding-top: 8px;
  padding-bottom: 60px;
}
.my-lines::-webkit-scrollbar {
  width: 6px;
}
.my-lines::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.my-lines::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
.my-lines::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
.toggle-bus-btn {
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.toggle-bus-btn:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.line-item-container {
  position: relative;
}

.line-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  height: 100%;
}

.line-item:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.line-item.is-selected {
  background-color: #eaf4ff;
  border-color: #007bff;
  box-shadow: 0 0 0 1px #007bff;
}
.line-item.is-selected:hover {
  background-color: #e1efff;
}

.selected-badge {
  font-size: 0.65rem;
  font-weight: bold;
  color: #007bff;
  text-transform: uppercase;
  margin-bottom: -2px;
  text-align: center;
}

.line-edit-hint {
  font-size: 0.75rem;
  color: #adb5bd;
  font-weight: 500;
}

.action-btn {
  position: absolute;
  top: -6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.2s,
    transform 0.2s;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  transform: scale(1.1);
}

.delete-line-btn {
  right: -6px;
  background-color: #ff4d4f;
  color: white;
  font-size: 10px;
}
.delete-line-btn:hover {
  background-color: #c82333;
}

.select-line-btn {
  left: -6px;
  background-color: #ffd700;
  color: #000;
  font-size: 12px;
}
.select-line-btn:hover {
  background-color: #ffc107;
}

.line-item-container:hover .action-btn {
  opacity: 1;
}
</style>