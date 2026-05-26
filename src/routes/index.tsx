import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wifi, Signal, Play, Settings, Bell, User, Gauge, Shield, Sparkles, Wallet, Smartphone, BarChart3, Gift, ArrowRight } from "lucide-react";
import { PackageCard, type Package } from "@/components/portal/PackageCard";
import { PaymentModal } from "@/components/portal/PaymentModal";

export const Route = createFileRoute("/")({
  component: Portal,
  head: () => ({
    meta: [
      { title: "ILNOIS Tech — Buy Internet Instantly" },
      { name: "description", content: "Connect to fast, reliable WiFi. Pay with M-Pesa. No registration required." },
    ],
  }),
});

const PACKAGES: Package[] = [
  { id: "h1", name: "Quick Hour", price: 10, duration: "1 Hour", download: "5 Mbps", upload: "2 Mbps", dataLimit: "500 MB", features: ["Browsing", "Social Media", "1 Device"] },
  { id: "d1", name: "Daily Boost", price: 50, duration: "24 Hours", download: "10 Mbps", upload: "5 Mbps", dataLimit: "2 GB", badge: "Popular", features: ["HD Streaming", "Video Calls", "1 Device"] },
  { id: "w1", name: "Weekly Pro", price: 200, duration: "7 Days", download: "15 Mbps", upload: "8 Mbps", dataLimit: "10 GB", badge: "Best Value", features: ["4K Streaming", "Gaming", "2 Devices"] },
  { id: "m1", name: "Monthly Max", price: 500, duration: "30 Days", download: "25 Mbps", upload: "12 Mbps", dataLimit: "Unlimited", badge: "Unlimited", features: ["Unlimited Data", "All Speeds", "3 Devices"] },
  { id: "n1", name: "Night Owl", price: 20, duration: "10pm – 6am", download: "20 Mbps", upload: "10 Mbps", dataLimit: "Unlimited", badge: "Night", features: ["Off-peak hours", "Unlimited", "1 Device"] },
  { id: "we1", name: "Weekend Pass", price: 150, duration: "Sat–Sun", download: "15 Mbps", upload: "8 Mbps", dataLimit: "8 GB", features: ["Fri 6pm – Mon 6am", "2 Devices"] },
];

