import { ref } from "vue";
import { cleanId } from "./utils";

const initialSoundState =
  new URLSearchParams(window.location.search).get("sounds") === "true";

const isSoundEnabledRef = ref(initialSoundState);

export class AudioManager {
  static SOUND_DIR = "/audio";

  static isSoundEnabled = isSoundEnabledRef;

  private static activeAudios = new Set<HTMLAudioElement>();
  private static currentAudio: HTMLAudioElement | null = null;

  static toggleSounds = (enabled: boolean) => {
    isSoundEnabledRef.value = enabled;

    if (!enabled) {
      this.stopAll();
    }

    const url = new URL(window.location.href);
    url.searchParams.set("sounds", enabled ? "true" : "false");
    window.history.replaceState({}, "", url.toString());
  };

  static areSoundsEnabled = (): boolean => {
    return isSoundEnabledRef.value;
  };

  static playSound = (path: string, playOnEnd?: () => void) => {
    if (!this.areSoundsEnabled()) {
      return;
    }
    if (this.currentAudio) {
      return;
    }

    if (!path.startsWith(this.SOUND_DIR)) {
      path = this.SOUND_DIR + "/" + path;
    }

    const audio = new Audio(path);

    this.currentAudio = audio;
    this.activeAudios.add(audio);

    let callbackCalled = false;

    const cleanup = () => {
      this.activeAudios.delete(audio);

      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }

      audio.removeEventListener("ended", handleEnd);
      audio.removeEventListener("error", handleEnd);
    };

    const handleEnd = () => {
      if (!callbackCalled) {
        callbackCalled = true;
        cleanup();

        if (playOnEnd) {
          playOnEnd();
        }
      }
    };

    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("error", handleEnd);

    audio.play().catch((err) => {
      console.warn(`Impossible de lire l'audio (${path}) :`, err);
      handleEnd();
    });
  };

  static stopAll = () => {
    for (const audio of this.activeAudios) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    }

    this.activeAudios.clear();
    this.currentAudio = null;
  };

  static playStopName = (
    lineId: string,
    stopId: string,
    isTerminus: boolean,
  ) => {
    if (!this.areSoundsEnabled()) return;

    const path =
      this.SOUND_DIR +
      `/${cleanId(lineId)}/stops/${cleanId(stopId)}.mp3`;

    if (isTerminus) {
      this.playSound(path, () => {
        this.playFinalStop();
      });
    } else {
      this.playSound(path);
    }
  };

  static playDirection = (
    lineId: string,
    directionStopId: string,
  ) => {
    if (!this.areSoundsEnabled()) return;

    const path =
      this.SOUND_DIR +
      `/${cleanId(lineId)}/directions/${cleanId(directionStopId)}.mp3`;

    this.playSound(path);
  };

  static playFinalStop = () => {
    if (!this.areSoundsEnabled()) return;

    this.playSound(
      this.SOUND_DIR + `/generic/terminus.mp3`,
    );
  };
}