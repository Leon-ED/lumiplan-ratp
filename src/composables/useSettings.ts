import { computed, ref, watch } from "vue";
import { AudioManager } from "../audio";
import { useClock } from "./useClock";
import { useDevicePosition } from "./useDevicePosition";
import type { ProgressionMode } from "../types";

const isFullScreen = ref(false);
const progressionMode = ref<ProgressionMode>("TIME");
const showAllLines = ref(false);
const isGpsDebugEnabled = ref(false);
const showMission = ref(false);
let isInitialized = false;

export function useSettings() {
  const { now, setCurrentTime } = useClock();
  const { isSupported, startTracking, stopTracking } = useDevicePosition();

  const simulatedTime = computed({
    get() {
      return `${String(now.value.getHours()).padStart(2, "0")}:${String(
        now.value.getMinutes(),
      ).padStart(2, "0")}`;
    },
    set(value: string) {
      if (!value) return;
      const [hours, minutes] = value.split(":").map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
      const date = new Date(now.value);
      date.setHours(hours, minutes, 0, 0);
      setCurrentTime(date);
    },
  });

  const isGpsMode = computed(() => progressionMode.value === "GPS");

  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
  };
  const toggleShowAllLines = () => {
    showAllLines.value = !showAllLines.value;
  };
  const showAllLinesEnabled = computed(() => showAllLines.value);

  const setProgressionMode = (mode: ProgressionMode) => {
    progressionMode.value = mode;
  };

  const setGpsDebugEnabled = (enabled: boolean) => {
    isGpsDebugEnabled.value = enabled;
  };

  const setSoundsEnabled = (enabled: boolean) => {
    AudioManager.toggleSounds(enabled);
  };
  const toggleShowMission = () => {
    showMission.value = !showMission.value;
  };
  const showMissionEnabled = computed(() => showMission.value);
  if (!isInitialized) {
    watch(
      progressionMode,
      (newMode) => {
        if (newMode === "GPS") {
          if (!isSupported) {
            alert("La géolocalisation n'est pas supportée par ce navigateur.");
            progressionMode.value = "MANUAL";
            return;
          }

          const didStart = startTracking();
          if (!didStart) {
            progressionMode.value = "MANUAL";
          }
          return;
        }

        stopTracking();
        isGpsDebugEnabled.value = false;
      },
      { immediate: true },
    );
    isInitialized = true;
  }

  return {
    isFullScreen,
    toggleFullScreen,
    progressionMode,
    setProgressionMode,
    isGpsMode,
    isGpsDebugEnabled,
    setGpsDebugEnabled,
    areSoundsEnabled: AudioManager.isSoundEnabled,
    setSoundsEnabled,
    simulatedTime,
    showAllLinesEnabled,
    toggleShowAllLines,
    showMissionEnabled, 
    toggleShowMission,
  };
}
