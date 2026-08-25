import { InfoTraffic, Mode } from "./types";

export class Converter {
  static convertLineMode(mode: string, lineName: string): Mode {
    const normalizedMode = mode.toLowerCase();
    const normalizedLineName = lineName.trim().toUpperCase();
    if(normalizedMode === 'transilien'){
        return Mode.TRANSILIEN;
    }
    if(normalizedMode === 'rer'){
        return Mode.RER;
    }
    if(normalizedMode === 'metro'){
        return Mode.METRO;
    }
    if(normalizedMode === 'tram'){
        return Mode.TRAM;
    }
    if(normalizedMode === 'ter'){
        return Mode.TER;
    }
    if(normalizedMode === 'noctilien'){
        return Mode.NOCTILIEN;
    }

    if (normalizedMode === "bus_remplacement" || normalizedLineName.includes("remplacement ")) {
      return Mode.BUS_REMPLACEMENT;
    }

    if (normalizedMode === "telepherique") {
      return Mode.CABLE;
    }

    if (normalizedMode === "rail") {
      if (/^[ABCDE]$/.test(normalizedLineName)) {
        return Mode.RER;
      }

      if (normalizedLineName.startsWith("TER ")) {
        return Mode.TER;
      }

      if (/^[A-Z]$/.test(normalizedLineName)) {
        return Mode.TRANSILIEN;
      }

      return Mode.TER;
    }

    if (normalizedMode === "bus") {
      if (/^N\d{2,3}$/.test(normalizedLineName)) {
        return Mode.NOCTILIEN;
      }

      return Mode.BUS;
    }
    switch (normalizedMode) {
      case "tram":
        return Mode.TRAM;

      case "subway":
        return Mode.METRO;

      case "ferry":
        return Mode.BUS;

      case "cable_car":
      case "aerial_lift":
      case "telepherique":
        return Mode.CABLE;
      case "funicular":
        return Mode.METRO;

      case "trolleybus":
        return Mode.BUS;

      case "monorail":
        return Mode.TRAM;
      default:
        return Mode.BUS;
    }
  }

  static convertInfoTraffic(object: any): InfoTraffic {
    const infoTraffic: InfoTraffic = {
      effect: object.type,
      cause: object.causeLabel,
      id: object.ref,
      title: object.title,
      message: object.message,
      status: object.status,
      impactedLines: object.affectedLinesRefs,
    };
    return infoTraffic;
  }
}
