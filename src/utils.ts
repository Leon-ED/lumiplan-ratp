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