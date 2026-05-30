import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, UserX, DollarSign, TrendingUp, Building2, Router, Activity, Gauge, AlertTriangle, Heart, RefreshCw } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { PortalShell } from "@/components/portal/PortalShell";
import { PackagesManager } from "@/components/admin/PackagesManager";
import { RouterManager } from "@/components/admin/RouterManager";
import { supabase } from "@/integrations/supabase/client";

type RouterRow = { id: string; status: string };
type Tx = { amount: number; status: string; created_at: string; package_id: string | null };

function Stat({ icon: Icon, label, value, trend, accent }: { icon: any; label: string; value: string; trend?: string; accent?: boolean }) {
  return (
    <div className="neo-sm p-4">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-xl grid place-items-center ${accent ? "gradient-orange shadow-orange" : "neo-inset"}`}>
          <Icon className={`h-4 w-4 ${accent ? "text-primary-foreground" : "text-primary"}`} />
        </div>
        {trend && <span className="text-[10px] text-emerald-600 font-bold">{trend}</span>}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-extrabold mt-0.5">{value}</p>
    </div>
  );
}

export default function Admin() {
  const [routers, setRouters] = useState<RouterRow[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [pkgNames, setPkgNames] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ users: 0, today: 0, month: 0, pending: 0, failed: 0 });

  async function loadAll() {
    const [{ data: r }, { data: t }, { data: p }, { count: users }] = await Promise.all([
      supabase.from("routers").select("id,status"),
      supabase.from("transactions").select("amount,status,created_at,package_id"),
      supabase.from("packages").select("id,name"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);
    setRouters((r ?? []) as RouterRow[]);
    setTxs((t ?? []) as Tx[]);
    setPkgNames(Object.fromEntries((p ?? []).map((x: any) => [x.id, x.name])));

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const ok = (t ?? []).filter((x) => x.status === "success");
    setStats({
      users: users ?? 0,
      today: ok.filter((x) => new Date(x.created_at) >= today).reduce((s, x) => s + Number(x.amount), 0),
      month: ok.filter((x) => new Date(x.created_at) >= monthStart).reduce((s, x) => s + Number(x.amount), 0),
      pending: (t ?? []).filter((x) => x.status === "pending").length,
      failed: (t ?? []).filter((x) => x.status === "failed").length,
    });
  }

  useEffect(() => {
    loadAll();
    const ch = supabase
      .channel("admin-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "routers" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, loadAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const revenue = useMemo(() => {
    const days: { d: string; v: number }[] = [];
    const ok = txs.filter((t) => t.status === "success");
    for (let i = 13; i >= 0; i--) {
      const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - i);
      const next = new Date(day); next.setDate(day.getDate() + 1);
      const v = ok.filter((t) => { const ts = new Date(t.created_at); return ts >= day && ts < next; })
        .reduce((s, t) => s + Number(t.amount), 0);
      days.push({ d: `${day.getMonth() + 1}/${day.getDate()}`, v });
    }
    return days;
  }, [txs]);

  const packagesPop = useMemo(() => {
    const map: Record<string, number> = {};
    txs.filter((t) => t.status === "success" && t.package_id).forEach((t) => {
      const k = pkgNames[t.package_id!] ?? "Unknown";
      map[k] = (map[k] ?? 0) + 1;
    });
    return Object.entries(map).map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v).slice(0, 6);
  }, [txs, pkgNames]);

  const online = routers.filter((r) => r.status === "online").length;
  const offline = routers.length - online;

  return (
    <PortalShell>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">Super Admin</p>
          <h2 className="text-3xl font-extrabold mt-1">Command Center</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Stat icon={Users} label="Total Users" value={String(stats.users)} />
        <Stat icon={UserCheck} label="Routers Online" value={String(online)} accent />
        <Stat icon={UserX} label="Routers Offline" value={String(offline)} />
        <Stat icon={DollarSign} label="Today" value={`KSh ${Math.round(stats.today).toLocaleString()}`} />
        <Stat icon={TrendingUp} label="Month" value={`KSh ${Math.round(stats.month).toLocaleString()}`} />
        <Stat icon={Building2} label="Packages" value={String(Object.keys(pkgNames).length)} />
        <Stat icon={Router} label="Routers" value={String(routers.length)} />
        <Stat icon={Activity} label="Tx Total" value={String(txs.length)} />
        <Stat icon={Gauge} label="Success Tx" value={String(txs.filter((t) => t.status === "success").length)} />
        <Stat icon={AlertTriangle} label="Failed" value={String(stats.failed)} />
        <Stat icon={RefreshCw} label="Pending" value={String(stats.pending)} />
        <Stat icon={Heart} label="Health" value={routers.length === 0 ? "—" : online === routers.length ? "OK" : "DEGRADED"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="neo p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Revenue Trend</p>
              <h3 className="font-extrabold text-lg">Last 14 Days</h3>
            </div>
            <span className="text-2xl font-extrabold text-gradient-orange">KSh {Math.round(stats.month).toLocaleString()}</span>
          </div>
          <div className="h-56 -mx-2">
            <ResponsiveContainer>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.21 32)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.68 0.21 32)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.008 60)" vertical={false} />
                <XAxis dataKey="d" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-neo-sm)", background: "var(--surface)" }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.68 0.21 32)" strokeWidth={3} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="neo p-6">
          <p className="text-xs text-muted-foreground">Package Popularity</p>
          <h3 className="font-extrabold text-lg mb-4">All-time</h3>
          <div className="h-56 -mx-2">
            {packagesPop.length === 0 ? (
              <div className="h-full grid place-items-center text-xs text-muted-foreground text-center px-4">No successful purchases yet.</div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={packagesPop}>
                  <XAxis dataKey="n" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-neo-sm)", background: "var(--surface)" }} />
                  <Bar dataKey="v" fill="oklch(0.68 0.21 32)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <RouterManager />
      <PackagesManager />
    </PortalShell>
  );
}
