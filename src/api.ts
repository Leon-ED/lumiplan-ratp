import { Desserte, InfoTraffic, Line } from "./types";
import { Converter } from "./converter";

export class Api {
  static apiBaseUrl = "https://ecrans-api.gwadz.fr/";
  // static apiBaseUrl = "https://localhost:8000/";

  static async getJourney(journeyId: string): Promise<Desserte | null> {
    const endpoint = `${this.apiBaseUrl}vehicle_journeys/${journeyId}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch journey data: ${response.status} ${response.statusText}`
      );
    }
    try {
      const journeyData: any = await response.json();
      const desserte: Desserte = {
        id: journeyData.journeyId,
        direction: journeyData.directionName,
        stops: journeyData.stops.map((stop: any) => ({
          stop: {
            id: stop.stop.id,
            name: stop.stop.name,
            landmarkName: stop.stop.pointOfInterest,
            isAccessible: stop.stop.isAccessible,
            connectedLines: stop.stop.connectedLines.map((line: any) => ({
              id: line.id,
              name: line.name,
              color: line.color,
              textColor: line.textColor,
              mode: Converter.convertLineMode(line.mode),
            })),
          },
          timeOfArrival: stop.timeOfArrival,
          isTerminus: stop.isTerminus,
          isFirstStop: stop.isFirstStop,
          isStopSkipped: stop.isStopSkipped,
        })),
      };
      return desserte;
    } catch (error) {
      console.error("Error parsing journey data:", error);
      return null;
    }
  }

  static async getVehiclesOnLine(lineId: string): Promise<Desserte[]> {
    const endpoint = `${this.apiBaseUrl}lines/line/${lineId}/vehicles_on_line`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch vehicles: ${response.status} ${response.statusText}`
      );
    }
    try {
      const vehiclesData: any = await response.json();

      const dessertes: Desserte[] = [];
      for (const vehicle of vehiclesData.journeys) {
        const desserte: Desserte = {
          id: vehicle.journeyId,
          direction: vehicle.directionName,
          stops: vehicle.stops.map((stop: any) => ({
            stop: {
              id: stop.stop.id,
              name: stop.stop.name,
              landmarkName: stop.stop.pointOfInterest,
              isAccessible: stop.stop.isAccessible,
            },
            timeOfArrival: stop.timeOfArrival,
            isTerminus: stop.isTerminus,
            isFirstStop: stop.isFirstStop,
            isStopSkipped: stop.isStopSkipped,
          })),
        };
        dessertes.push(desserte);
      }
      return dessertes;
    } catch (error) {
      console.error("Error parsing vehicles data:", error);
      return [];
    }
  }

  static async getLine(lineId: string): Promise<Line> {
    const endpoint = `${this.apiBaseUrl}lines/lines:${lineId}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch line data: ${response.status} ${response.statusText}`
      );
    }
    try {
      const linesData: any = await response.json();
      const line = linesData.lines[0];
      const realLine: Line = {
        id: line.ref,
        name: line.shortName,
        color: line.backgroundColor,
        textColor: line.textColor,
        mode: Converter.convertLineMode(line.mode),
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
        `Failed to fetch traffic info: ${response.status} ${response.statusText}`
      );
    }
    try {
      const infosData: any = await response.json();
      const infos: InfoTraffic[] = infosData.disruptions
        .map((info: any) => Converter.convertInfoTraffic(info))
        .sort((a: InfoTraffic, b: InfoTraffic) => {
          return (
            effectRanking.indexOf(a.effect) - effectRanking.indexOf(b.effect)
          );
        });
      return infos;
    } catch (error) {
      console.error("Error parsing traffic info data:", error);
      return [];
    }
  }

  static async searchLines(query: string): Promise<Line[]> {
    const endpoint = `${this.apiBaseUrl}lines/search/${encodeURIComponent(
      query
    )}`;
    const response = await fetch(endpoint);
    if (!response.ok && response.status !== 404) {
      throw new Error(
        `Failed to search lines: ${response.status} ${response.statusText}`
      );
    }
    try {
      const linesData: any = await response.json();
      const lines: Line[] = linesData.lines.map((line: any) => ({
        id: line.ref,
        name: line.shortName,
        color: line.backgroundColor,
        textColor: line.textColor,
        mode: Converter.convertLineMode(line.mode),
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
