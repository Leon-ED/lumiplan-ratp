<template>
  <aside class="arriving-to-in">
    <div class="text">Correspondances</div>
    <ol class="departures-list">
      <li class="departure">
        <div class="line-and-mode">
          <img src="../../assets/a.svg" alt="303" class="picto" />
        </div>
        <span class="destination">La défense</span>
        <span class="minutes-before-arrival">1</span>
      </li>
      <li class="departure">
        <div class="line-and-mode">
          <img src="../../assets/a.svg" alt="303" class="picto" />
        </div>
        <span class="destination">Torcy</span>
        <span class="minutes-before-arrival">6</span>
      </li>
    </ol>
  </aside>
</template>
<script setup lang="ts">
// interface Props {
//   stopsList: {
//     stop: Stop;
//     timeOfArrival: Date;
//   }[];
// }
// defineProps<Props>();

const getMinutesFromDate = (date: Date): number => {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffInMs / (1000 * 60)));
};
</script>
<style lang="css" scoped>
.line-and-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2em;
  gap: 0.5em;
}
.line-and-mode .picto {
  height: 80%;
  width: fit-content;
}
.arriving-to-in {
  display: flex;
  flex-direction: column;
  background-color: rgb(249, 249, 249);
  font-family: "ParisineBold";
}
.text {
  font-size: 1.2cqw;
  font-family: "ParisineRegular";
  padding-left: 1cqw;
  padding-top: 1cqw;
  color: gray;
}
ol {
  list-style: none;
}
.departure {
  display: grid;
  grid-template-columns: 15% 75% 10%;
  font-size: 1.5cqw;
  align-items: center;
  justify-content: space-between;
}
.minutes-before-arrival {
  color: gray;
  font-size: 3cqw;
}

.destination {
  justify-self: flex-start;
  font-size: 2cqw;
  color: var(--ratp-blue);
}
ol {
  padding: 0;
}
li {
  padding: 1cqw 0;
}
li:nth-child(odd) {
  background-color: gainsboro;
}
</style>
