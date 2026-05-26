import { useState } from "react";
import { Link } from "react-router-dom";
import { Wifi, Smartphone, Mail, Lock, KeyRound } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState<"password" | "otp">("password");
  return (
    <div className="min-h-screen bg-background grid place-items-center p-4">
      <div className="neo w-full max-w-md p-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-2xl gradient-orange grid place-items-center shadow-orange">
            <Wifi className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-lg">ILNOIS<span className="text-gradient-orange">Tech</span></span>
        </Link>

        <h2 className="text-2xl font-extrabold">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to manage your packages, devices and wallet.</p>

        <div className="neo-inset p-1 mt-6 grid grid-cols-2 gap-1">
          <button
            onClick={() => setMode("password")}
            className={mode === "password" ? "gradient-orange text-primary-foreground rounded-lg py-2 text-sm font-semibold" : "py-2 text-sm font-medium text-muted-foreground"}
          >Password</button>
          <button
            onClick={() => setMode("otp")}
            className={mode === "otp" ? "gradient-orange text-primary-foreground rounded-lg py-2 text-sm font-semibold" : "py-2 text-sm font-medium text-muted-foreground"}
          >OTP</button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); /* TODO: api.signIn */ }}>
          <div className="neo-inset flex items-center gap-2 px-4 py-3">
            {mode === "password" ? <Mail className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-primary" />}
            <input
              placeholder={mode === "password" ? "Phone or Email" : "Phone number"}
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
          {mode === "password" ? (
            <div className="neo-inset flex items-center gap-2 px-4 py-3">
              <Lock className="h-4 w-4 text-primary" />
              <input type="password" placeholder="Password" className="bg-transparent outline-none flex-1 text-sm" />
            </div>
          ) : (
            <div className="neo-inset flex items-center gap-2 px-4 py-3">
              <KeyRound className="h-4 w-4 text-primary" />
              <input placeholder="6-digit code" className="bg-transparent outline-none flex-1 text-sm" inputMode="numeric" />
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" defaultChecked /> Remember this device (MAC binding)
          </label>

          <button className="w-full gradient-orange text-primary-foreground font-semibold py-3.5 rounded-full shadow-orange">
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          New here? <Link to="/login" className="text-primary font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
