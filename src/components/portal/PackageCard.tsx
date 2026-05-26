import { Wifi, Zap, Clock, Download, Upload, Cpu } from "lucide-react";

export type Package = {
  id: string;
  name: string;
  price: number;
  duration: string;
  download: string;
  upload: string;
  data_limit: string;
  badge?: string | null;
  features: string[];
};

const badgeStyles: Record<string, string> = {
  Popular: "gradient-orange text-primary-foreground",
  "Best Value": "bg-foreground text-background",
  Unlimited: "bg-emerald-500 text-white",
  Night: "bg-indigo-500 text-white",
};

export function PackageCard({ pkg, onBuy }: { pkg: Package; onBuy: (p: Package) => void }) {
  return (
    <div className="group relative">
      {/* Drop shadow plate for floating feel */}
      <div className="absolute inset-x-4 -bottom-2 h-6 rounded-full bg-foreground/10 blur-xl group-hover:bg-primary/20 transition" />

      <div className="relative neo p-0 overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-[-0.3deg]">
        {/* Holographic top band — sim-card / credit-card vibe */}
        <div className="relative h-24 gradient-orange overflow-hidden">
          {/* Diagonal sheen */}
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.45)_45%,transparent_60%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          {/* Mesh dots */}
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />
          {/* Chip */}
          <div className="absolute top-4 left-5 h-9 w-12 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 shadow-inner grid grid-cols-3 grid-rows-3 gap-[1px] p-[3px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-amber-700/40 rounded-[1px]" />
            ))}
          </div>
          {/* Signal bars */}
          <div className="absolute top-5 right-5 flex items-end gap-1 h-6">
            {[6, 10, 14, 18].map((h) => (
              <div key={h} className="w-1.5 rounded-sm bg-white/90" style={{ height: h }} />
            ))}
          </div>
          {/* Wifi watermark */}
          <Wifi className="absolute -bottom-3 right-2 h-20 w-20 text-white/15" strokeWidth={1.2} />
          {/* Badge ribbon */}
          {pkg.badge && (
            <span className={`absolute bottom-3 left-5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow ${badgeStyles[pkg.badge] ?? "bg-white text-foreground"}`}>
              {pkg.badge.toUpperCase()}
            </span>
          )}
        </div>

        <div className="p-6 pt-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-extrabold leading-tight">{pkg.name}</h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" /> {pkg.duration}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">From</p>
              <p className="text-2xl font-extrabold text-gradient-orange leading-none">
                <span className="text-xs text-muted-foreground font-bold">KSh</span> {pkg.price}
              </p>
            </div>
          </div>

          <div className="neo-inset p-3 grid grid-cols-3 gap-2 text-center">
            <Spec icon={Download} label="Down" value={pkg.download} />
            <Spec icon={Upload} label="Up" value={pkg.upload} />
            <Spec icon={Zap} label="Data" value={pkg.data_limit} />
          </div>

          <ul className="text-xs text-muted-foreground space-y-1.5 flex-1">
            {pkg.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Cpu className="h-3 w-3 text-primary" /> {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => onBuy(pkg)}
            className="relative w-full gradient-orange text-primary-foreground font-semibold py-3 rounded-full shadow-orange transition-all active:translate-y-0.5 active:shadow-none overflow-hidden"
          >
            <span className="relative z-10">Buy Package · M-Pesa</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <Icon className="h-3.5 w-3.5 mx-auto text-primary" />
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
      <p className="text-xs font-bold truncate">{value}</p>
    </div>
  );
}
