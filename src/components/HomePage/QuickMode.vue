<template>
  <div class="quick-mode-btn" @click="onClick">
    <span class="quick-mode-btn-text">{{ name }}</span>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  onClick: () => void;
  name: string;
}>();
</script>
<style scoped>
.quick-mode-btn {
  background-color: #005fad;
  opacity: 0.7;
  color: white;
  padding: 0.2rem 0.3rem;
  border-radius: 0.2rem;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  cursor: pointer;
  display: inline-block;
  transition: background-color 0.3s ease;
}
.quick-mode-btn:hover {
  background-color: #005a9e;
}
.quick-mode-btn-text {
  font-size: 0.8em;
  font-weight: bold;
}
@media (prefers-color-scheme: dark) {
  .quick-mode-btn {
    border: gray 0.5px solid;
    opacity: 0.85;
  }
  .quick-mode-btn:hover {
    background-color: #004880;
  }
}
</style>
