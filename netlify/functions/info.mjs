import { CFG, TRACKS, listWeek, json } from "../lib/shared.mjs";

// Публічна інформація для лендінгу
export default async () => {
  const { week, rows } = await listWeek();
  const counts = Object.fromEntries(Object.keys(TRACKS).map((k) => [k, rows.filter((r) => r.track === k).length]));
  return json({ week, time: CFG.time, place: CFG.place, resetHour: CFG.resetHour, tracks: TRACKS, counts });
};

export const config = { path: "/api/info" };
