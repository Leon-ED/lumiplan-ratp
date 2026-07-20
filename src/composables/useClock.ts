import { computed, ref } from "vue";

const offset = ref(0);
const currentTime = ref(Date.now());

setInterval(() => {
  currentTime.value = Date.now();
}, 1000);

export function useClock() {
  const now = computed(() => new Date(currentTime.value + offset.value));

  const setCurrentTime = (date: Date) => {
    offset.value = date.getTime() - Date.now();
  };

  const resetCurrentTime = () => {
    offset.value = 0;
  };

  return {
    now,
    offset,
    setCurrentTime,
    resetCurrentTime,
  };
}