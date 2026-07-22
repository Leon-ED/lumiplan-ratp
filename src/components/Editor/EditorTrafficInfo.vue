<script setup lang="ts">
import { SaveInfoTrafic } from "../../types";
const MAX_MESSAGES = 1;
const props = defineProps<{
  messages: SaveInfoTrafic[];
}>();

const emit = defineEmits<{
  (e: "update:messages", messages: SaveInfoTrafic[]): void;
}>();

const addMessage = () => {
  if (props.messages.length < MAX_MESSAGES) {
    emit("update:messages", [
      ...props.messages,
      { effect: "DISRUPTED", message: "" },
    ]);
  }
};

const updateMessage = (index: number, key: keyof SaveInfoTrafic, value: string) => {
  const newMessages = [...props.messages];
  newMessages[index] = { ...newMessages[index], [key]: value };
  emit("update:messages", newMessages);
};

const removeMessage = (index: number) => {
  const newMessages = [...props.messages];
  newMessages.splice(index, 1);
  emit("update:messages", newMessages);
};
</script>

<template>
  <section class="card traffic-card no-print">
    <div class="card-header">
      <h2>Informations trafic</h2>
      <span class="message-count" :class="{ 'max-reached': messages.length >= MAX_MESSAGES }">
        {{ messages.length }} / {{ MAX_MESSAGES }}
      </span>
    </div>

    <div class="traffic-list" v-if="messages.length > 0">
      <div v-for="(msg, index) in messages" :key="index" class="traffic-item">
        <div class="traffic-item-header">
          <button 
            v-if="index > 0"
            class="btn-delete" 
            @click="removeMessage(index)" 
            title="Supprimer ce message additionnel"
          >
            ✕
          </button>
        </div>
        <textarea 
          :value="msg.message" 
          @input="updateMessage(index, 'message', ($event.target as HTMLTextAreaElement).value)"
          placeholder="Ex: En raison de travaux, l'arrêt n'est pas desservi..."
          class="message-input"
          rows="3"
        ></textarea>
      </div>
    </div>

    <p v-else class="empty-state">Aucun message d'information trafic.</p>

    <button 
      class="btn btn-secondary add-btn" 
      @click="addMessage"
      :disabled="messages.length >= MAX_MESSAGES"
    >
      + Ajouter un message supplémentaire
    </button>
  </section>
</template>

<style scoped lang="css">
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #eaeaea;
  margin-top: 12px;
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
.message-count {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c757d;
  background: #f8f9fa;
  padding: 4px 10px;
  border-radius: 12px;
}
.message-count.max-reached {
  color: #dc3545;
  background: #f8d7da;
}
.traffic-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}
.traffic-item {
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.traffic-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  height: 32px; 
}
.effect-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #d9534f;
  background-color: #fdf2f2;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #fadcdc;
}
.message-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}
.message-input:focus {
  border-color: #007bff;
  outline: none;
}
.btn-delete {
  background: transparent;
  border: none;
  color: #dc3545;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  margin-left: auto;
}
.btn-delete:hover {
  background: #f8d7da;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.add-btn {
  width: 100%;
  padding: 12px;
}
.empty-state {
  color: #6c757d;
  font-style: italic;
  margin-bottom: 20px;
}
</style>