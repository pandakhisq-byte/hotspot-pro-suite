import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wifi, Mail, Lock, User, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const schema = z.object({
  full_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: form.full_name, phone: form.phone },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email to confirm.");
    nav("/login");
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error(String(r.error));
  }

  return (
    <div className="min-h-screen bg-background grid place-items-center p-4">
      <div className="neo w-full max-w-md p-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-2xl gradient-orange grid place-items-center shadow-orange">
            <Wifi className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-lg">ILNOIS<span className="text-gradient-orange">Tech</span></span>
        </Link>

        <h2 className="text-2xl font-extrabold">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-1">Track usage, manage devices and unlock loyalty rewards.</p>

        <button onClick={google} type="button" className="mt-6 w-full neo-sm py-3 rounded-full font-semibold flex items-center justify-center gap-3 text-sm">
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.08z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.13A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.46.34-2.13V7.03H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.97l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.03l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <Field icon={User} value={form.full_name} onChange={(v: string) => setForm({ ...form, full_name: v })} placeholder="Full name" />
          <Field icon={Smartphone} value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} placeholder="Phone (+2547…)" />
          <Field icon={Mail} value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} placeholder="Email" type="email" />
          <Field icon={Lock} value={form.password} onChange={(v: string) => setForm({ ...form, password: v })} placeholder="Password (min 6)" type="password" />

          <button disabled={loading} className="w-full gradient-orange text-primary-foreground font-semibold py-3.5 rounded-full shadow-orange disabled:opacity-60">
            {loading ? "Creating…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already a member? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, ...props }: any) {
  return (
    <div className="neo-inset flex items-center gap-2 px-4 py-3">
      <Icon className="h-4 w-4 text-primary" />
      <input {...props} onChange={(e) => props.onChange(e.target.value)} className="bg-transparent outline-none flex-1 text-sm" required />
    </div>
  );
}
