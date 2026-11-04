import { CFG, store, listWeek, json } from "../lib/shared.mjs";

const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, 200);

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ error: "Некоректний запит." }, 400); }
  if (b.website) return json({ ok: true }); // honeypot для ботів

  const r = { name: clean(b.name), grp: clean(b.grp), topic: clean(b.topic), missed: clean(b.missed), contact: clean(b.contact) };
  if (!r.name || !r.grp || !r.topic) return json({ error: "Заповни ПІБ, групу і тему заняття." }, 400);

  const { week, rows } = await listWeek();
  if (CFG.capacity > 0 && rows.length >= CFG.capacity)
    return json({ error: "На цей понеділок місць уже немає. Спробуй на наступний тиждень." }, 409);

  const low = (s) => s.toLowerCase();
  if (rows.some((x) => low(x.name) === low(r.name) && low(x.grp) === low(r.grp) && low(x.topic) === low(r.topic)))
    return json({ error: "Ти вже записаний(а) на цю відробку." }, 409);

  r.created = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv", dateStyle: "short", timeStyle: "short" });
  await store().setJSON(`${week}/${crypto.randomUUID()}`, r);
  return json({ ok: true, week, time: CFG.time });
};

export const config = { path: "/api/register" };
