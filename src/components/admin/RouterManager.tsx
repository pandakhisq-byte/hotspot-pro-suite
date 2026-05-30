import { useEffect, useState } from "react";
import { Router, Plus, X, Save, Plug, Power, RefreshCw, MoreVertical, Cpu, HardDrive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type RouterRow = {
  id?: string;
  name: string;
  ip: string;
  status: string;
  cpu: number;
  ram: number;
  users: number;
  bandwidth: string;
  uptime: string | null;
};

const empty: RouterRow = { name: "", ip: "", status: "offline", cpu: 0, ram: 0, users: 0, bandwidth: "0 Mbps", uptime: "-" };

export function RouterManager() {
  const [rows, setRows] = useState<RouterRow[]>([]);
  const [editing, setEditing] = useState<RouterRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("routers").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as RouterRow[]);
  }

  useEffect(() => {
    load();
    const ch = supabase.channel("routers-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "routers" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function save(r: RouterRow) {
    if (!r.name || !r.ip) return toast.error("Name and IP required");
    const { error } = r.id
      ? await supabase.from("routers").update(r).eq("id", r.id)
      : await supabase.from("routers").insert(r);
    if (error) return toast.error(error.message);
    toast.success(r.id ? "Router updated" : "Router added");
    setEditing(null);
  }

  async function remove(id: string) {
    if (!confirm("Remove this router?")) return;
    const { error } = await supabase.from("routers").delete().eq("id", id);
    if (error) return toast.error(error.message); else toast.success("Removed");
  }

  async function call(action: string, routerId?: string) {
    setBusy(`${action}-${routerId ?? "all"}`);
    const { data, error } = await supabase.functions.invoke("mikrotik-action", { body: { action, routerId } });
    setBusy(null);
    if (error) return toast.error(error.message);
    const ok = (data?.results ?? []).every((x: any) => x.ok !== false);
    ok ? toast.success(`${action}: success`) : toast.error(`${action} returned errors — check router IP / credentials`);
  }

  return (
    <div className="neo p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">MikroTik</p>
          <h3 className="text-2xl font-extrabold mt-1">Router Engine</h3>
          <p className="text-[11px] text-muted-foreground mt-1">RouterOS REST · uses MIKROTIK_USER / MIKROTIK_PASSWORD secrets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => call("sync-users")} disabled={!!busy} className="neo-sm px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
            <RefreshCw className={`h-3 w-3 ${busy?.startsWith("sync") ? "animate-spin" : ""}`} /> Sync All
          </button>
          <button onClick={() => setEditing({ ...empty })} className="gradient-orange text-primary-foreground px-3 py-2 rounded-full text-xs font-semibold shadow-orange flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add Router
          </button>
        </div>
      </div>

      {rows.length === 0 && (
        <div className="neo-inset p-6 text-center text-sm text-muted-foreground">
          No MikroTik routers yet. Click <b>Add Router</b> to register one, then hit <b>Test Connection</b> to verify the REST API is reachable.
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => {
          const statusColor = r.status === "online" ? "bg-emerald-500" : r.status === "warn" ? "bg-amber-500" : "bg-red-500";
          return (
            <div key={r.id} className="neo-sm p-4 grid grid-cols-2 md:grid-cols-8 gap-3 items-center">
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-orange grid place-items-center shadow-orange">
                  <Router className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2 truncate">
                    {r.name} <span className={`h-2 w-2 rounded-full ${statusColor} animate-pulse`} />
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{r.ip}</p>
                </div>
              </div>
              <div><p className="text-[10px] text-muted-foreground uppercase">CPU</p><p className="text-sm font-bold flex items-center gap-1"><Cpu className="h-3 w-3 text-primary" /> {r.cpu}%</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">RAM</p><p className="text-sm font-bold flex items-center gap-1"><HardDrive className="h-3 w-3 text-primary" /> {r.ram}%</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Users</p><p className="text-sm font-bold">{r.users}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Bandwidth</p><p className="text-sm font-bold">{r.bandwidth}</p></div>
              <div className="flex items-center justify-end gap-1 md:col-span-1 col-span-2">
                <button onClick={() => call("test", r.id!)} disabled={busy === `test-${r.id}`} title="Test Connection" className="neo-sm h-8 px-2 grid place-items-center flex items-center gap-1 text-[10px] font-bold">
                  <Plug className={`h-3.5 w-3.5 ${busy === `test-${r.id}` ? "animate-pulse text-primary" : ""}`} /> Test
                </button>
                <button onClick={() => call("sync", r.id!)} className="neo-sm h-8 w-8 grid place-items-center" title="Sync"><RefreshCw className="h-3.5 w-3.5" /></button>
                <button onClick={() => call("restart", r.id!)} className="neo-sm h-8 w-8 grid place-items-center" title="Restart"><Power className="h-3.5 w-3.5" /></button>
                <button onClick={() => setEditing(r)} className="neo-sm h-8 w-8 grid place-items-center" title="Edit"><MoreVertical className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(r.id!)} className="neo-sm h-8 w-8 grid place-items-center" title="Delete"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <Editor row={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function Editor({ row, onClose, onSave }: { row: RouterRow; onClose: () => void; onSave: (r: RouterRow) => void }) {
  const [r, setR] = useState<RouterRow>(row);
  const set = (k: keyof RouterRow, v: any) => setR({ ...r, [k]: v });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-md p-4 overflow-auto">
      <div className="neo max-w-md w-full p-7 relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 neo-sm h-9 w-9 grid place-items-center"><X className="h-4 w-4" /></button>
        <h3 className="font-extrabold text-xl mb-1">{row.id ? "Edit Router" : "Add MikroTik Router"}</h3>
        <p className="text-xs text-muted-foreground mb-5">Use the device's reachable IP. REST API must be enabled on RouterOS (<code>/ip/service enable www-ssl</code>).</p>
        <div className="space-y-3">
          <Field label="Name" value={r.name} onChange={(v) => set("name", v)} placeholder="Branch · Nairobi CBD" />
          <Field label="IP Address" value={r.ip} onChange={(v) => set("ip", v)} placeholder="192.168.88.1" />
        </div>
        <button onClick={() => onSave(r)} className="mt-6 w-full gradient-orange text-primary-foreground font-semibold py-3 rounded-full shadow-orange flex items-center justify-center gap-2">
          <Save className="h-4 w-4" /> Save Router
        </button>
        <p className="text-[11px] text-muted-foreground mt-3 text-center">After saving, click <b>Test</b> on the row to verify the connection.</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-muted-foreground">{label}</label>
      <div className="neo-inset px-3 py-2.5 mt-1">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-transparent outline-none w-full text-sm" />
      </div>
    </div>
  );
}
