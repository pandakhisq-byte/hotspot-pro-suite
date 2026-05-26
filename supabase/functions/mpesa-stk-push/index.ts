// M-Pesa Daraja STK Push initiator.
// Required runtime secrets (add later via Lovable Cloud secrets):
//   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE,
//   MPESA_PASSKEY, MPESA_CALLBACK_URL, MPESA_ENV ("sandbox" | "production")

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supa = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function normalizePhone(p: string): string {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("254")) return d;
  if (d.startsWith("0")) return "254" + d.slice(1);
  if (d.startsWith("7") || d.startsWith("1")) return "254" + d;
  return d;
}

async function getToken(env: string) {
  const key = Deno.env.get("MPESA_CONSUMER_KEY")!;
  const secret = Deno.env.get("MPESA_CONSUMER_SECRET")!;
  const host = env === "production" ? "api.safaricom.co.ke" : "sandbox.safaricom.co.ke";
  const r = await fetch(`https://${host}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: "Basic " + btoa(`${key}:${secret}`) },
  });
  const j = await r.json();
  return { token: j.access_token as string, host };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { phone, packageId } = await req.json();
    if (!phone || !packageId) throw new Error("phone and packageId required");

    const { data: pkg, error: pkgErr } = await supa
      .from("packages").select("id,name,price").eq("id", packageId).maybeSingle();
    if (pkgErr || !pkg) throw new Error("Package not found");

    const msisdn = normalizePhone(phone);
    const amount = Math.max(1, Math.round(Number(pkg.price)));

    // Resolve user (optional)
    let userId: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const { data } = await supa.auth.getUser(auth.slice(7));
      userId = data.user?.id ?? null;
    }

    // Record pending transaction
    const { data: tx, error: txErr } = await supa.from("transactions").insert({
      user_id: userId, package_id: pkg.id, phone: msisdn, amount, status: "pending",
    }).select("id").single();
    if (txErr) throw txErr;

    const env = Deno.env.get("MPESA_ENV") ?? "sandbox";
    const shortcode = Deno.env.get("MPESA_SHORTCODE")!;
    const passkey = Deno.env.get("MPESA_PASSKEY")!;
    const callback = Deno.env.get("MPESA_CALLBACK_URL")!;
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${ts}`);

    const { token, host } = await getToken(env);
    const stk = await fetch(`https://${host}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: msisdn,
        PartyB: shortcode,
        PhoneNumber: msisdn,
        CallBackURL: callback,
        AccountReference: `ILNOIS-${tx.id.slice(0, 8)}`,
        TransactionDesc: pkg.name,
      }),
    });
    const stkJson = await stk.json();

    await supa.from("transactions").update({
      mpesa_receipt: stkJson.CheckoutRequestID ?? null,
    }).eq("id", tx.id);

    return new Response(JSON.stringify({ ok: true, transactionId: tx.id, mpesa: stkJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as Error).message) }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
