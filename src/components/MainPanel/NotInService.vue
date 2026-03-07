<template>
  <div class="not-in-service">
    <img
      src="../../assets/img/not-in-service.png"
      alt="Terminus. Ce véhicule ne prend plus de voyageurs"
      class="image"
    />
  </div>
</template>

<style scoped>
.not-in-service {
  width: 100%;
  height: 100%;
  background-color: var(--ratp-yellow) !important;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  overflow: hidden;
}

.image {
  width: 80%;
  display: block;
}
.fullscreen .image{
  width: 100%;
}
</style>