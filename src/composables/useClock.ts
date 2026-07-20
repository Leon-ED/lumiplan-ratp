import { computed, ref } from "vue";

const offset = ref(0);
const currentTime = ref(Date.now());

setInterval(() => {
  currentTime.value = Date.now();
}, 1000);

export function useClock() {
  const now = computed(() => {
    const timestamp = currentTime.value + offset.value;
    if (!Number.isFinite(timestamp)) {
      return new Date(currentTime.value);
    }

    return new Date(timestamp);
  });

  const setCurrentTime = (date: Date) => {
    const time = date.getTime();

    if (!Number.isFinite(time)) {
      console.error("Date invalide :", date);
      return;
    }

    offset.value = time - Date.now();
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