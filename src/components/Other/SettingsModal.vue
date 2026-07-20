<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useClock } from "../../composables/useClock";

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

watch(
  () => props.modelValue,
  (newVal) => {
    localAutoPass.value = newVal;
  },
);
const { setCurrentTime, now } = useClock();
const simulatedTime = computed({
  get() {
    return `${String(now.value.getHours()).padStart(2, "0")}:${String(
      now.value.getMinutes(),
    ).padStart(2, "0")}`;
  },
  set(value: string) {
    if (!value) return;
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
    const date = new Date(now.value);
    date.setHours(hours, minutes, 0, 0);

    setCurrentTime(date);
  },
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
<label class="time-setting">
  <span>Heure simulée</span>

  <input
    type="time"
    v-model="simulatedTime"
    step="60"
    class="time-input"
  />
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
.time-setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f8f9fa;
}

.time-setting span {
  font-size: 1rem;
  color: #495057;
  font-weight: 500;
}

.time-input {
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1rem;
  font-family: inherit;
  background: white;
  color: #212529;
  transition: border-color .2s, box-shadow .2s;
  cursor: pointer;
}

.time-input:hover {
  border-color: #4a90e2;
}

.time-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, .15);
}

.time-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}
</style>
