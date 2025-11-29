import { Mode } from "fs";
import { Desserte, Line } from "./types";

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
    }
    catch (error) {
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
        id: line,
        name: line.shortName,
        color: line.backgroundColor,
        textColor: line.textColor,
        //@ts-expect-error
        mode: line.mode.toUpperCase() as Mode,
      };
      return realLine;
    } catch (error) {
      console.error("Error parsing line data:", error);
      throw error;
    }
  }

  static async searchLines(query: string): Promise<Line[]> {
    const endpoint = `${this.apiBaseUrl}lines/search/${encodeURIComponent(
      query
    )}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
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
        mode: line.mode.toUpperCase() as Mode,
      }));
      return lines;
    } catch (error) {
      console.error("Error parsing search results:", error);
      throw error;
    }
  }
}
