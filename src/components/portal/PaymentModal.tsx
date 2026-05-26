import { useEffect, useState } from "react";
import { X, Smartphone, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Package } from "./PackageCard";

type Status = "input" | "waiting" | "success" | "failed";

export function PaymentModal({
  pkg,
  onClose,
}: {
  pkg: Package | null;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("input");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!pkg) {
      setStatus("input");
      setPhone("");
      setCountdown(60);
    }
  }, [pkg]);

  useEffect(() => {
    if (status !== "waiting") return;
    if (countdown <= 0) {
      setStatus("failed");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown]);

  if (!pkg) return null;

  const sendStk = () => {
    if (!/^(?:\+?254|0)?7\d{8}$/.test(phone.replace(/\s/g, ""))) {
      alert("Enter a valid Safaricom number e.g. 0712345678");
      return;
    }
    setStatus("waiting");
    setCountdown(60);
    // TODO: POST /api/payments/stk-push { phone, packageId }
    // Simulated successful confirmation for demo
    setTimeout(() => setStatus("success"), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-md p-4">
      <div className="neo max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 neo-sm h-9 w-9 grid place-items-center">
          <X className="h-4 w-4" />
        </button>

        {status === "input" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 grid place-items-center text-white font-extrabold">M</div>
              <div>
                <h3 className="font-bold text-lg">M-Pesa Payment</h3>
                <p className="text-xs text-muted-foreground">Lipa Na M-Pesa STK Push</p>
              </div>
            </div>

            <div className="neo-inset p-4 mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Package</span>
                <span className="font-semibold">{pkg.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">{pkg.duration}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-border">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-extrabold text-gradient-orange">KSh {pkg.price}</span>
              </div>
            </div>

            <label className="text-xs font-semibold text-muted-foreground">M-Pesa Phone Number</label>
            <div className="neo-inset flex items-center gap-2 px-4 py-3 mt-2 mb-5">
              <Smartphone className="h-4 w-4 text-primary" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                className="bg-transparent outline-none flex-1 text-sm"
                inputMode="tel"
              />
            </div>

            <button onClick={sendStk} className="w-full gradient-orange text-primary-foreground font-semibold py-3.5 rounded-full shadow-orange">
              Send STK Push
            </button>
          </>
        )}

        {status === "waiting" && (
          <div className="text-center py-4">
            <div className="relative h-32 w-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full gradient-orange opacity-20 pulse-ring" />
              <div className="absolute inset-3 neo grid place-items-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="font-bold text-lg">Waiting for confirmation</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your M-Pesa PIN on <span className="font-semibold text-foreground">{phone}</span> to complete payment of <span className="font-semibold text-foreground">KSh {pkg.price}</span>
            </p>
            <div className="mt-6 neo-inset inline-flex px-5 py-2 text-sm font-bold">
              {countdown}s
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-4">
            <div className="h-20 w-20 mx-auto neo grid place-items-center mb-5">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="font-bold text-xl">Payment Successful</h3>
            <p className="text-sm text-muted-foreground mt-2">Your <b>{pkg.name}</b> is now active. Enjoy browsing!</p>
            <button onClick={onClose} className="mt-6 w-full gradient-orange text-primary-foreground font-semibold py-3 rounded-full shadow-orange">
              Start Browsing
            </button>
            <button className="mt-3 text-xs text-muted-foreground underline">
              Want more features? Sign in or create account
            </button>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center py-4">
            <div className="h-20 w-20 mx-auto neo grid place-items-center mb-5">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="font-bold text-xl">Payment Failed</h3>
            <p className="text-sm text-muted-foreground mt-2">We didn't receive your payment. Try again?</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStatus("input")} className="flex-1 neo-sm py-3 font-semibold text-sm">Change Number</button>
              <button onClick={sendStk} className="flex-1 gradient-orange text-primary-foreground font-semibold py-3 rounded-full shadow-orange">Retry</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
