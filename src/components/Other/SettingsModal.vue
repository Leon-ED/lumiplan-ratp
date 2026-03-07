<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  fullScreen: boolean;
  modelValue: boolean; 
}>();

const emit = defineEmits<{
  (e: "toggle-full-screen"): void;
  (e: "update:modelValue", value: boolean): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

const localAutoPass = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  localAutoPass.value = newVal;
});

watch(localAutoPass, (newVal) => {
  emit("update:modelValue", newVal);
});

const open = () => {
  dialogRef.value?.showModal();
};

const close = () => {
  dialogRef.value?.close();
};

defineExpose({ open, close });
</script>

<template>
  <dialog ref="dialogRef" class="custom-modal settings-modal">
    <header class="modal-header">
      <h3>Paramètres de l'écran</h3>
      <button class="close-btn" @click="close" title="Fermer">✕</button>
    </header>
    <div class="modal-body">
      <label class="setting-item">
        <input
          type="checkbox"
          :checked="fullScreen"
          @change="emit('toggle-full-screen')"
        />
        <span>Mode plein écran</span>
      </label>

      <label class="setting-item">
        <input type="checkbox" v-model="localAutoPass" />
        <span>Passage automatique des arrêts (basé sur l'heure)</span>
      </label>
    </div>
  </dialog>
</template>

<style scoped lang="css">
dialog.custom-modal {
  border: none;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 450px;
  background: #ffffff;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  color: #333;
  font-family: inherit;
  margin: auto;
}
dialog.custom-modal::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
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
.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 1rem;
  color: #495057;
  cursor: pointer;
}
.setting-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
</style>