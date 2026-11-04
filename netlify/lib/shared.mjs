import { getStore } from "@netlify/blobs";

// ===== Налаштування (можна перевизначити змінними середовища в Netlify) =====
export const CFG = {
  department: process.env.DEPARTMENT || "Кафедра ортопедичної стоматології ІФНМУ",
  place: process.env.PLACE || "Кафедра ортопедичної стоматології ІФНМУ",
  time: process.env.TIME || "17:00",
  resetHour: Number(process.env.RESET_HOUR || 19),
};

// Два напрямки — два окремі списки
export const TRACKS = {
  stom:    { title: "Стоматологічний факультет ІФНМУ", courses: [2, 3, 4, 5] },
  college: { title: "Фаховий медичний коледж ІФНМУ",   courses: [2, 3] },
};

export const store = () => getStore({ name: "vidrobka", consistency: "strong" });

/** Поточні дата/час у Києві. */
function kyivNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", hour12: false, weekday: "short",
    }).formatToParts(new Date()).map((x) => [x.type, x.value])
  );
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24, wd: p.weekday };
}

/** Понеділок, на який зараз іде запис. Після resetHour у понеділок — наступний. */
export function currentWeek() {
  const { date, hour, wd } = kyivNow();
  const d = new Date(date + "T12:00:00Z");
  const dow = d.getUTCDay(); // 1 = пн
  if (dow === 1 && hour < CFG.resetHour) return date;
  const add = ((8 - dow) % 7) || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

/** Записи поточного тижня; заодно видаляє старі тижні. */
export async function listWeek() {
  const s = store();
  const week = currentWeek();
  const { blobs } = await s.list();
  const mine = [];
  await Promise.all(blobs.map(async ({ key }) => {
    const w = key.slice(0, 10);
    if (w < week) return s.delete(key);
    if (w === week) {
      const r = await s.get(key, { type: "json" });
      if (r) mine.push({ id: key, ...r });
    }
  }));
  mine.sort((a, b) => (a.course - b.course) || String(a.grp).localeCompare(String(b.grp), "uk", { numeric: true }) || a.name.localeCompare(b.name, "uk"));
  return { week, rows: mine };
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export const hasPassword = () => Boolean((process.env.ADMIN_PASSWORD || "").trim());

export function isAdmin(req) {
  const pass = (process.env.ADMIN_PASSWORD || "").trim();
  let got = req.headers.get("x-admin-password") || "";
  try { got = decodeURIComponent(got); } catch {}
  got = got.trim();
  if (!pass || got.length !== pass.length) return false;
  let diff = 0;
  for (let i = 0; i < pass.length; i++) diff |= pass.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}
