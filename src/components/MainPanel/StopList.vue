<script setup lang="ts">
defineProps<{ stops: StopWithTime[]; primaryColor: string }>();
</script>
<template>
  <div class="stops-list-container">
    <ol class="stops-list">
      <!-- <li class="stop next-stop">
        <div class="stop-indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            class="arrow-icon"
          >
            <path
              d="M297.4 566.6C309.9 579.1 330.2 579.1 342.7 566.6L502.7 406.6C515.2 394.1 515.2 373.8 502.7 361.3C490.2 348.8 469.9 348.8 457.4 361.3L352 466.7L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 466.7L182.6 361.3C170.1 348.8 149.8 348.8 137.3 361.3C124.8 373.8 124.8 394.1 137.3 406.6L297.3 566.6z"
            />
          </svg>
        </div>
        <span>Prochains arrêts</span>
      </li> -->
      <TransitionGroup
        name="stop-transition"
        tag="div"
        class="stops-transition-wrapper"
      >
        <li v-for="stop in stops.slice(0, 2)" :key="stop.stop.name" class="stop blinkable" :class="{'is-last-stop' : stop.isTerminus}">
          <div class="stop-indicator"></div>
          <span class="stop-name">{{ stop.stop.name }}</span>
        </li>
      </TransitionGroup>
    </ol>
  </div>
</template>

<style lang="css" scoped>
.stops-list-container {
  overflow: hidden;
  height: 100%;
  width: 100%;
  background-color: var(--ratp-blue);
  font-family: "ParisineBold", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: var(--ratp-beige);
  color: white;
}

.stops-list {
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  justify-content: space-around;
  padding-right: 2cqw;
}
.stops-list::before {
  content: "";
  position: absolute;
  left: 2cqw;
  top: -1000px;
  bottom: 0;
  width: 2.5cqw;
  height: 100000px;
  background-color: v-bind(primaryColor);
  z-index: 1;
}

.stop {
  font-size: 4cqw;
  display: flex;
  gap: 3cqw;
  padding: 2cqw 0;
  position: relative;
}

.stop-indicator {
  width: 2.5cqw;
  height: 2.5cqw;
  background-color: white;
  border: 0.3cqw solid black;
  border-radius: 50%;
  left: 1.7cqw;
  top: .7cqw;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.next-stop .stop-indicator {
  border-radius: 0;
  background-color: transparent;
  border: none;
  width: 2.5cqw;
  height: 2.5cqw;
  left: .9cqw;
  top: 0cqw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  width: 100%;
  height: 100%;
  fill: white;
}

.stop-name {
  color: var(--ratp-blue);
}

.next-stop {
  font-family: "ParisineRegular";
  font-size: 2.1cqw;
  color: gray;
  padding: 0;
  padding-left: 2cqw;
}

.blinkable:first-of-type .stop-indicator {
  animation: blink 1.2s infinite steps(1);
}

@keyframes blink {
  0%, 49% {
    background-color: var(--ratp-yellow);
  }
  50%, 100% {
    background-color: white;
  }
}

.stops-transition-wrapper {
  display: contents;
}

/* Animations pour les transitions */
.stop-transition-enter-active,
.stop-transition-leave-active {
  transition: transform 1s ease-in-out;
  z-index: 10;
}

.stop-transition-enter-active .stop-indicator,
.stop-transition-leave-active .stop-indicator {
  z-index: 10;
}
.stop-transition-leave-active {
  transition: transform 1s ease-in-out;
  z-index: 10;
  
  position: absolute; 
  width: 100%; /* Nécessaire car en absolute l'élément perd sa largeur implicite */
  /* ------------------------ */
}
.stop-transition-enter-from {
  transform: translateY(100%);
}

.stop-transition-leave-to {
  transform: translateY(-200%);
}

.stop-transition-move {
  transition: transform 1s ease-in-out;
  z-index: 10;

}
.stop.is-last-stop .stop-name{
    background-color: black;
    color:white;
    padding: .6cqw;
}
</style>
