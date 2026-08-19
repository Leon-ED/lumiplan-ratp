<template>
  <router-view v-slot="{ Component }">
      <component :key="$route.fullPath" :is="Component" />
  </router-view>
</template>
<script setup lang="ts">
import { useAnimatedFavicon } from "./composables/useAnimatedFavicon";
useAnimatedFavicon();
</script>
