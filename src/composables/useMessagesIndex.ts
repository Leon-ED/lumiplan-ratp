import { ref } from "vue";

const currentIndex = ref(0);

export function useMessagesIndex() {
  return {
    currentIndex,
  };
}