import { Wifi, Zap, Clock, Download, Upload } from "lucide-react";

export type Package = {
  id: string;
  name: string;
  price: number;
  duration: string;
  download: string;
  upload: string;
  dataLimit: string;
  badge?: "Popular" | "Best Value" | "Unlimited" | "Night";
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
    <div className="neo p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="neo-sm h-12 w-12 grid place-items-center">
          <Wifi className="h-5 w-5 text-primary" />
        </div>
        {pkg.badge && (
          <span className={`text-[10px] font-bold tracking-wider px-3 py-1 rounded-full ${badgeStyles[pkg.badge]}`}>
            {pkg.badge.toUpperCase()}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold">{pkg.name}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-extrabold text-gradient-orange">KSh {pkg.price}</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Clock className="h-3 w-3" /> {pkg.duration}
        </p>
      </div>

      <div className="neo-inset p-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <Download className="h-3.5 w-3.5 mx-auto text-primary" />
          <p className="text-[10px] text-muted-foreground mt-1">Down</p>
          <p className="text-xs font-bold">{pkg.download}</p>
        </div>
        <div>
          <Upload className="h-3.5 w-3.5 mx-auto text-primary" />
          <p className="text-[10px] text-muted-foreground mt-1">Up</p>
          <p className="text-xs font-bold">{pkg.upload}</p>
        </div>
        <div>
          <Zap className="h-3.5 w-3.5 mx-auto text-primary" />
          <p className="text-[10px] text-muted-foreground mt-1">Data</p>
          <p className="text-xs font-bold">{pkg.dataLimit}</p>
        </div>
      </div>

      <ul className="text-xs text-muted-foreground space-y-1.5 flex-1">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full gradient-orange" /> {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onBuy(pkg)}
        className="w-full gradient-orange text-primary-foreground font-semibold py-3 rounded-full shadow-orange hover:opacity-95 transition"
      >
        Buy Package
      </button>
    </div>
  );
}
