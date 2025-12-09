export const NEXT_STOP_TEXTS = [
  "Prochains arrêts",
  "<i>Next stops</i>",
  "Prochains arrêts",
  "<i>Próximas paradas</i>",
  "Prochains arrêts",
  "<i>Nächste Haltestellen</i>",
  "Prochains arrêts",
  "<i>Prossime fermate</i>",
];
export const TERMINUS_TEXTS = [
  "Prochain arrêt : terminus",
  "Final stop",
  "Prochain arrêt : terminus",
  "Ultima parada",
  "Prochain arrêt : terminus",
  "Endhaltestelle",
  "Prochain arrêt : terminus",
  "Capolinea",
];
export const DEPARTURE_IN_TEXTS = [
  "Départ dans",
  "<i>Departure in</i>",
  "Départ dans",
  "<i>Salida en</i>",
  "Départ dans",
  "<i>Abfahrt in</i>",
  "Départ dans",
  "<i>Partenza in</i>",
];
export const CONNECTING_LINES_TEXTS = [
  "Correspondances",
  "<i>Connecting lines</i>",
  "Correspondances",
  "<i>Correspondencias</i>",
  "Correspondances",
  "<i>Umstieg</i>",
  "Correspondances",
  "<i>Coincidenze</i>",
];
export const ETA_TEXTS = [
  "Arrivée prévue dans",
  "<i>Expected time to arrival</i>",
  "Arrivée prévue dans",
  "<i>Llegada prevista</i>",
  "Arrivée prévue dans",
  "<i>Voraussichtliche Ankunft in</i>",
  "Arrivée prévue dans",
  "<i>Arrivo previsto fra</i>",
];
export const DIRECTION_TEXTS = [
  "Direction",
  "<i>To</i>",
  "Direction",
  "<i>Dirección</i>",
  "Direction",
  "<i>Richtung</i>",
  "Direction",
  "<i>Direzione</i>",
];
const ROTATION_DURATION_MS = 5000;

export const getGlobalSyncedIndex = (arrayLength: number): number => {
  const totalTicks = Math.floor(Date.now() / ROTATION_DURATION_MS);
  return totalTicks % arrayLength;
};

export const getTimeUntilNextTick = (): number => {
  return ROTATION_DURATION_MS - (Date.now() % ROTATION_DURATION_MS);
};
