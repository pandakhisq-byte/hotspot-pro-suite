// MikroTik dispatcher. Admin-only. Calls the RouterOS REST API on each device.
// Required runtime secrets (add later):
//   MIKROTIK_USER, MIKROTIK_PASSWORD
// Each router row stores its own IP. Use https://<ip>/rest/...

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supa = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function basicAuth() {
  const u = Deno.env.get("MIKROTIK_USER") ?? "";
  const p = Deno.env.get("MIKROTIK_PASSWORD") ?? "";
  return "Basic " + btoa(`${u}:${p}`);
}

async function rosFetch(ip: string, path: string, init?: RequestInit) {
  const r = await fetch(`https://${ip}/rest${path}`, {
    ...init,
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await r.text();
  try { return { ok: r.ok, status: r.status, data: JSON.parse(text) }; }
  catch { return { ok: r.ok, status: r.status, data: text }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Admin guard
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const { data: u } = await supa.auth.getUser(auth.slice(7));
  if (!u.user) return json({ error: "Unauthorized" }, 401);
  const { data: roles } = await supa.from("user_roles").select("role").eq("user_id", u.user.id);
  if (!roles?.some((r: any) => r.role === "admin")) return json({ error: "Forbidden" }, 403);

  try {
    const { action, routerId } = await req.json();
    const targetsQuery = routerId
      ? await supa.from("routers").select("*").eq("id", routerId)
      : await supa.from("routers").select("*");
    const targets = targetsQuery.data ?? [];

    const results: any[] = [];
    for (const r of targets) {
      if (!r) continue;
      switch (action) {
        case "sync":
        case "sync-users": {
          const [active, profiles] = await Promise.all([
            rosFetch(r.ip, "/ip/hotspot/active"),
            rosFetch(r.ip, "/system/resource"),
          ]);
          if (profiles.ok && typeof profiles.data === "object") {
            const d: any = profiles.data;
            await supa.from("routers").update({
              status: "online",
              cpu: Number(d["cpu-load"] ?? 0),
              ram: d["total-memory"] && d["free-memory"]
                ? Math.round(((d["total-memory"] - d["free-memory"]) / d["total-memory"]) * 100)
                : 0,
              uptime: d.uptime ?? "-",
              users: Array.isArray(active.data) ? active.data.length : 0,
            }).eq("id", r.id);
          } else {
            await supa.from("routers").update({ status: "offline" }).eq("id", r.id);
          }
          results.push({ id: r.id, ok: profiles.ok });
          break;
        }
        case "push-profiles": {
          const { data: pkgs } = await supa.from("packages").select("*").eq("active", true);
          for (const p of pkgs ?? []) {
            await rosFetch(r.ip, "/ip/hotspot/user/profile/add", {
              method: "POST",
              body: JSON.stringify({
                name: p.name.replace(/\s+/g, "-").toLowerCase(),
                "rate-limit": `${p.upload}/${p.download}`,
                "session-timeout": p.duration,
              }),
            });
          }
          results.push({ id: r.id, pushed: pkgs?.length ?? 0 });
          break;
        }
        case "restart": {
          const res = await rosFetch(r.ip, "/system/reboot", { method: "POST" });
          results.push({ id: r.id, ok: res.ok });
          break;
        }
        case "add-hotspot-user": {
          // Called after successful M-Pesa payment to provision a user
          // Expects extra body fields: { username, password, profile, transactionId }
          break;
        }
        default:
          results.push({ id: r.id, error: "unknown action" });
      }
    }

    return json({ ok: true, action, results });
  } catch (e) {
    return json({ ok: false, error: String((e as Error).message) }, 400);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
