import { ref, computed, onMounted, onUnmounted } from "vue";
import { PassengerMessage } from "../types";
import { PASSENGER_MESSAGES } from "../messages";
import { AudioManager } from "../audio";

export function usePassengerMessages() {
  const queue = ref<PassengerMessage[]>([]);
  const MAX_QUEUE_SIZE = 3;
  const currentMessage = ref<PassengerMessage | null>(null);
  let messageTimeout: ReturnType<typeof setTimeout> | null = null;

  const isDisplayingMessage = computed(() => currentMessage.value !== null);

  const processNextMessage = () => {
    if (queue.value.length === 0) {
      currentMessage.value = null;
      return;
    }

    currentMessage.value = queue.value.shift()!;
    if (currentMessage.value.audio) {
      AudioManager.playSound(currentMessage.value.audio);
    }else{
      AudioManager.playSound("generic/jingle.mp3");
    }

    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }

    messageTimeout = setTimeout(() => {
      processNextMessage();
    }, (currentMessage.value.duration || 10) * 1000);
  };

  const triggerMessage = (index: number) => {
    const msg = PASSENGER_MESSAGES[index];
    if (!msg) return;
    if (queue.value.length >= MAX_QUEUE_SIZE) {
      console.warn("Passenger message queue is full. Message ignored:", msg);
      return;
    }
    queue.value.push(msg);

    if (!currentMessage.value) {
      processNextMessage();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

    console.log(`Key pressed: ${event.key}, code: ${event.code}`);

    if (event.code.startsWith("Digit") || event.code.startsWith("Numpad")) {
      const digitString = event.code.slice(-1);
      const keyNumber = parseInt(digitString, 10);

      if (!isNaN(keyNumber)) {
        if (keyNumber >= 1 && keyNumber <= 9) {
          triggerMessage(keyNumber - 1);
        } else if (keyNumber === 0) {
          triggerMessage(9);
        }
      }
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
    if (messageTimeout) clearTimeout(messageTimeout);
  });

  return {
    currentPassengerMessage: currentMessage,
    isDisplayingPassengerMessage: isDisplayingMessage,
    triggerMessage,
  };
}
