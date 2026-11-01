<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    viewBox="0 0 24 24"
  >
    <polyline points="16 3 21 8 16 13"></polyline>
    <line x1="21" y1="8" x2="9" y2="8"></line>
    <polyline points="8 21 3 16 8 11"></polyline>
    <line x1="3" y1="16" x2="15" y2="16"></line>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: string | number }>(), { size: 16 });
</script>
