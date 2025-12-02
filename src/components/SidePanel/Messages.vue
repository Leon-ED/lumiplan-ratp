<template>
  <div class="message">
    <img
      src="../../assets/img/info.png"
      alt="messages icon"
      class="message-icon"
    />
    <br/>
    <span class="message-text">Signalez tout comportement suspect à nos agents.</span>
  </div>
</template>
<script setup lang="ts">
</script>
<style lang="css" scoped>
.message {
  width: 100%;
  height: 100%;
  padding: 2cqw;
  box-sizing: border-box;
}
.message-icon {
  width: 4cqw;
  height: 4cqw;
  margin-right: 1cqw;
  margin-bottom: 1cqw;
}
.message-text {
  font-size: 2cqw;
  color: #212121;
}
</style>
