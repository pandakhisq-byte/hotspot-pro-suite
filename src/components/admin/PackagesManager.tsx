import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Pkg = {
  id?: string;
  name: string;
  price: number;
  duration: string;
  download: string;
  upload: string;
  data_limit: string;
  badge: string | null;
  features: string[];
  active: boolean;
  sort_order: number;
};

const empty: Pkg = {
  name: "", price: 0, duration: "", download: "", upload: "",
  data_limit: "", badge: null, features: [], active: true, sort_order: 0,
};

export function PackagesManager() {
  const [rows, setRows] = useState<Pkg[]>([]);
  const [editing, setEditing] = useState<Pkg | null>(null);

  async function load() {
    const { data } = await supabase.from("packages").select("*").order("sort_order");
    setRows((data ?? []) as Pkg[]);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("pkgs-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function save(p: Pkg) {
    const payload = { ...p, features: p.features ?? [] };
    const { error } = p.id
      ? await supabase.from("packages").update(payload).eq("id", p.id)
      : await supabase.from("packages").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(p.id ? "Package updated" : "Package created");
    setEditing(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this package?")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  }

  return (
    <div className="neo p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">Catalog</p>
          <h3 className="text-2xl font-extrabold mt-1">Packages</h3>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="gradient-orange text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold shadow-orange flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" /> New Package
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((p) => (
          <div key={p.id} className="neo-sm p-4 grid grid-cols-2 md:grid-cols-7 gap-3 items-center">
            <div className="md:col-span-2">
              <p className="font-bold text-sm flex items-center gap-2">
                {p.name}
                {p.badge && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full gradient-orange text-primary-foreground">{p.badge}</span>}
                {!p.active && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">HIDDEN</span>}
              </p>
              <p className="text-[11px] text-muted-foreground">{p.duration}</p>
            </div>
            <Cell label="Price" value={`KSh ${p.price}`} />
            <Cell label="Down" value={p.download} />
            <Cell label="Up" value={p.upload} />
            <Cell label="Data" value={p.data_limit} />
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => setEditing(p)} className="neo-sm h-8 w-8 grid place-items-center"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => remove(p.id!)} className="neo-sm h-8 w-8 grid place-items-center"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && <Editor pkg={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-bold truncate">{value}</p>
    </div>
  );
}

function Editor({ pkg, onClose, onSave }: { pkg: Pkg; onClose: () => void; onSave: (p: Pkg) => void }) {
  const [p, setP] = useState<Pkg>(pkg);
  const set = (k: keyof Pkg, v: any) => setP({ ...p, [k]: v });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-md p-4 overflow-auto">
      <div className="neo max-w-lg w-full p-7 relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 neo-sm h-9 w-9 grid place-items-center"><X className="h-4 w-4" /></button>
        <h3 className="font-extrabold text-xl mb-5">{pkg.id ? "Edit Package" : "New Package"}</h3>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" value={p.name} onChange={(v) => set("name", v)} className="col-span-2" />
          <Field label="Price (KSh)" type="number" value={String(p.price)} onChange={(v) => set("price", Number(v))} />
          <Field label="Duration" value={p.duration} onChange={(v) => set("duration", v)} placeholder="24 Hours" />
          <Field label="Download" value={p.download} onChange={(v) => set("download", v)} placeholder="10 Mbps" />
          <Field label="Upload" value={p.upload} onChange={(v) => set("upload", v)} placeholder="5 Mbps" />
          <Field label="Data Limit" value={p.data_limit} onChange={(v) => set("data_limit", v)} placeholder="2 GB" />
          <Field label="Badge" value={p.badge ?? ""} onChange={(v) => set("badge", v || null)} placeholder="Popular / Best Value / Night" />
          <Field label="Features (comma-sep)" className="col-span-2" value={(p.features ?? []).join(", ")} onChange={(v) => set("features", v.split(",").map((s) => s.trim()).filter(Boolean))} />
          <Field label="Sort order" type="number" value={String(p.sort_order)} onChange={(v) => set("sort_order", Number(v))} />
          <label className="flex items-center gap-2 text-sm mt-6">
            <input type="checkbox" checked={p.active} onChange={(e) => set("active", e.target.checked)} /> Active (visible)
          </label>
        </div>

        <button onClick={() => onSave(p)} className="mt-6 w-full gradient-orange text-primary-foreground font-semibold py-3 rounded-full shadow-orange flex items-center justify-center gap-2">
          <Save className="h-4 w-4" /> Save Package
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="text-[11px] font-semibold text-muted-foreground">{label}</label>
      <div className="neo-inset px-3 py-2.5 mt-1">
        <input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder} className="bg-transparent outline-none w-full text-sm" />
      </div>
    </div>
  );
}
