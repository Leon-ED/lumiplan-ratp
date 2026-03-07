<script setup lang="ts">
import { ref } from "vue";
import { Line, Mode } from "../../types";
import LineLogo from "../Other/LineLogo.vue";

defineProps<{
  line: Line | null;
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

const defaultTextColor = [
  { name: "Blanc", hex: "#FFFFFF" },
  { name: "Noir", hex: "#000000" },
];

const defaultBgColors = [
  { name: "Bleu nuit", hex: "#00005b" },
  { name: "Bleu foncé", hex: "#003a80" },
  { name: "Bleu outremer", hex: "#0064b0" },
  { name: "Bleu clair", hex: "#51afdf" },
  { name: "Bleu canard", hex: "#003c5f" }, 
  { name: "Pervenche", hex: "#82c8e6" }, 
  { name: "Turquoise", hex: "#00a88f" },
  { name: "Vert foncé", hex: "#00814f" },
  { name: "Vert clair", hex: "#7ab829" },
  { name: "Émeraude", hex: "#198250" },
  { name: "Sapin", hex: "#00643c" },
  { name: "Bambou", hex: "#96be00" }, 
  { name: "Acacia", hex: "#d2d200" }, 
  { name: "Jaune vif", hex: "#ffcd00" },
  { name: "Jaune ocre", hex: "#dfb039" },
  { name: "Mandarine", hex: "#ff7d00" }, 
  { name: "Orange", hex: "#ed6e00" },
  { name: "Rouge coquelicot", hex: "#e3051b" },
  { name: "Rouge framboise", hex: "#d33c56" },
  { name: "Saumon", hex: "#ff645a" }, 
  { name: "Rose", hex: "#fd8db6" },
  { name: "Magenta", hex: "#cc1971" },
  { name: "Fuchsia", hex: "#dc5ab4" },
  { name: "Lilas", hex: "#c085b6" },
  { name: "Violet", hex: "#6e32c9" },
  { name: "Marron", hex: "#8d5e2a" },
  { name: "Olive clair", hex: "#a4b72b" },
  { name: "Olive foncé", hex: "#6f8021" },
  { name: "Perle", hex: "#f0dcd2" }, 
  { name: "Élysée", hex: "#6e645a" }, 
  { name: "Noir", hex: "#000000" },
];
</script>

<template>
  <dialog class="line-edition" ref="dialogRef">
    <header class="dialog-header">
      <h3>Modifier la ligne</h3>
      <button class="close-btn" @click="close" title="Fermer">✕</button>
    </header>

    <div class="line-edition_fields" v-if="line">
      <div class="field-group">
        <label for="line-mode">Mode de transport</label>
        <select name="line-mode" id="line-mode" v-model="line.mode">
          <option :value="Mode.RER">RER</option>
          <option :value="Mode.TRANSILIEN">Transilien</option>
          <option :value="Mode.METRO">Métro</option>
          <option :value="Mode.TRAM">Tramway</option>
          <option :value="Mode.CABLE">Téléphérique</option>
          <option :value="Mode.BUS">Bus</option>
          <option :value="Mode.NOCTILIEN">Noctilien</option>
        </select>
      </div>

      <div class="field-group">
        <label for="line-name">Nom de la ligne</label>
        <input
          type="text"
          name="line-name"
          id="line-name"
          v-model="line.name"
          placeholder="Ex: Ligne 1"
        />
      </div>

      <div class="color-row">
        <div class="field-group">
          <label for="line-color">Couleur principale</label>
          <div>
            <input
              type="color"
              name="line-color"
              id="line-color"
              v-model="line.color"
              list="default-colors"
            />

            <datalist id="default-colors">
              <option
                v-for="color in defaultBgColors"
                :key="color.hex"
                :value="color.hex"
              >
                {{ color.name }}
              </option>
            </datalist>
          </div>
        </div>
        <div class="field-group">
          <label for="line-secondary-color">Couleur secondaire</label>
          <input
            type="color"
            name="line-secondary-color"
            id="line-secondary-color"
            v-model="line.textColor"
            list="default-text-colors"
          />
          <datalist id="default-text-colors">
            <option
              v-for="color in defaultTextColor"
              :key="color.hex"
              :value="color.hex"
            >
              {{ color.name }}
            </option>
          </datalist>
        </div>
      </div>
    </div>

    <div class="line-edition_render" v-if="line">
      <LineLogo :line="line" class-name="line-logo" size="5rem" />
    </div>
  </dialog>
</template>

<style lang="css" scoped>
dialog.line-edition {
  border: none;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 450px;
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
select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fafafa;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

input[type="text"]:focus,
select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  background-color: #fff;
}

.color-row {
  display: flex;
  gap: 16px;
}

.color-row .field-group {
  flex: 1;
}

input[type="color"] {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  width: 100%;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: none;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: 1px solid #ddd;
  border-radius: 8px;
}

.line-edition_render {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #ccc;
}
</style>