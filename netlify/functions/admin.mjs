import { store, listWeek, json, isAdmin } from "../lib/shared.mjs";

// GET — список поточного тижня; DELETE ?id=... — видалити запис
export default async (req) => {
  if (!isAdmin(req)) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ error: "Невірний пароль." }, 401);
  }
  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id") || "";
    if (/^\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}$/.test(id)) await store().delete(id);
    return json({ ok: true });
  }
  return json(await listWeek());
};

export const config = { path: "/api/admin" };
