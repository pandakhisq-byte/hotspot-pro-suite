import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, DollarSign, TrendingUp, Building2, Router, Activity, Gauge, AlertTriangle, Heart, RefreshCw, Power, Upload, HardDrive, Cpu, MoreVertical } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { PortalShell } from "@/components/portal/PortalShell";
import { PackagesManager } from "@/components/admin/PackagesManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const revenue = Array.from({ length: 14 }, (_, i) => ({ d: `D${i + 1}`, v: 800 + Math.random() * 1800 }));
const packagesPop = [
  { n: "Daily", v: 320 }, { n: "Hourly", v: 240 }, { n: "Weekly", v: 180 },
  { n: "Monthly", v: 90 }, { n: "Night", v: 140 }, { n: "Weekend", v: 70 },
];

type RouterRow = { id: string; name: string; ip: string; status: string; cpu: number; ram: number; users: number; bandwidth: string; uptime: string | null };

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
  const [stats, setStats] = useState({ users: 0, today: 0, month: 0, pending: 0 });

  async function loadRouters() {
    const { data } = await supabase.from("routers").select("*");
    setRouters((data ?? []) as RouterRow[]);
  }

  async function loadStats() {
    const [{ count: users }, { data: tx }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("transactions").select("amount,status,created_at"),
    ]);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const ok = (tx ?? []).filter((t: any) => t.status === "success");
    setStats({
      users: users ?? 0,
      today: ok.filter((t: any) => new Date(t.created_at) >= today).reduce((s: number, t: any) => s + Number(t.amount), 0),
      month: ok.filter((t: any) => new Date(t.created_at) >= monthStart).reduce((s: number, t: any) => s + Number(t.amount), 0),
      pending: (tx ?? []).filter((t: any) => t.status === "pending").length,
    });
  }

  useEffect(() => {
    loadRouters();
    loadStats();
    const ch = supabase
      .channel("admin-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "routers" }, loadRouters)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, loadStats)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function callMikrotik(action: string, routerId?: string) {
    const { error } = await supabase.functions.invoke("mikrotik-action", {
      body: { action, routerId },
    });
    if (error) toast.error(error.message);
    else toast.success(`${action} dispatched`);
  }

  return (
    <PortalShell>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">Super Admin</p>
          <h2 className="text-3xl font-extrabold mt-1">Command Center</h2>
        </div>
        <div className="flex gap-2">
          <button className="neo-sm px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> Branches</button>
          <button className="gradient-orange text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold shadow-orange flex items-center gap-2"><Router className="h-3.5 w-3.5" /> Add Router</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Stat icon={Users} label="Total Users" value={String(stats.users)} />
        <Stat icon={UserCheck} label="Online" value="—" accent />
        <Stat icon={UserX} label="Offline" value="—" />
        <Stat icon={DollarSign} label="Today" value={`KSh ${Math.round(stats.today).toLocaleString()}`} />
        <Stat icon={TrendingUp} label="Month" value={`KSh ${Math.round(stats.month).toLocaleString()}`} />
        <Stat icon={Building2} label="Branches" value="—" />
        <Stat icon={Router} label="Routers" value={String(routers.length)} />
        <Stat icon={Activity} label="Sessions" value="—" />
        <Stat icon={Gauge} label="Bandwidth" value="—" />
        <Stat icon={AlertTriangle} label="Failed Pay" value="—" />
        <Stat icon={RefreshCw} label="Pending" value={String(stats.pending)} />
        <Stat icon={Heart} label="Health" value="OK" trend="OK" />
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
          <h3 className="font-extrabold text-lg mb-4">This Week</h3>
          <div className="h-56 -mx-2">
            <ResponsiveContainer>
              <BarChart data={packagesPop}>
                <XAxis dataKey="n" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-neo-sm)", background: "var(--surface)" }} />
                <Bar dataKey="v" fill="oklch(0.68 0.21 32)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="neo p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase">MikroTik</p>
            <h3 className="text-2xl font-extrabold mt-1">Router Engine</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => callMikrotik("push-profiles")} className="neo-sm px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1"><Upload className="h-3 w-3" /> Push Profiles</button>
            <button onClick={() => callMikrotik("sync-users")} className="neo-sm px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Sync Users</button>
          </div>
        </div>

        {routers.length === 0 && (
          <div className="neo-inset p-6 text-center text-sm text-muted-foreground">
            No MikroTik routers connected yet. Add one from the top right to start receiving live CPU, RAM and bandwidth stats.
          </div>
        )}

        <div className="space-y-3">
          {routers.map((r) => {
            const statusColor = r.status === "online" ? "bg-emerald-500" : r.status === "warn" ? "bg-amber-500" : "bg-red-500";
            return (
              <div key={r.id} className="neo-sm p-4 grid grid-cols-2 md:grid-cols-7 gap-3 items-center">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-orange grid place-items-center shadow-orange">
                    <Router className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-sm flex items-center gap-2">
                      {r.name}
                      <span className={`h-2 w-2 rounded-full ${statusColor} animate-pulse`} />
                    </p>
                    <p className="text-[11px] text-muted-foreground">{r.ip}</p>
                  </div>
                </div>
                <div><p className="text-[10px] text-muted-foreground uppercase">CPU</p><p className="text-sm font-bold flex items-center gap-1"><Cpu className="h-3 w-3 text-primary" /> {r.cpu}%</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">RAM</p><p className="text-sm font-bold flex items-center gap-1"><HardDrive className="h-3 w-3 text-primary" /> {r.ram}%</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Users</p><p className="text-sm font-bold">{r.users}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Bandwidth</p><p className="text-sm font-bold">{r.bandwidth}</p></div>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => callMikrotik("restart", r.id)} className="neo-sm h-8 w-8 grid place-items-center" title="Restart"><Power className="h-3.5 w-3.5" /></button>
                  <button onClick={() => callMikrotik("sync", r.id)} className="neo-sm h-8 w-8 grid place-items-center" title="Sync"><RefreshCw className="h-3.5 w-3.5" /></button>
                  <button className="neo-sm h-8 w-8 grid place-items-center"><MoreVertical className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PackagesManager />
    </PortalShell>
  );
}
