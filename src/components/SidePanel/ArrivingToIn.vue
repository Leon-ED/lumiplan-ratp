<template>
  <aside class="arriving-to-in">
    <table cellpadding="15">
      <thead>
        <tr>
          <th class="destination-header">Arrivée prévue dans</th>
          <th class="minutes-header">min</th>
        </tr>
      </thead>  
      <tbody>
        <tr
          v-for="desserte in stopsList.slice(0, 3)"
          :key="desserte.stop.id"
        >
          <td class="destination">
            {{ desserte.stop.name }}</td>
          <td class="minutes-before-arrival">{{
            getMinutesFromDate(desserte.timeOfArrival)
          }}</td>
        </tr>
      </tbody>
    </table>
  </aside>
</template>
<script setup lang="ts">
import { StopWithTime } from "../../types";
import { getMinutesFromDate } from "../../utils";

interface Props {
  stopsList: StopWithTime[];
}
defineProps<Props>();
</script>
<style lang="css" scoped>
.arriving-to-in {
  display: flex;
  flex-direction: column;
  background-color: #f4efea;
  font-family: "ParisineBold";
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead {
  padding: .5cqw 2.4cqw 0 2cqw;
  font-size: 1.3cqw;
  font-family: "ParisineRegular";
  color: #212121;
}

.minutes-before-arrival {
  color: black;
  font-size: 3cqw;
}
.destination {
  font-size: 1.5cqw;
  color: var(--ratp-blue);
}

tbody tr {
  padding: 1cqw 2cqw;
}
tbody tr:nth-child(odd) {
  background-color: #dedad6;
}
.minutes-before-arrival {
  text-align: center;
}
.destination,.destination-header {
  text-align: left;
}
</style>
