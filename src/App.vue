<template>
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :key="$route.fullPath" :is="Component" />
  </keep-alive>
</router-view>
</template>
