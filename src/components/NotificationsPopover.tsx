import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Notif = { id: string; title: string; body: string; status: string; created_at: string };

export function NotificationsPopover() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [seenAt, setSeenAt] = useState<number>(() => Number(localStorage.getItem("notif-seen") ?? 0));
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    if (!user) { setItems([]); return; }
    const { data } = await supabase
      .from("transactions")
      .select("id,amount,status,created_at,packages(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setItems((data ?? []).map((t: any) => ({
      id: t.id,
      title: t.status === "success" ? "Payment confirmed" : t.status === "failed" ? "Payment failed" : "Payment pending",
      body: `${t.packages?.name ?? "Package"} · KSh ${t.amount}`,
      status: t.status,
      created_at: t.created_at,
    })));
  }

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel(`notif-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((i) => new Date(i.created_at).getTime() > seenAt).length;

  function toggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      const now = Date.now();
      setSeenAt(now);
      localStorage.setItem("notif-seen", String(now));
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="neo-sm h-10 w-10 grid place-items-center relative">
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full gradient-orange text-[9px] font-bold text-primary-foreground grid place-items-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 neo p-3 z-40">
          <p className="text-xs font-bold tracking-widest text-primary uppercase px-2 pb-2">Notifications</p>
          {items.length === 0 && <p className="text-xs text-muted-foreground p-3 text-center">You're all caught up.</p>}
          <ul className="max-h-80 overflow-auto space-y-2">
            {items.map((n) => {
              const Icon = n.status === "success" ? CheckCircle2 : n.status === "failed" ? XCircle : Clock;
              const color = n.status === "success" ? "text-emerald-500" : n.status === "failed" ? "text-destructive" : "text-amber-500";
              return (
                <li key={n.id} className="neo-sm p-3 flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
