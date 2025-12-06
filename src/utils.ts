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