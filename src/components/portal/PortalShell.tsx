import { Link, useLocation, useNavigate } from "react-router-dom";
import { Wifi, Settings, LogOut, User as UserIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { SettingsModal } from "@/components/SettingsModal";
import { NotificationsPopover } from "@/components/NotificationsPopover";

export function PortalShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const tabs = [
    { to: "/", label: "Portal" },
    { to: "/dashboard", label: "Dashboard" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="neo p-5 md:p-8">
          <header className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl gradient-orange grid place-items-center shadow-orange">
                <Wifi className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg leading-none">ILNOIS<span className="text-gradient-orange">Tech</span></h1>
                <p className="text-[10px] text-muted-foreground">Hotspot Network</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
              {tabs.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link key={n.to} to={n.to}
                    className={active ? "gradient-orange text-primary-foreground px-4 py-2 rounded-full font-semibold" : "neo-sm px-4 py-2 rounded-full text-muted-foreground"}>
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={() => setSettingsOpen(true)} title="Settings" className="neo-sm h-10 w-10 grid place-items-center">
                <Settings className="h-4 w-4" />
              </button>
              <NotificationsPopover />
              {user ? (
                <button onClick={async () => { await signOut(); nav("/"); }} className="neo-sm h-10 px-4 grid place-items-center gap-2 flex text-sm font-semibold">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              ) : (
                <Link to="/login" className="neo-sm h-10 px-4 grid place-items-center gap-2 flex text-sm font-semibold">
                  <UserIcon className="h-4 w-4" /> Sign in
                </Link>
              )}
            </div>
          </header>

          {children}
        </div>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
