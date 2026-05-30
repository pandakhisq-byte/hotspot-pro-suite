import { useEffect, useState } from "react";
import { X, Save, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    supabase.from("profiles").select("full_name,phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      setFullName(data?.full_name ?? "");
      setPhone(data?.phone ?? "");
    });
  }, [open, user]);

  if (!open) return null;

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    onClose();
  }

  async function changePassword() {
    const next = prompt("New password (min 6 chars):");
    if (!next || next.length < 6) return;
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) toast.error(error.message); else toast.success("Password updated");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-md p-4">
      <div className="neo max-w-md w-full p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 neo-sm h-9 w-9 grid place-items-center"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-2xl gradient-orange grid place-items-center shadow-orange">
            <UserIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg">Account Settings</h3>
            <p className="text-[11px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="Full Name" value={fullName} onChange={setFullName} />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="0712345678" />
        </div>

        <button onClick={save} disabled={saving} className="mt-6 w-full gradient-orange text-primary-foreground font-semibold py-3 rounded-full shadow-orange flex items-center justify-center gap-2 disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
        <button onClick={changePassword} className="mt-3 w-full neo-sm py-3 text-sm font-semibold">Change Password</button>
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
