// M-Pesa Daraja callback. Public webhook — no JWT.
// Configure MPESA_CALLBACK_URL in Safaricom Daraja to point here.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supa = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const cb = body?.Body?.stkCallback;
    if (!cb) return new Response("ignored");

    const checkoutId = cb.CheckoutRequestID as string;
    const code = cb.ResultCode as number;
    const meta: Array<{ Name: string; Value: any }> = cb.CallbackMetadata?.Item ?? [];
    const receipt = meta.find((m) => m.Name === "MpesaReceiptNumber")?.Value as string | undefined;

    const status = code === 0 ? "success" : "failed";

    await supa.from("transactions")
      .update({ status, mpesa_receipt: receipt ?? checkoutId })
      .eq("mpesa_receipt", checkoutId);

    // TODO: on success, trigger mikrotik-action(activate) for this transaction.

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: String((e as Error).message) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
