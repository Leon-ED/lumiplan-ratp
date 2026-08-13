<template>
  <div class="landmark-container">
    <img
      src="../../assets/img/left-triangle-brown.png"
      alt="lines connection icon"
      class="triangle-icon"
    />
    <div class="container">
      <div class="content">
        <div class="landmark-name">
          {{ landmark }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  landmark: string;
}>();

</script>
<style lang="css" scoped>
.landmark-container {
  background-color: #6E491E;

  width: 100%;
  position: relative;
  padding: 0;
  height: 100%;
  overflow: visible;
}

.container {
  background-color: #6E491E;
  position: relative;
  z-index: 4;
  box-sizing: border-box;
  padding: 1.5cqw;
  padding-top: 0.5cqw;
  width: 100%;
  height: 100%;
}

.header {
  color: #212121;
  font-size: 1.6cqw;
  margin-bottom: 1cqw;
}
.content {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1cqw;
  height: 95%;
}
.mode-logo {
  height: 3.8cqw;
  width: auto;
}
.mode-group {
  display: flex;
  gap: 0.4em;
}
.landmark-name {
    border-top: .2cqw solid white;
    color: white;
    font-weight: bold;
    font-size: 2.5cqw;
    font-style: italic;
}
.lines-list {
  display: flex;
  gap: 0.4em;
  flex-wrap: wrap;
}
.triangle-icon {
  position: absolute;
  top: 5.2cqw;
  left: -6.5%;
  height: 5cqw;
  width: auto;
  opacity: 0;
  transform: translateX(100%);
  z-index: 1; /* triangle derrière */
  animation: slide-from-behind .4s ease-out 1.17s forwards;
  display: none;
}

@keyframes slide-from-behind {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  1% {
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
