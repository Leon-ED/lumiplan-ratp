<template>
  <aside class="arriving-to-in">
    <table>
      <thead>
        <tr>
          <th class="destination-header">
            <Transition name="text-translation-fade" mode="out-in">
              <span
                class="translation"
                v-html="translation"
                :key="translation"
              ></span>
            </Transition>
          </th>
          <th class="minutes-header">min</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="desserte in stopsList.slice(0, 3)"
          :key="desserte.stop.id"
        >
          <td class="destination">
            {{ desserte.stop.name }}
          </td>
          <td class="minutes-before-arrival">
            {{
              isInManualMode
                ? ((desserte.travelTime ?? 60) / 60).toFixed(0)
                : getMinutesFromDate(desserte.timeOfArrival)
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </aside>
</template>

<script setup lang="ts">
import { useRotatedText } from "../../hooks/useRotatedText";
import { ETA_TEXTS } from "../../translations";
import { StopWithTime } from "../../types";
import { getMinutesFromDate } from "../../utils";

const translation = useRotatedText(ETA_TEXTS);

interface Props {
  stopsList: StopWithTime[];
  isInManualMode: boolean;
}
defineProps<Props>();

</script>

<style lang="css" scoped>
.arriving-to-in {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f4efea;
  font-family: "ParisineBold";
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

thead {
  padding: .5cqw 2.4cqw 0 2cqw;
  font-size: 1.3cqw;
  font-family: "ParisineRegular";
  color: #212121;
}

th,
td {
  padding: 0.8cqw 2cqw;
}

.destination-header,
.destination {
  text-align: left;
}

.minutes-header,
.minutes-before-arrival {
  text-align: center;
  width: 15%;
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
</style>