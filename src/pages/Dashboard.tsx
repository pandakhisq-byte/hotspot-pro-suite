import { useEffect, useState } from "react";
import { Clock, Database, Wallet, Smartphone, Gauge, Activity, Plus, RefreshCw, Headphones } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { PortalShell } from "@/components/portal/PortalShell";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const usage = [
  { d: "Mon", mb: 420 }, { d: "Tue", mb: 780 }, { d: "Wed", mb: 540 },
  { d: "Thu", mb: 920 }, { d: "Fri", mb: 1100 }, { d: "Sat", mb: 1400 }, { d: "Sun", mb: 980 },
];
const speed = Array.from({ length: 20 }, (_, i) => ({ t: i, v: 8 + Math.random() * 12 }));

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
type Tx = { id: string; amount: number; status: string; created_at: string; packages: { name: string } | null };
type Device = { id: string; name: string; mac: string; active: boolean };

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,wallet_balance").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data as Profile | null));
    supabase.from("transactions").select("id,amount,status,created_at,packages(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5).then(({ data }) => setTxs((data ?? []) as unknown as Tx[]));
    supabase.from("devices").select("id,name,mac,active").eq("user_id", user.id).then(({ data }) => setDevices((data ?? []) as Device[]));
  }, [user]);

  const firstName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  return (
    <PortalShell>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">My Account</p>
          <h2 className="text-3xl font-extrabold mt-1">Hi, {firstName} 👋</h2>
        </div>
        <div className="flex gap-2">
          <button className="neo-sm px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5" /> Renew</button>
          <Link to="/" className="gradient-orange text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold shadow-orange flex items-center gap-2"><Plus className="h-3.5 w-3.5" /> Buy Package</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={Clock} label="Remaining Time" value="04h 23m" sub="active" />
        <Stat icon={Database} label="Data Left" value="6.4 GB" sub="of 10 GB" />
        <Stat icon={Wallet} label="Wallet" value={`KSh ${Math.round(profile?.wallet_balance ?? 0)}`} />
        <Stat icon={Smartphone} label="Devices" value={`${devices.length} / 3`} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="neo p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Package</p>
              <h3 className="font-extrabold text-lg">{txs[0]?.packages?.name ?? "No active plan"}</h3>
            </div>
            <span className="gradient-orange text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">{txs[0]?.status?.toUpperCase() ?? "—"}</span>
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
                <Area type="monotone" dataKey="mb" stroke="oklch(0.68 0.21 32)" strokeWidth={3} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="neo p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Live Speed</p>
              <h3 className="font-extrabold text-lg flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> 14.6 Mbps</h3>
            </div>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="h-32 -mx-2">
            <ResponsiveContainer>
              <LineChart data={speed}>
                <Line type="monotone" dataKey="v" stroke="oklch(0.68 0.21 32)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
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
    </PortalShell>
  );
}
