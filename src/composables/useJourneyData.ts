import { ref, computed } from "vue";
import { Api } from "../api";
import { Desserte, InfoTraffic, Line, Mode, Stop, SaveFile } from "../types";

export function useJourneyData(routeLineId: string | null, routeTripId: string | null) {
  const fakeDesserte: Desserte = { direction: "", id: "", stops: [] };
  const desserte = ref<Desserte>(fakeDesserte);
  const line = ref<Line | null>(null);
  const INFOS_TRAFFICMessages = ref<InfoTraffic[]>([]);
  const isUsingLocalSave = ref(false);

  const loadFromSave = (saveData: SaveFile) => {
    isUsingLocalSave.value = true;
    line.value = saveData.journey.line;
    desserte.value = saveData.journey.desserte;
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
    desserte.value.stops.length > 0 ? desserte.value.stops[0] : null
  );

  const importantStops = computed(() => {
    const stops = desserte.value.stops;
    if (!stops || stops.length === 0) return [];
    const validStops = stops.filter((s) => !s.isStopSkipped);
    if (validStops.length === 0) return [];

    const terminus = validStops[validStops.length - 1];
    const getHeavyConnectionCount = (stop: Stop) => {
      if (!stop) return 0;
      return stop.connectedLines.filter(
        (l: Line) => l.mode !== Mode.BUS && l.mode !== Mode.NOCTILIEN && l.id != routeLineId
      ).length;
    };

    const candidates = validStops.filter((s) => s.stop.id !== terminus.stop.id);
    const topConnectedStops = [...candidates].sort(
      (a, b) => getHeavyConnectionCount(b.stop) - getHeavyConnectionCount(a.stop)
    );

    const bestTwo = topConnectedStops
      .filter((stop) => getHeavyConnectionCount(stop.stop) > 0)
      .slice(0, 2);
    const idsToKeep = new Set([terminus.stop.id, ...bestTwo.map((s) => s.stop.id)]);

    return validStops.filter((s) => idsToKeep.has(s.stop.id));
  });

  const currentConnections = computed(() => {
    return currentStop.value
      ? currentStop.value.stop.connectedLines.filter((l: Line) => l.id !== line.value?.id)
      : [];
  });

  const INFOS_TRAFFIC_LINES = computed(() => {
    const whitelistedModes = [Mode.RER, Mode.TRANSILIEN, Mode.METRO];
    const allLines: Line[] = [];
    const linesIdsSet = new Set<string>();
    desserte.value.stops.forEach((ds) => {
      ds.stop.connectedLines.forEach((l) => {
        if (l.id !== line.value?.id && !linesIdsSet.has(l.id) && whitelistedModes.includes(l.mode)) {
          allLines.push(l);
          linesIdsSet.add(l.id);
        }
      });
    });
    const finalSorted = allLines.sort(
      (a, b) => whitelistedModes.indexOf(a.mode) - whitelistedModes.indexOf(b.mode)
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

    const messageContent = skippedCount === 1 ? "Point d’arrêt" : `Prochain arrêt desservi : `;
    const messageId = skippedCount === 1 ? "next-stop-skipped-alert" : "multiple-stops-skipped-alert";

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
    if (!line.value || !desserte.value || desserte.value.stops.length === 0) return;
    try {
      const allMessages = await Api.getInfosTraffic(INFOS_TRAFFIC_LINES.value.map((l) => l.id));
      INFOS_TRAFFICMessages.value = allMessages.filter((msg) => msg.status === "ACTIVE").slice(0, 5);
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