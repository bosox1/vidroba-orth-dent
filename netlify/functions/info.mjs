import { CFG, listWeek, json } from "../lib/shared.mjs";

// Публічна інформація для лендінгу: дата, час, місце, вільні місця
export default async () => {
  const { week, rows } = await listWeek();
  return json({
    week, time: CFG.time, place: CFG.place, department: CFG.department, resetHour: CFG.resetHour,
    capacity: CFG.capacity, taken: rows.length,
  });
};

export const config = { path: "/api/info" };
