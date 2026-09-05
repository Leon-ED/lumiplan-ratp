import {
  Desserte,
  InfoTraffic,
  Line,
  StopWithTime,
  VehicleJourney,
} from "./types";
import { Converter } from "./converter";
import { cleanId, sortVehicleJourneys } from "./utils";

export class Api {
  static apiBaseUrl = "https://ecrans-api.gwadz.fr/";
  static apiBaseUrlV2 = "https://ecrans-api.gwadz.fr/v2/api/idfm/";

  static async getJourney(
    journeyId: string,
    removePastStops: boolean = true,
  ): Promise<Desserte | null> {
    journeyId = journeyId.replace("vehicle_journey:", "");
    const now = new Date();
    const endpoint = `${this.apiBaseUrlV2}trip/${journeyId}?loadLines=true`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch journey data: ${response.status} ${response.statusText}`,
      );
    }
    try {
      const journeyData: any = await response.json();
      const desserte: Desserte = {
        id: journeyData.id,
        isLimitedService: false,
        vehicleNumber:
          journeyData.shortName &&
          /^[a-zA-Z]{4}\d{2}$/.test(journeyData.shortName)
            ? journeyData.shortName
            : journeyData.headsign && /^[a-zA-Z]{4}$/.test(journeyData.headsign)
              ? journeyData.headsign
              : undefined,
        geometry: journeyData.shape,
        direction: journeyData.destinationStop.stopName || journeyData.headsign,
        stops: journeyData.stopTimes
          .map((stop: any, index: number) => ({
            stop: {
              id: stop.stopPoint.stopRef,
              parentId: stop.stopPoint.stopRef,
              name: stop.stopPoint.stopName,
              landmarkName: "",
              lat: stop.stopPoint.lat,
              lon: stop.stopPoint.lon,
              radius: 120,
              subtitle: "",
              isAccessible: true,
              connectedLines: stop.stopPoint.lines.map((line: any) => ({
                id: line.ref,
                name: line.name,
                color: line.color,
                textColor: line.textColor,
                mode: Converter.convertLineMode(line.type, line.name),
              })),
            },
            timeOfArrival: stop.arrivalTime,
            timeOfDeparture: stop.departureTime,
            travelTime: journeyData.stopTimes[index - 1]
              ? (new Date(journeyData.stopTimes[index].arrivalTime).getTime() -
                  new Date(
                    journeyData.stopTimes[index - 1].departureTime,
                  ).getTime()) /
                1000
              : undefined,
            isTerminus: stop.status === "last_stop",
            isFirstStop: stop.status === "first_stop",
            isStopSkipped: stop.status === "skipped_stop",
          }))
          .filter((stop: StopWithTime) => {
            const stopDate = new Date(stop.timeOfDeparture);
            return !removePastStops || stopDate >= now;
          }),
      };
      console.log(desserte.stops[0].stop.lon);
      console.log("Fetched journey data:", desserte);
      return desserte;
    } catch (error) {
      console.error("Error parsing journey data:", error);
      return null;
    }
  }

  static async getVehiclesOnLine(lineId: string): Promise<VehicleJourney[]> {
    if (!lineId.startsWith("IDFM:")) {
      lineId = `IDFM:${lineId}`;
    }
    const endpoint = `${this.apiBaseUrlV2}trips/${lineId}/actives`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch vehicles: ${response.status} ${response.statusText}`,
      );
    }
    const vehiclesData: any = await response.json();
    return sortVehicleJourneys(vehiclesData);
    // try {
    //   const vehiclesData: any = await response.json();
    //   return vehiclesData;

    //   const dessertes: Desserte[] = [];
    //   for (const vehicle of vehiclesData.journeys) {
    //     const desserte: Desserte = {
    //       id: vehicle.journeyId,
    //       isLimitedService: vehicle.isLimitedService,
    //       direction: vehicle.directionName,
    //       stops: vehicle.stops
    //         .map((stop: any) => ({
    //           stop: {
    //             id: stop.stop.id,
    //             name: stop.stop.name,
    //             landmarkName: stop.stop.pointOfInterest,
    //             subtitle: "",
    //             isAccessible: stop.stop.isAccessible,
    //           },
    //           timeOfArrival: stop.timeOfArrival,
    //           timeOfDeparture: stop.timeOfDeparture ?? stop.timeOfArrival,
    //           isTerminus: stop.isTerminus,
    //           isFirstStop: stop.isFirstStop,
    //           isStopSkipped: stop.isStopSkipped,
    //         }))
    //         .filter((stop: StopWithTime) => {
    //           const stopDate = new Date(stop.timeOfDeparture);
    //           return stopDate >= new Date();
    //         }),
    //     };
    //     dessertes.push(desserte);
    //   }
    //   return dessertes.filter((desserte) => desserte.stops.length > 0);
    // } catch (error) {
    //   console.error("Error parsing vehicles data:", error);
    //   return [];
    // }
  }

  static async getLine(lineId: string): Promise<Line> {
    const endpoint = `${this.apiBaseUrlV2}lines?ids=${encodeURIComponent(lineId)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch line data: ${response.status} ${response.statusText}`,
      );
    }
    try {
      const linesData: any = await response.json();
      const line = linesData[0];
      const realLine: Line = {
        id: line.ref,
        name: line.shortName,
        color: line.color,
        textColor: line.textColor,
        mode: Converter.convertLineMode(line.type, line.shortName),
      };
      console.log("Fetched line data:", realLine);
      return realLine;
    } catch (error) {
      console.error("Error parsing line data:", error);
      throw error;
    }
  }
  static async getInfosTraffic(linesIds: string[]): Promise<InfoTraffic[]> {
    if (linesIds.length === 0) {
      return [];
    }
    const primaryLineId = linesIds[0];
    const effectRanking = [
      "SUSPENDED",
      "DISRUPTED",
      "DEVIATED",
      "WORKS",
      "STRIKE",
      "INFO",
    ];
    const endpoint = `${this.apiBaseUrl}disruptions/${linesIds.join(",")}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch traffic info: ${response.status} ${response.statusText}`,
      );
    }
    try {
      const infosData: any = await response.json();
      const infos: InfoTraffic[] = infosData.disruptions
        .map((info: any) => Converter.convertInfoTraffic(info))
        .sort((a: InfoTraffic, b: InfoTraffic) => {
          // --- 1. Vérifier l'appartenance au "Groupe VIP" (Ligne 0) ---
          const isAPrimary = a.impactedLines
            .map((id) => cleanId(id))
            .includes(primaryLineId);
          const isBPrimary = b.impactedLines
            .map((id) => cleanId(id))
            .includes(primaryLineId);

          // Si A est sur la ligne 0 et pas B, A passe devant
          if (isAPrimary && !isBPrimary) return -1;
          // Si B est sur la ligne 0 et pas A, B passe devant
          if (!isAPrimary && isBPrimary) return 1;

          // --- 2. Tri par Gravité (Effect) ---
          // On arrive ici si les deux sont VIP ou si les deux sont "autres".
          // Dans les deux cas, la logique est la même : on trie par effectRanking.

          let rankA = effectRanking.indexOf(a.effect);
          let rankB = effectRanking.indexOf(b.effect);

          // Gestion des effets inconnus (on les met à la fin)
          if (rankA === -1) rankA = Number.MAX_SAFE_INTEGER;
          if (rankB === -1) rankB = Number.MAX_SAFE_INTEGER;

          return rankA - rankB;
        });
      return infos;
    } catch (error) {
      console.error("Error parsing traffic info data:", error);
      return [];
    }
  }

  static async searchLines(query: string): Promise<Line[]> {
    const endpoint = `${this.apiBaseUrlV2}search/lines?q=${encodeURIComponent(query)}`;
    const response = await fetch(endpoint);
    if (!response.ok && response.status !== 404) {
      throw new Error(
        `Failed to search lines: ${response.status} ${response.statusText}`,
      );
    }
    try {
      const linesData: any = await response.json();
      const lines: Line[] = linesData.map((line: any) => ({
        id: line.ref,
        name: line.shortName,
        color: line.color,
        textColor: line.textColor,
        mode: Converter.convertLineMode(line.type, line.shortName),
      }));
      return lines;
    } catch (error) {
      if (response.status === 404) {
        return [];
      }
      console.error("Error parsing search results:", error);
      throw error;
    }
  }
}
