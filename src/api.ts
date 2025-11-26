import { Mode } from "fs";
import { Line } from "./types";

export class Api {
  static apiBaseUrl = "https://ecrans-api.gwadz.fr/";

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
        id: line.id,
        name: line.name.startsWith("TER ") ? 'TER'  : line.name,
        color: line.backgroundColor,
        textColor: line.textColor,
        mode: line.mode.toUpperCase() as Mode,
      };
      return realLine;
    } catch (error) {
      console.error("Error parsing line data:", error);
      throw error;
    }
  }
}
