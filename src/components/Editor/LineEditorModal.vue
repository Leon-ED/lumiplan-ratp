<script setup lang="ts">
import { computed, ref } from "vue";
import { Line, Mode } from "../../types";
import LineLogo from "../Other/LineLogo.vue";
import { DEFAULT_BG_COLORS, DEFAULT_TEXT_COLORS } from "../../colors.ts";

const props = defineProps<{
  line: Line | null;
  allLines: Line[];
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

const compatibleLines = computed(() => {
  if (!props.line) return [];

  return props.allLines.filter(
    (otherLine) =>
      ![
        Mode.NOCTILIEN,
        Mode.BUS_REMPLACEMENT,
        Mode.BUS,
        Mode.TER,
        Mode.BUS_AEROPORT,
      ].includes(otherLine.mode) && otherLine.id !== props.line?.id,
  );
});

const updateColorsFromLinkedLine = (linkedLine: Line | null | undefined) => {
  if (!props.line || !linkedLine) return;

  props.line.color = linkedLine.color;
  props.line.textColor = linkedLine.textColor;
};

const handleModeChange = () => {
  if (!props.line) return;

  if (props.line.mode === Mode.BUS_REMPLACEMENT && !props.line.linkedLine) {
    const firstLine = compatibleLines.value[0];

    if (firstLine) {
      props.line.linkedLine = firstLine;
      updateColorsFromLinkedLine(firstLine);
    }
  }
};

const handleLinkedLineChange = () => {
  updateColorsFromLinkedLine(props.line?.linkedLine);
};
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

        <select
          name="line-mode"
          id="line-mode"
          v-model="line.mode"
          @change="handleModeChange"
        >
          <option :value="Mode.RER">RER</option>
          <option :value="Mode.TRANSILIEN">Transilien</option>
          <option :value="Mode.METRO">Métro</option>
          <option :value="Mode.TRAM">Tramway</option>
          <option :value="Mode.CABLE">Téléphérique</option>
          <option :value="Mode.BUS">Bus</option>
          <option :value="Mode.NOCTILIEN">Noctilien</option>
          <option :value="Mode.BUS_REMPLACEMENT">Bus de remplacement</option>
          <option :value="Mode.BUS_AEROPORT">Bus aéroportuaire</option>
        </select>
      </div>
      <div class="field-group" v-if="line.mode === Mode.BUS_REMPLACEMENT">
        <label for="line-linked-line"> Remplace la ligne </label>

        <select
          name="line-linked-line"
          id="line-linked-line"
          v-model="line.linkedLine"
          @change="handleLinkedLineChange"
        >
          <option
            v-for="otherLine in compatibleLines"
            :key="otherLine.id"
            :value="otherLine"
          >
            {{ otherLine.mode }} {{ otherLine.name }}
          </option>
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
          <label for="line-color"> Couleur principale </label>

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
                v-for="color in DEFAULT_BG_COLORS"
                :key="color.hex"
                :value="color.hex"
              >
                {{ color.name }}
              </option>
            </datalist>
          </div>
        </div>

        <div class="field-group">
          <label for="line-secondary-color"> Couleur du texte </label>

          <input
            type="color"
            name="line-secondary-color"
            id="line-secondary-color"
            v-model="line.textColor"
            list="default-text-colors"
          />

          <datalist id="default-text-colors">
            <option
              v-for="color in DEFAULT_TEXT_COLORS"
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
      <img :src="'/modes/' + line.mode.toLowerCase() + '.svg'" alt="Mode" class="mode-picto" />
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
.mode-picto {
  margin-right: 12px;
  height: 5rem;
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
