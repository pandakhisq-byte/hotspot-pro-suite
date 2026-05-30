import { useEffect, useMemo, useState } from "react";
import { Clock, Database, Wallet, Smartphone, Gauge, Activity, Plus, RefreshCw, Headphones } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { PortalShell } from "@/components/portal/PortalShell";
import { PaymentModal } from "@/components/portal/PaymentModal";
import type { Package } from "@/components/portal/PackageCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="neo-sm p-5">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl gradient-orange grid place-items-center shadow-orange">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        {sub && <span className="text-[10px] text-emerald-600 font-bold">{sub}</span>}
      </div>
      <p className="text-xs text-muted-foreground mt-4">{label}</p>
      <p className="text-2xl font-extrabold mt-1">{value}</p>
    </div>
  );
}

type Profile = { full_name: string | null; wallet_balance: number };
type Tx = { id: string; amount: number; status: string; created_at: string; package_id: string | null; packages: { name: string; duration: string } | null };
type Device = { id: string; name: string; mac: string; active: boolean };

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [renewPkg, setRenewPkg] = useState<Package | null>(null);

  async function load() {
    if (!user) return;
    const [{ data: p }, { data: t }, { data: d }] = await Promise.all([
      supabase.from("profiles").select("full_name,wallet_balance").eq("id", user.id).maybeSingle(),
      supabase.from("transactions").select("id,amount,status,created_at,package_id,packages(name,duration)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("devices").select("id,name,mac,active").eq("user_id", user.id),
    ]);
    setProfile(p as Profile | null);
    setTxs((t ?? []) as unknown as Tx[]);
    setDevices((d ?? []) as Device[]);
  }

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel(`dash-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "devices", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const firstName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const lastSuccess = txs.find((t) => t.status === "success") ?? null;

  // Real usage series: sum of successful tx amounts per weekday (last 7 days)
  const usage = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const out: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    const since = Date.now() - 7 * 86400_000;
    txs.filter((t) => t.status === "success" && new Date(t.created_at).getTime() >= since).forEach((t) => {
      const k = days[new Date(t.created_at).getDay()];
      out[k] += Number(t.amount);
    });
    return days.map((d) => ({ d, v: out[d] }));
  }, [txs]);

  async function renew() {
    if (!lastSuccess?.package_id) {
      toast.info("No previous package found — pick one from the Portal.");
      return;
    }
    const { data: pkg } = await supabase
      .from("packages")
      .select("id,name,price,duration,download,upload,data_limit,badge,features")
      .eq("id", lastSuccess.package_id)
      .maybeSingle();
    if (!pkg) return toast.error("That package is no longer available.");
    setRenewPkg(pkg as unknown as Package);
  }

  return (
    <PortalShell>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">My Account</p>
          <h2 className="text-3xl font-extrabold mt-1">Hi, {firstName} 👋</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={renew} className="neo-sm px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Renew
          </button>
          <Link to="/" className="gradient-orange text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold shadow-orange flex items-center gap-2"><Plus className="h-3.5 w-3.5" /> Buy Package</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={Clock} label="Active Plan" value={lastSuccess?.packages?.duration ?? "—"} sub={lastSuccess ? "active" : undefined} />
        <Stat icon={Database} label="Purchases" value={String(txs.filter((t) => t.status === "success").length)} />
        <Stat icon={Wallet} label="Wallet" value={`KSh ${Math.round(profile?.wallet_balance ?? 0)}`} />
        <Stat icon={Smartphone} label="Devices" value={`${devices.length} / 3`} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="neo p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Package</p>
              <h3 className="font-extrabold text-lg">{lastSuccess?.packages?.name ?? "No active plan"}</h3>
            </div>
            <span className="gradient-orange text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">{lastSuccess?.status?.toUpperCase() ?? "NONE"}</span>
          </div>
          <div className="h-48 -mx-2">
            <ResponsiveContainer>
              <AreaChart data={usage}>
                <defs>
                  <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.21 32)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.68 0.21 32)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-neo-sm)", background: "var(--surface)" }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.68 0.21 32)" strokeWidth={3} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 text-center">Weekly spend (KSh) — live from your purchases</p>
        </div>

        <div className="neo p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Live Speed</p>
              <h3 className="font-extrabold text-lg flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> —</h3>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-32 -mx-2 grid place-items-center">
            <p className="text-xs text-muted-foreground text-center px-4">Connect a router via the Admin panel to stream real-time speed metrics.</p>
          </div>
          <button className="mt-4 w-full neo-sm py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
            <Headphones className="h-4 w-4" /> Get Support
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="neo p-6">
          <h3 className="font-extrabold mb-4">Connected Devices</h3>
          {devices.length === 0 && <p className="text-sm text-muted-foreground">No devices yet. Buy a package to auto-bind this device.</p>}
          <ul className="space-y-3">
            {devices.map((d) => (
              <li key={d.id} className="neo-sm p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.mac}</p>
                </div>
                <span className={`text-[10px] font-bold ${d.active ? "text-emerald-600" : "text-muted-foreground"}`}>● {d.active ? "ACTIVE" : "IDLE"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="neo p-6">
          <h3 className="font-extrabold mb-4">Package History</h3>
          {txs.length === 0 && <p className="text-sm text-muted-foreground">No purchases yet.</p>}
          <ul className="space-y-3">
            {txs.map((h) => (
              <li key={h.id} className="neo-sm p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{h.packages?.name ?? "Package"}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()} · {h.status}</p>
                </div>
                <span className="font-extrabold text-gradient-orange">KSh {h.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PaymentModal pkg={renewPkg} onClose={() => setRenewPkg(null)} />
    </PortalShell>
  );
}
{/* Recharts imports kept for the area chart above */}
void LineChart; void Line;
