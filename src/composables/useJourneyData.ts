import { ref, computed } from "vue";
import { Api } from "../api";
import { Desserte, InfoTraffic, Line, Mode, Stop, SaveFile } from "../types";
import { cleanId } from "../utils";

export function useJourneyData(
  routeLineId: string | null,
  routeTripId: string | null,
) {
  const fakeDesserte: Desserte = {
    direction: "",
    id: "",
    stops: [],
    isLimitedService: false,
  };
  const desserte = ref<Desserte>(fakeDesserte);
  const line = ref<Line | null>(null);
  const INFOS_TRAFFICMessages = ref<InfoTraffic[]>([]);
  const isUsingLocalSave = ref(false);

  const loadFromSave = (saveData: SaveFile) => {
    isUsingLocalSave.value = true;
    line.value = saveData.journey.line;
    desserte.value = saveData.journey.desserte;
    INFOS_TRAFFICMessages.value = saveData.messages.map(
      (message, index): InfoTraffic => ({
        id: `save-${index}`,
        title: "",
        message: message.message,
        effect: message.effect,
        status: "ACTIVE",
        cause: message.message,
        impactedLines: [saveData.journey.line.id],
      }),
    );
  };

  const fetchLineData = async () => {
    if (isUsingLocalSave.value || !routeLineId) return;
    try {
      line.value = await Api.getLine(routeLineId);
    } catch (error) {
      console.error("Error fetching line data:", error);
    }
  };

  const fetchJourneyData = async () => {
    if (isUsingLocalSave.value || !routeTripId) return;
    try {
      const journeyData = await Api.getJourney(routeTripId);
      if (journeyData) desserte.value = journeyData;
    } catch (error) {
      console.error("Error fetching journey data:", error);
    }
  };

  const currentStop = computed(() =>
    desserte.value.stops.length > 0 ? desserte.value.stops[0] : null,
  );
  const importantStops = computed(() => {
    const stops = desserte.value.stops;
    if (!stops || stops.length === 0) return [];

    const currentIndex = stops.findIndex(
      (s) => s.stop.id === currentStop.value?.stop.id,
    );

    if (currentIndex === -1) return [];

    const validStops = stops.filter((s) => !s.isStopSkipped);
    if (validStops.length === 0) return [];

    const remainingStops = validStops.filter((s) => {
      const index = stops.findIndex((stop) => stop.stop.id === s.stop.id);
      return index > currentIndex;
    });

    if (remainingStops.length === 0) return [];

    const terminus = remainingStops[remainingStops.length - 1];

    const getHeavyConnectionCount = (stop: Stop) => {
      return stop.connectedLines.filter(
        (l: Line) =>
          l.mode !== Mode.BUS &&
          l.mode !== Mode.NOCTILIEN &&
          l.mode !== Mode.BUS_REMPLACEMENT &&
          l.mode !== Mode.BUS_AEROPORT &&
          l.id !== routeLineId,
      ).length;
    };

    const candidates = remainingStops.filter(
      (s) => s.stop.id !== terminus.stop.id,
    );

    const topConnectedStops = [...candidates].sort(
      (a, b) =>
        getHeavyConnectionCount(b.stop) - getHeavyConnectionCount(a.stop),
    );

    const bestTwo = topConnectedStops
      .filter((stop) => getHeavyConnectionCount(stop.stop) > 0)
      .slice(0, 2);

    const idsToKeep = new Set([
      terminus.stop.id,
      ...bestTwo.map((s) => s.stop.id),
    ]);

    const important = remainingStops.filter((s) => idsToKeep.has(s.stop.id));

    return important.map((importantStop) => {
      const importantIndex = stops.findIndex(
        (s) => s.stop.id === importantStop.stop.id,
      );

      const travelTime = stops
        .slice(currentIndex, importantIndex)
        .reduce((total, stop) => total + (stop.travelTime ?? 0), 0);

      return {
        ...importantStop,
        travelTime,
      };
    });
  });
  const currentConnections = computed(() => {
    return currentStop.value
      ? currentStop.value.stop.connectedLines.filter(
          (l: Line) => cleanId(l.id) !== cleanId(line.value?.id ?? ""),
        )
      : [];
  });

  const INFOS_TRAFFIC_LINES = computed(() => {
    const whitelistedModes = [Mode.RER, Mode.TRANSILIEN, Mode.METRO];
    const allLines: Line[] = [];
    const linesIdsSet = new Set<string>();
    desserte.value.stops.forEach((ds) => {
      ds.stop.connectedLines.forEach((l) => {
        if (
          cleanId(l.id) !== cleanId(line.value?.id ?? "") &&
          !linesIdsSet.has(l.id) &&
          whitelistedModes.includes(l.mode)
        ) {
          allLines.push(l);
          linesIdsSet.add(l.id);
        }
      });
    });
    const finalSorted = allLines.sort(
      (a, b) =>
        whitelistedModes.indexOf(a.mode) - whitelistedModes.indexOf(b.mode),
    );
    if (line.value) finalSorted.unshift(line.value);
    return finalSorted;
  });

  const specialSkippedStopMessage = computed<InfoTraffic | null>(() => {
    const stops = desserte.value.stops;
    if (!stops || stops.length === 0) return null;
    let skippedCount = 0;
    let nextServedStopName = "";
    for (const s of stops) {
      if (s.isStopSkipped) skippedCount++;
      else {
        nextServedStopName = s.stop.name;
        break;
      }
    }
    if (skippedCount === 0) return null;
    if (skippedCount === 1) nextServedStopName = "non desservi";

    const messageContent =
      skippedCount === 1 ? "Point d’arrêt" : `Prochain arrêt desservi : `;
    const messageId =
      skippedCount === 1
        ? "next-stop-skipped-alert"
        : "multiple-stops-skipped-alert";

    return {
      cause: nextServedStopName,
      effect: "INFO",
      impactedLines: [],
      message: messageContent,
      id: messageId,
      title: messageContent,
      content: messageContent,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    } as InfoTraffic;
  });

  const displayedInfosTraffic = computed(() => {
    if (specialSkippedStopMessage.value) {
      return [specialSkippedStopMessage.value];
    }
    return [...INFOS_TRAFFICMessages.value];
  });

  const fetchInfosTrafficMessages = async () => {
    if (!line.value || !desserte.value || desserte.value.stops.length === 0)
      return;
    try {
      const allMessages = await Api.getInfosTraffic(
        INFOS_TRAFFIC_LINES.value.map((l) => l.id),
      );
      INFOS_TRAFFICMessages.value = allMessages
        .filter((msg) => msg.status === "ACTIVE")
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching INFOS_TRAFFIC messages:", error);
    }
  };

  return {
    desserte,
    fakeDesserte,
    line,
    currentStop,
    importantStops,
    currentConnections,
    displayedInfosTraffic,
    specialSkippedStopMessage,
    isUsingLocalSave,
    loadFromSave,
    fetchLineData,
    fetchJourneyData,
    fetchInfosTrafficMessages,
  };
}
