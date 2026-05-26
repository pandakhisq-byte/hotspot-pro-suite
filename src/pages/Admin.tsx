import { Users, UserCheck, UserX, DollarSign, TrendingUp, Building2, Router, Activity, Gauge, AlertTriangle, Heart, RefreshCw, Power, Upload, HardDrive, Cpu, MoreVertical } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { PortalShell } from "@/components/portal/PortalShell";

const revenue = Array.from({ length: 14 }, (_, i) => ({ d: `D${i+1}`, v: 800 + Math.random() * 1800 }));
const packagesPop = [
  { n: "Daily", v: 320 }, { n: "Hourly", v: 240 }, { n: "Weekly", v: 180 },
  { n: "Monthly", v: 90 }, { n: "Night", v: 140 }, { n: "Weekend", v: 70 },
];

const ROUTERS = [
  { id: "r1", name: "CBD-MikroTik-01", ip: "10.0.0.1", branch: "Nairobi CBD", status: "online", cpu: 24, ram: 38, users: 142, bw: "84 Mbps", uptime: "23d 4h" },
  { id: "r2", name: "Westlands-RB5009", ip: "10.0.1.1", branch: "Westlands", status: "online", cpu: 18, ram: 32, users: 87, bw: "52 Mbps", uptime: "14d 2h" },
  { id: "r3", name: "Kilimani-hAP", ip: "10.0.2.1", branch: "Kilimani", status: "warn", cpu: 71, ram: 64, users: 53, bw: "31 Mbps", uptime: "5d 1h" },
  { id: "r4", name: "Karen-CCR", ip: "10.0.3.1", branch: "Karen", status: "offline", cpu: 0, ram: 0, users: 0, bw: "0 Mbps", uptime: "—" },
];

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
        <Stat icon={Users} label="Total Users" value="12,847" trend="+4.2%" />
        <Stat icon={UserCheck} label="Online" value="2,341" accent />
        <Stat icon={UserX} label="Offline" value="10,506" />
        <Stat icon={DollarSign} label="Today" value="KSh 84.2k" trend="+12%" />
        <Stat icon={TrendingUp} label="Month" value="KSh 1.94M" trend="+8.7%" />
        <Stat icon={Building2} label="Branches" value="6" />
        <Stat icon={Router} label="Routers" value="14" />
        <Stat icon={Activity} label="Sessions" value="2,341" />
        <Stat icon={Gauge} label="Bandwidth" value="312 Mbps" />
        <Stat icon={AlertTriangle} label="Failed Pay" value="7" />
        <Stat icon={RefreshCw} label="Pending" value="3" />
        <Stat icon={Heart} label="Health" value="99.8%" trend="OK" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="neo p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Revenue Trend</p>
              <h3 className="font-extrabold text-lg">Last 14 Days</h3>
            </div>
            <span className="text-2xl font-extrabold text-gradient-orange">KSh 1.94M</span>
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

      <div className="neo p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase">MikroTik</p>
            <h3 className="text-2xl font-extrabold mt-1">Router Engine</h3>
          </div>
          <div className="flex gap-2">
            <button className="neo-sm px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1"><Upload className="h-3 w-3" /> Push Profiles</button>
            <button className="neo-sm px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Sync Users</button>
          </div>
        </div>

        <div className="space-y-3">
          {ROUTERS.map((r) => {
            const statusColor =
              r.status === "online" ? "bg-emerald-500" :
              r.status === "warn" ? "bg-amber-500" : "bg-red-500";
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
                    <p className="text-[11px] text-muted-foreground">{r.ip} · {r.branch}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">CPU</p>
                  <p className="text-sm font-bold flex items-center gap-1"><Cpu className="h-3 w-3 text-primary" /> {r.cpu}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">RAM</p>
                  <p className="text-sm font-bold flex items-center gap-1"><HardDrive className="h-3 w-3 text-primary" /> {r.ram}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Users</p>
                  <p className="text-sm font-bold">{r.users}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Bandwidth</p>
                  <p className="text-sm font-bold">{r.bw}</p>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button className="neo-sm h-8 w-8 grid place-items-center" title="Restart"><Power className="h-3.5 w-3.5" /></button>
                  <button className="neo-sm h-8 w-8 grid place-items-center" title="Sync"><RefreshCw className="h-3.5 w-3.5" /></button>
                  <button className="neo-sm h-8 w-8 grid place-items-center"><MoreVertical className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PortalShell>
  );
}
