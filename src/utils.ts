import { Line, Mode } from "./types";

export const getMinutesFromDate = (dateString: string): number => {
  return Math.max(0, Math.floor(getSecondesFromDate(dateString) / 60));
};
export const getSecondesFromDate = (
  dateString: string,
  allowNegativesValues: boolean = false
): number => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = date.getTime() - now.getTime();
  if (allowNegativesValues) {
    return Math.floor(diffInMs / 1000);
  }
  return Math.max(0, Math.floor(diffInMs / 1000));
};
  /**
   * Clean and strip a stop id or a line id
   * From STIF::Line:C01742: to C01742 or from STIF::StopPoint:SP:18455: to 18455
   * @param id
   * @returns  string
   */
  export  const cleanId = (id: string): string => {
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
export const sortedLines = (lines: Line[]): Line[] => {
const modeOrder = [
  Mode.RER,
  Mode.TRANSILIEN,
  Mode.METRO,
  Mode.CABLE,
  Mode.TRAM,
  Mode.TER,
  Mode.BUS,
  Mode.NOCTILIEN
];
  
  return lines.sort((a, b) => {
    const aIndex = modeOrder.indexOf(a.mode);
    const bIndex = modeOrder.indexOf(b.mode);
    if(aIndex === bIndex) {
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
}