function Portal() {
  const [selected, setSelected] = useState<Package | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="neo p-5 md:p-10">
          {/* Top bar */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl gradient-orange grid place-items-center shadow-orange">
                <Wifi className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg leading-none">ILNOIS<span className="text-gradient-orange">Tech</span></h1>
                <p className="text-[10px] text-muted-foreground">Hotspot Network</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a className="text-foreground">Packages</a>
              <a>Coverage</a>
              <a>Support</a>
              <a>About</a>
            </nav>

            <div className="flex items-center gap-3">
              <button className="neo-sm h-10 w-10 grid place-items-center"><Settings className="h-4 w-4" /></button>
              <button className="neo-sm h-10 w-10 grid place-items-center relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full gradient-orange" />
              </button>
              <Link to="/" className="neo-sm h-10 px-4 grid place-items-center text-sm font-semibold gap-2 flex">
                <User className="h-4 w-4" /> Sign In
              </Link>
            </div>
          </header>

          {/* HERO */}
          <section className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <div className="inline-flex items-center gap-2 neo-sm px-3 py-1.5 mb-5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium">Network Online · 99.9% uptime</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-extrabold leading-[1.05]">
                Fast WiFi. <br />
                <span className="text-gradient-orange">Instant access.</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-4 max-w-md">
                Pay with M-Pesa, get connected in seconds. No accounts, no forms, no fuss — premium hotspot internet on your terms.
              </p>

              <div className="flex gap-3 mt-7">
                <a href="#packages" className="gradient-orange text-primary-foreground font-semibold px-6 py-3.5 rounded-full shadow-orange flex items-center gap-2">
                  Buy Internet <ArrowRight className="h-4 w-4" />
                </a>
                <button className="neo-sm font-semibold px-6 py-3.5 rounded-full text-sm">Learn More</button>
              </div>

              <div className="flex gap-6 mt-8">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Speed</p>
                  <p className="font-extrabold text-lg flex items-center gap-1"><Gauge className="h-4 w-4 text-primary" /> 25 Mbps</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                  <p className="font-extrabold text-lg flex items-center gap-1"><Signal className="h-4 w-4 text-primary" /> 2,847</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Secured</p>
                  <p className="font-extrabold text-lg flex items-center gap-1"><Shield className="h-4 w-4 text-primary" /> WPA3</p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="md:col-span-7 relative grid place-items-center min-h-[380px]">
              <div className="absolute inset-0 grid place-items-center">
                <div className="h-80 w-80 rounded-full neo-inset" />
              </div>
              <div className="absolute h-72 w-72 rounded-full border-[6px] border-transparent border-t-primary border-r-primary spin-slow opacity-70" />
              <div className="relative h-60 w-60 rounded-full neo grid place-items-center overflow-hidden">
                <div className="absolute inset-3 rounded-full gradient-orange opacity-10" />
                <Wifi className="h-24 w-24 text-primary" strokeWidth={1.5} />
              </div>

              {/* Floating play button */}
              <button className="absolute bottom-6 h-16 w-16 rounded-full gradient-orange shadow-orange grid place-items-center">
                <Play className="h-6 w-6 text-primary-foreground fill-current" />
              </button>

              {/* Floating speed widget */}
              <div className="absolute top-4 right-4 neo-sm px-4 py-3">
                <p className="text-[10px] text-muted-foreground">Live Speed</p>
                <p className="text-xl font-extrabold text-gradient-orange">24.8 <span className="text-xs text-muted-foreground font-medium">Mbps</span></p>
              </div>

              <div className="absolute bottom-4 left-4 neo-sm px-4 py-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full gradient-orange grid place-items-center text-[10px] text-primary-foreground font-bold">5G</div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Tower</p>
                  <p className="text-xs font-bold">Branch · Nairobi CBD</p>
                </div>
              </div>
            </div>
          </section>

          {/* PACKAGES */}
          <section id="packages" className="mt-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-primary uppercase">Choose Your Plan</p>
                <h3 className="text-3xl font-extrabold mt-1">Internet Packages</h3>
              </div>
              <div className="hidden md:flex gap-2 text-xs">
                {["All", "Hourly", "Daily", "Weekly", "Monthly", "Night"].map((t, i) => (
                  <button key={t} className={i === 0 ? "gradient-orange text-primary-foreground px-4 py-2 rounded-full font-semibold" : "neo-sm px-4 py-2 rounded-full font-medium"}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PACKAGES.map((p) => (
                <PackageCard key={p.id} pkg={p} onBuy={setSelected} />
              ))}
            </div>
          </section>

          {/* SIGN IN BANNER */}
          <section className="mt-14 neo p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full gradient-orange opacity-10" />
            <div className="absolute -right-10 -bottom-16 h-52 w-52 rounded-full gradient-orange opacity-5" />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 neo-sm px-3 py-1.5 mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">Members get more</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  Create an account for <span className="text-gradient-orange">more benefits</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-3 max-w-md">
                  Track usage, manage devices, top up your wallet and unlock loyalty rewards across all our hotspots.
                </p>
                <div className="flex gap-3 mt-6">
                  <button className="gradient-orange text-primary-foreground font-semibold px-6 py-3 rounded-full shadow-orange">Create Account</button>
                  <button className="neo-sm font-semibold px-6 py-3 rounded-full">Sign In</button>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-3">
                {[
                  { icon: Wallet, label: "Wallet balance" },
                  { icon: BarChart3, label: "Usage analytics" },
                  { icon: Smartphone, label: "Device management" },
                  { icon: Sparkles, label: "Faster purchases" },
                  { icon: Gift, label: "Loyalty rewards" },
                  { icon: Shield, label: "Package history" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="neo-sm p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl gradient-orange grid place-items-center">
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-semibold">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 ILNOIS Tech · White-label Hotspot Billing Platform</p>
            <div className="flex gap-5">
              <a>Terms</a><a>Privacy</a><a>Support</a><a>Status</a>
            </div>
          </footer>
        </div>
      </div>

      <PaymentModal pkg={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
