import { ref } from "vue";

const position = ref<{ lat: number; lon: number } | null>(null);
const error = ref<string | null>(null);
const isTracking = ref(false);
const isSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

let geoWatchId: number | null = null;

const startTracking = () => {
  if (!isSupported) {
    error.value = "La géolocalisation n'est pas supportée par ce navigateur.";
    return false;
  }

  if (geoWatchId !== null) {
    isTracking.value = true;
    return true;
  }

  geoWatchId = navigator.geolocation.watchPosition(
    (geoPosition) => {
      error.value = null;
      position.value = {
        lat: geoPosition.coords.latitude,
        lon: geoPosition.coords.longitude,
      };
      isTracking.value = true;
    },
    (geoError) => {
      error.value = `Erreur GPS: ${geoError.message}`;
      position.value = null;
      isTracking.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    },
  );

  return true;
};

const stopTracking = () => {
  if (geoWatchId !== null) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
  }

  isTracking.value = false;
  position.value = null;
};

export function useDevicePosition() {
  return {
    position,
    error,
    isTracking,
    isSupported,
    startTracking,
    stopTracking,
  };
}
