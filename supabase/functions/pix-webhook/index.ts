import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ===== _shared/cors.ts =====
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return null;
}

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    // TODO: Validar assinatura do provedor Pix (Mercado Pago, Asaas, etc.)
    // const signature = req.headers.get("x-signature");
    // if (!verifySignature(signature, await req.text())) throw new Error("Invalid signature");

    const body = await req.json();
    const { operation_id, status, pix_data } = body; // adapta ao formato do provedor

    if (!operation_id || !status) {
      throw new Error("Missing operation_id or status");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (status === "paid" || status === "approved") {
      await supabase
        .from("operations")
        .update({
          status: "paid",
          metadata: { ...pix_data, paid_at: new Date().toISOString() },
        })
        .eq("id", operation_id);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});