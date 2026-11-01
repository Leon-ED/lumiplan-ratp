import { useClock } from "./composables/useClock";
import { Line, Mode, Status, VehicleJourney } from "./types";

export const getSecondesFromDate = (
  dateString: string,
  allowNegativesValues = false,
): number => {
  const { now } = useClock();

  const current = now.value;
  const inputDate = new Date(dateString);

  const target = new Date(current);
  target.setHours(
    inputDate.getHours(),
    inputDate.getMinutes(),
    inputDate.getSeconds(),
    inputDate.getMilliseconds(),
  );

  const diff = Math.floor((target.getTime() - current.getTime()) / 1000);

  return allowNegativesValues ? diff : Math.max(0, diff);
};

export const getMinutesFromDate = (dateString: string): number => {
  return Math.max(0, Math.floor(getSecondesFromDate(dateString) / 60));
};
/**
 * Clean and strip a stop id or a line id
 * From STIF::Line:C01742: to C01742 or from STIF::StopPoint:SP:18455: to 18455
 * @param id
 * @returns  string
 */
export const cleanId = (id: string): string => {
  return id
    .toLocaleUpperCase()
    .replace("FR-IDF", "")
    .split(":")
    .filter((s) => s)
    .pop() as string;
};

// Fonction qui enlève les parenthèses et ce qu'il y a dedans
export const cleanText = (text: string): string => {
  return text.replace(/\(.*?\)/g, "").trim();
};
// Fonction qui récupère uniquement ce qu'il y a entre les parenthèses
export const extractTextInParentheses = (text: string): string => {
  const match = text.match(/\((.*?)\)/);
  return match ? match[1] : "";
};
export const isSameLineId = (idA?: string, idB?: string): boolean => {
  if (!idA || !idB) return false;
  return cleanId(idA) === cleanId(idB);
};

/**
 * Calculate distance in meters between two GPS coordinates using Haversine formula
 */
export const getDistanceFromLatLonInM = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
export const filterLines = (lines: Line[], query: string): Line[] => {
  const q = query.trim().toLowerCase();
  if (!q) return lines;

  return lines.filter((line) => {
    const name = line.name.toLowerCase();
    const mode = line.mode.toLowerCase();
    const modeAndName = `${mode} ${name}`;
    const modeAndNameNoSpace = `${mode}${name}`;

    if (name.includes(q)) return true;
    if (modeAndName.includes(q) || modeAndNameNoSpace.includes(q)) return true;

    if (mode === "metro" && (`m ${name}`.includes(q) || `m${name}`.includes(q)))
      return true;
    if (mode === "tram" && (`t ${name}`.includes(q) || `t${name}`.includes(q)))
      return true;
    if (mode === "bus" && (`b ${name}`.includes(q) || `b${name}`.includes(q)))
      return true;
    if (
      mode === "rer" &&
      (`rer ${name}`.includes(q) || `rer${name}`.includes(q))
    )
      return true;

    return false;
  });
};

/**
 * Format an ISO date string according to French locale
 */
export const formatDate = (
  isoString?: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", options).format(d);
};

export const sortedLines = (lines: Line[]): Line[] => {
  const modeOrder = [
    Mode.RER,
    Mode.TRANSILIEN,
    Mode.METRO,
    Mode.CABLE,
    // Mode.FLUVIAL,
    Mode.TRAM,
    Mode.TER,
    Mode.BUS,
    Mode.NOCTILIEN,
    Mode.BUS_AEROPORT,
    Mode.BUS_REMPLACEMENT,
    // Mode.VELO,
  ];

  return [...lines].sort((a, b) => {
    const aIsCustom = a.id.startsWith("editor-made-line");
    const bIsCustom = b.id.startsWith("editor-made-line");

    if (aIsCustom && !bIsCustom) return -1;
    if (!aIsCustom && bIsCustom) return 1;

    const aIndex = modeOrder.indexOf(a.mode);
    const bIndex = modeOrder.indexOf(b.mode);
    if (aIndex === bIndex) {
      // on essaie de parser en chiffre
      const aNumber = parseInt(a.name, 10);
      const bNumber = parseInt(b.name, 10);
      if (!isNaN(aNumber) && !isNaN(bNumber)) {
        return aNumber - bNumber;
      }
      return a.name.localeCompare(b.name);
    }
    return aIndex - bIndex;
  });
};
export const sortVehicleJourneys = (
  journeys: VehicleJourney[],
): VehicleJourney[] => {
  const now = Date.now();

  return [...journeys].sort((a, b) => {
    const getInfo = (journey: VehicleJourney) => {
      const stops = journey.stopTimes ?? [];

      if (stops.length === 0) {
        return {
          group: 3,
          departureTime: Infinity,
          remainingStops: 0,
        };
      }

      const firstStop = stops[0];
      const departureTime = new Date(firstStop.departureTime).getTime();

      const remainingStops = stops.filter((stop) => {
        const stopTime = new Date(stop.departureTime).getTime();

        return stop.status !== Status.SkippedStop && stopTime >= now;
      }).length;

      const notStarted = departureTime > now;

      const inProgress = !notStarted && remainingStops > 2;

      if (inProgress) {
        return {
          group: 0,
          departureTime,
          remainingStops,
        };
      }

      if (notStarted) {
        return {
          group: 1,
          departureTime,
          remainingStops,
        };
      }

      return {
        group: 2,
        departureTime,
        remainingStops,
      };
    };

    const infoA = getInfo(a);
    const infoB = getInfo(b);

    if (infoA.group !== infoB.group) {
      return infoA.group - infoB.group;
    }

    if (infoA.group === 0) {
      return infoB.remainingStops - infoA.remainingStops;
    }

    if (infoA.group === 1) {
      return infoA.departureTime - infoB.departureTime;
    }

    return 0;
  });
};
export const deepClone = <T>(val: T): T => {
  if (val === undefined || val === null) return val;
  return JSON.parse(JSON.stringify(val));
};

const normalizeStationName = (value: string): string => {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’‘`´]/g, " ")
    .replace(/[-‐‑‒–—―]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
};

export const hasMainlineTrains = (stopName: string): boolean => {
  const stations = [
    "gare de l'est",
    "paris-est",
    "gare de lyon",
    "paris-gare de lyon",
    "gare du nord",
    "paris-nord",
    "paris-gare du nord",
    "gare saint-lazare",
    "paris-saint-lazare",
    "gare montparnasse",
    "paris-montparnasse",
    "gare d'austerlitz",
    "paris-austerlitz",
    "gare de bercy",
    "paris-bercy",
    "massy tgv",
    "marne-la-vallee",
    "marne-la-vallee chessy",
    "aeroport charles de gaulle 2 tgv",
    "roissy cdg tgv",
    "versailles chantiers",
  ];

  const normalizedStopName = normalizeStationName(stopName);

  return stations.some((station) =>
    normalizedStopName.includes(normalizeStationName(station)),
  );
};
