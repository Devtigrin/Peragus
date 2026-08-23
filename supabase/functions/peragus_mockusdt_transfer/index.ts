import { ethers } from "npm:ethers@6.13.5";
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

function isHexAddress(s: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(s);
}

function assertHexAddress(addr: unknown, field: string): string {
  if (typeof addr !== "string") throw new Error(`${field} must be a string`);
  const v = addr.trim();
  if (!isHexAddress(v)) throw new Error(`${field} must be a valid EVM address`);
  return v;
}

function assertNonEmptyString(v: unknown, field: string): string {
  if (typeof v !== "string" || v.trim().length === 0) throw new Error(`${field} is required`);
  return v.trim();
}

function assertAmountString(v: unknown): string {
  if (typeof v !== "string") throw new Error("amount must be a string");
  const s = v.trim();
  if (s.length === 0) throw new Error("amount is required");
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error("amount must be a positive numeric string");
  if (s === "0" || /^0+(\.0+)?$/.test(s)) throw new Error("amount must be > 0");
  return s;
}

async function getUserIdFromJwt(req: Request): Promise<string> {
  const supabaseUrl = requireEnv("SUPABASE_URL");
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

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: number | undefined;
  const timeout = new Promise<T>((_, reject) => {
    t = setTimeout(() => reject(new Error("timeout waiting transaction receipt")), ms);
  });
  return Promise.race([p, timeout]).finally(() => {
    if (t) clearTimeout(t);
  });
}

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  try {
    const userId = await getUserIdFromJwt(req);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "Invalid JSON body" }, 400);

    const receiver_wallet = assertHexAddress((body as any).receiver_wallet, "receiver_wallet");
    const request_id = assertNonEmptyString((body as any).request_id, "request_id");
    const amountStr = assertAmountString((body as any).amount);

    const chain = typeof (body as any).chain === "string" && (body as any).chain.trim() ? (body as any).chain.trim() : "polygon-amoy";
    const token_symbol = typeof (body as any).token_symbol === "string" && (body as any).token_symbol.trim() ? (body as any).token_symbol.trim() : "MOCKUSDT";

    const MOCKUSDT_CONTRACT_ADDRESS = assertHexAddress(requireEnv("MOCKUSDT_CONTRACT_ADDRESS"), "MOCKUSDT_CONTRACT_ADDRESS");
    const MOCKUSDT_DECIMALS = Number(requireEnv("MOCKUSDT_DECIMALS"));
    if (!Number.isInteger(MOCKUSDT_DECIMALS) || MOCKUSDT_DECIMALS < 0 || MOCKUSDT_DECIMALS > 18) {
      throw new Error("MOCKUSDT_DECIMALS must be an integer between 0 and 18");
    }

    const RPC_URL = requireEnv("RPC_URL");
    const PRIVATE_KEY = requireEnv("PRIVATE_KEY");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // -------------------- Idempotent insert --------------------
    let operationId: string;

    try {
      const { data, error } = await supabase
        .from("operations")
        .insert({
          user_id: userId,
          request_id,
          status: "pending",
          chain,
          token_symbol,
          usdt_amount_text: amountStr,
          wallet_address: wallet.address,
          sender_wallet: wallet.address,
          receiver_wallet,
          contract_address: MOCKUSDT_CONTRACT_ADDRESS,
          error_message: null,
        })
        .select("id")
        .single();

      if (error) throw error;
      if (!data?.id) throw new Error("Failed to insert operation");
      operationId = data.id;
    } catch (err: any) {
      const code = err?.code ?? err?.extensions?.code;
      if (code !== "23505") throw err;

      const { data: existing, error: exErr } = await supabase
        .from("operations")
        .select("id", "status")
        .eq("user_id", userId)
        .eq("request_id", request_id)
        .maybeSingle();

      if (exErr) throw exErr;
      if (!existing?.id) throw new Error("Idempotency collision but operation not found");

      return json({
        ok: true,
        operation_id: existing.id,
        status: existing.status,
        idempotent: true,
      });
    }

    const background = (async () => {
      try {
        await supabase.from("operations").update({ status: "submitted" }).eq("id", operationId);

        const token = new ethers.Contract(MOCKUSDT_CONTRACT_ADDRESS, ERC20_ABI, wallet);
        const decimalsOnChain = Number(await token.decimals());
        if (decimalsOnChain !== MOCKUSDT_DECIMALS) {
          throw new Error(`decimals mismatch: expected ${MOCKUSDT_DECIMALS}, got ${decimalsOnChain}`);
        }

        const amountInUnits = ethers.parseUnits(amountStr, decimalsOnChain);

        const balance = await token.balanceOf(wallet.address);
        if (balance < amountInUnits) throw new Error("insufficient MockUSDT balance in hot wallet");

        const native = await provider.getBalance(wallet.address);
        if (native <= 0n) throw new Error("insufficient native balance for gas in hot wallet");

        const tx = await token.transfer(receiver_wallet, amountInUnits);
        const receipt = await withTimeout(tx.wait(), 180_000);

        const txHash = receipt.hash;
        const blockNumber = receipt.blockNumber;
        const gasUsed = (receipt as any).gasUsed ?? null;
        const transaction_status = receipt.status === 1n ? "success" : "reverted";

        if (receipt.status === 1n) {
          await supabase
            .from("operations")
            .update({
              status: "confirmed",
              tx_hash: txHash,
              block_number: blockNumber,
              gas_used: gasUsed,
              transaction_status,
              error_message: null,
            })
            .eq("id", operationId);
        } else {
          await supabase
            .from("operations")
            .update({
              status: "failed",
              tx_hash: txHash,
              block_number: blockNumber,
              gas_used: gasUsed,
              transaction_status,
              error_message: "Transaction reverted",
            })
            .eq("id", operationId);
        }
      } catch (err) {
        const message = safeErrorMessage(err);
        try {
          await supabase
            .from("operations")
            .update({ status: "failed", error_message: message })
            .eq("id", operationId);
        } catch {
          // ignore
        }
        throw err;
      }
    })();

    // @ts-ignore
    EdgeRuntime.waitUntil(background);

    return json({ ok: true, operation_id: operationId, status: "pending" });
  } catch (err) {
    return json({ error: safeErrorMessage(err) }, 400);
  }
});
