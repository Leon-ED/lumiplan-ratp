<template>
  <aside class="arriving-to-in">
    <div class="text">Arrivée prévue dans</div>
    <ol class="stops-list">
      <li v-for="desserte in stopsList.slice(0, 4)" class="desserte">
        <span class="stop-name">{{ desserte.stop.name }}</span>
        <span class="minutes-before-arrival">{{
          getMinutesFromDate(desserte.timeOfArrival)
        }}</span>
      </li>
    </ol>
  </aside>
</template>
<script setup lang="ts">
interface Props {
  stopsList: {
    stop: Stop;
    timeOfArrival: Date;
  }[];
}
defineProps<Props>();

const getMinutesFromDate = (date: Date): number => {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffInMs / (1000 * 60)));
};
</script>
<style lang="css" scoped>
.arriving-to-in {
  display: flex;
  flex-direction: column;
  background-color: rgb(249, 249, 249);
  font-family: 'ParisineBold';
}
.text {
    font-size: 1.2cqw;
    font-family: 'ParisineRegular';
    padding-left: 1cqw;
    padding-top: 1cqw;
  color: gray;
}
.stops-list{
    list-style: none;
}
.desserte{
    display: grid;
    grid-template-columns: 90% 30%;
    font-size: 1.5cqw;
    align-items: center;
    justify-content: space-between;
}
.minutes-before-arrival{
    color:gray;
    font-size: 3cqw;

}
.stop-name{
    padding-left: 1cqw;
    color:var(--ratp-blue);
}
ol{
    padding: 0;
}
li{
    padding: 1cqw 0 ;
}
li:nth-child(odd){
    background-color: gainsboro;

}
</style>
