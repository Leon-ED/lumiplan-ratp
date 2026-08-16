<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :key="$route.fullPath" :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script setup lang="ts">
import { useAnimatedFavicon } from "./composables/useAnimatedFavicon";
useAnimatedFavicon();
</script>
