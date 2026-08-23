import { createClient } from "npm:@supabase/supabase-js@2";
import { createLocalJWKSet, jwtVerify } from "npm:jose@5";

function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is required`);
  return v;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

async function getUserIdFromJwt(req: Request, supabaseUrl: string): Promise<string> {
  const SUPABASE_JWKS = requireEnv("SUPABASE_JWKS");
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) throw new Error("Unauthorized: missing Bearer token");
  const accessToken = authHeader.slice("Bearer ".length);

  const JWKS = createLocalJWKSet(JSON.parse(SUPABASE_JWKS));
  const jwtIssuer = `${supabaseUrl}/auth/v1`;

  const { payload } = await jwtVerify(accessToken, JWKS, {
    algorithms: ["ES256", "RS256", "EdDSA"],
    issuer: jwtIssuer,
  });

  const sub = payload.sub;
  if (typeof sub !== "string" || sub.length < 10) throw new Error("Unauthorized: invalid JWT sub");
  return sub;
}

Deno.serve(async (req) => {
  if (req.method !== "GET") return json({ error: "Method Not Allowed" }, 405);

  try {
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const userId = await getUserIdFromJwt(req, supabaseUrl);

    const url = new URL(req.url);
    const operation_id = url.searchParams.get("id");
    if (!operation_id) return json({ error: "id is required" }, 400);

    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // Seleciona SOMENTE colunas existentes em public.operations
    const columns = [
      "id",
      "user_id",
      "status",
      "chain",
      "token_symbol",
      "amount",
      "wallet_address",
      "request_json",
      "tx_hash",
      "error_message",
      "created_at",
      "updated_at",
      "request_id",
      "usdt_amount_text",
      "sender_wallet",
      "receiver_wallet",
      "contract_address",
      "block_number",
      "gas_used",
      "transaction_status",
      "metadata",
      // note: algumas colunas acima podem ser null/ausentes no seu fluxo; ainda assim fazem parte da tabela
    ];

    const { data, error } = await supabase
      .from("operations")
      .select(columns.join(","))
      .eq("id", operation_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return json({ error: "Operation not found" }, 404);

    return json({ ok: true, operation: data });
  } catch (err) {
    return json({ error: safeErrorMessage(err) }, 401);
  }
});
