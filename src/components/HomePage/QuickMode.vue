<template>
  <button class="quick-mode-btn" @click="onClick">
    <span class="quick-mode-btn-text">{{ name }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  onClick: () => void;
  name: string;
}>();
</script>

<style scoped>
.quick-mode-btn {
  background-color: #f0f4f8;
  color: #005fad;
  border: 1px solid #cce0f5;
  padding: 0.5rem 1rem;
  border-radius: 999px; 
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.quick-mode-btn:hover {
  background-color: #005fad;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 95, 173, 0.2);
}

.quick-mode-btn-text {
  font-size: 0.9em;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .quick-mode-btn {
    background-color: #1e293b;
    color: #60a5fa;
    border: 1px solid #334155;
  }
  
  .quick-mode-btn:hover {
    background-color: #2563eb;
    color: white;
  }
}
</style>