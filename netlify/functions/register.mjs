import { CFG, TRACKS, store, listWeek, json } from "../lib/shared.mjs";

const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, 120);

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ error: "Некоректний запит." }, 400); }
  if (b.website) return json({ ok: true }); // honeypot для ботів

  const r = {
    track: clean(b.track),
    name: clean(b.name),
    course: Number(b.course),
    grp: clean(b.grp).slice(0, 20),
    topic: Number(b.topic),
    missed: clean(b.missed),
    reason: b.reason === "valid" ? "valid" : b.reason === "invalid" ? "invalid" : "",
  };

  const t = TRACKS[r.track];
  if (!t) return json({ error: "Обери факультет або коледж." }, 400);
  if (!t.courses.includes(r.course)) return json({ error: "Обери курс." }, 400);
  if (!r.name || r.name.length < 5) return json({ error: "Вкажи повністю прізвище, імʼя та по батькові." }, 400);
  if (!r.grp) return json({ error: "Вкажи номер групи." }, 400);
  if (!Number.isInteger(r.topic) || r.topic < 1 || r.topic > 200) return json({ error: "Вкажи номер теми." }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.missed)) return json({ error: "Вкажи дату пропуску." }, 400);
  if (!r.reason) return json({ error: "Познач, поважна чи неповажна причина пропуску." }, 400);

  const { week, rows } = await listWeek();
  const low = (s) => s.toLowerCase();
  if (rows.some((x) => x.track === r.track && low(x.name) === low(r.name) && x.topic === r.topic && x.missed === r.missed))
    return json({ error: "Ти вже записаний(а) на відробку цієї теми." }, 409);

  r.created = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv", dateStyle: "short", timeStyle: "short" });
  await store().setJSON(`${week}/${crypto.randomUUID()}`, r);
  return json({ ok: true, week, time: CFG.time, place: CFG.place, trackTitle: t.title });
};

export const config = { path: "/api/register" };
