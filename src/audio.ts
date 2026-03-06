import { cleanId } from "./utils";

export class AudioManager {
  static SOUND_DIR = "/audio";

  static areSoundsEnabled = (): boolean => {
    return false;
    const result = new URLSearchParams(window.location.search).get("sounds") === "true";
    console.info('La fonctionnalité son est' + (result ? ' activée' : ' désactivée'));
    return result;
  };
  static playStop = (lineId: string, stopId: string) => {
    if (!this.areSoundsEnabled()) return;
    const path =
      this.SOUND_DIR + `/${cleanId(lineId)}/stops/${cleanId(stopId)}.mp3`;
    const audio = new Audio(path);
    audio.play();
  };
  static playDirection = (lineId: string, directionStopId: string) => {
    if (!this.areSoundsEnabled()) return;

    const path =
      this.SOUND_DIR +
      `/${cleanId(lineId)}/directions/${cleanId(directionStopId)}.mp3`;

    const audio = new Audio(path);

    audio.play();
    audio.play();
  };

  static playFinalStop() {
    if (!this.areSoundsEnabled()) return;
    //TODO: Not implemented
    return;
    new Audio(this.SOUND_DIR + `/final_stop.mp3`).play();
  }
}
