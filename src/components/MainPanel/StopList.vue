<script setup lang="ts">
defineProps<{ stops: StopWithTime[]; primaryColor: string }>();
</script>

<template>
  <div class="stops-list-container">
    <ol class="stops-list">
      <TransitionGroup
        name="stop-transition"
        tag="div"
        class="stops-transition-wrapper"
      >
        <li
          v-for="stop in stops.slice(0, 2)"
          :key="stop.stop.name"
          class="stop blinkable"
          :class="{ 'is-last-stop': stop.isTerminus }"
        >
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
  background-color: var(--ratp-blue); /* Fallback */
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

/* La ligne infinie en arrière-plan */
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

.stop.is-last-stop::after {
  content: "";
  position: absolute;
  left: 2cqw;
  width: 2.5cqw;
  top: 5cqw;
  height: 2000px;
  background-color: var(--ratp-beige);
  z-index: 1;
  pointer-events: none;
}

.stop-indicator {
  width: 3cqw;
  height: 3cqw;
  background-color: white;
  border: .5cqw solid black;
  border-radius: 50%;
  left: 1.2cqw;
  top: 0.7cqw;
  position: relative;
  z-index: 2; /* Important : au-dessus du masque ::after */
  flex-shrink: 0;
}

.next-stop .stop-indicator {
  border-radius: 0;
  background-color: transparent;
  border: none;
  width: 2.5cqw;
  height: 2.5cqw;
  left: 0.9cqw;
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
  0%,
  49% {
    background-color: var(--ratp-yellow);
  }
  50%,
  100% {
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
  width: 100%;
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

.stop.is-last-stop .stop-name {
  background-color: black;
  color: white;
  padding: 0.6cqw;
}
</style>
