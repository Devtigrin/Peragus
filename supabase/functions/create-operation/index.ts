import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ethers } from "npm:ethers@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return null;
}

async function getUserFromReq(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Missing Authorization header");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (error || !user) throw new Error("Invalid token");
  return user;
}

function isValidAddress(addr: string): boolean {
  try {
    return ethers.isAddress(addr);
  } catch {
    return false;
  }
}

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const user = await getUserFromReq(req);
    const body = await req.json();

    // Idempotência
    const { request_id } = body;
    if (!request_id || typeof request_id !== "string") {
      throw new Error("request_id is required (idempotency key)");
    }

    // Campos necessários
    const { buyer_address, usdt_amount, pix_code, pix_expires_at, chain } = body;

    if (!buyer_address || !isValidAddress(buyer_address)) {
      throw new Error("Invalid buyer_address");
    }

    if (typeof usdt_amount !== "number" || usdt_amount < 10) {
      throw new Error("Minimum 10 USDT");
    }

    if (!chain || typeof chain !== "string") {
      throw new Error("chain is required");
    }

    // Extras (não existem como colunas na tabela, então vão para metadata)
    const { brl_amount, exchange_rate } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // token_symbol sempre USDT
    const payload = {
      user_id: user.id,
      request_id,

      wallet_address: buyer_address.toLowerCase(),
      chain,
      token_symbol: "USDT",

      amount: usdt_amount,

      pix_code: pix_code ?? null,
      pix_expires_at: pix_expires_at ?? null,

      status: "pending",

      metadata: {
        ...(brl_amount !== undefined ? { brl_amount } : {}),
        ...(exchange_rate !== undefined ? { exchange_rate } : {}),
      },
    };

    // Idempotência via (user_id, request_id)
    // Observação: status do CHECK é pending|submitted|confirmed|failed
    const { data, error } = await supabase
      .from("operations")
      .upsert(payload, {
        onConflict: "user_id,request_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ operation: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});