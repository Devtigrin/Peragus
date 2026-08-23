import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ethers } from "npm:ethers@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const ABI = [
  "function transfer(address to, uint256 value) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

// Endereço oficial do seu MockUSDT na rede Amoy
const CONTRACT_ADDRESS = "0xcF430Ef1884EBf89F79fC9B9fa445CA85662400a"; 

serve(async (req) => {
  // Trata a requisição de preflight do CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 1. Puxa as variáveis que configuramos nos Secrets do Supabase
  const RPC_URL = Deno.env.get("AMOY_RPC_URL")!;
  const PRIVATE_KEY = Deno.env.get("HOT_WALLET_PRIVATE_KEY")!;
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 2. Inicializa os provedores Web3 com as variáveis corretas
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 3. Verifica saldo do operador
  let balance = "0";
  try {
    const bal = await contract.balanceOf(signer.address);
    const decimals = await contract.decimals();
    balance = ethers.formatUnits(bal, decimals);
    console.log(`Operator balance: ${balance} USDT`);
  } catch (e) {
    console.error("Failed to get operator balance:", e);
  }

  // 4. Busca operações pagas
  const { data: ops, error } = await supabase
    .from("operations")
    .select("*")
    .eq("status", "paid")
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Query error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 5. Loop de processamento e liquidação
  for (const op of ops ?? []) {
    try {
      // Evita concorrência mudando o status imediatamente para 'sending'
      await supabase
        .from("operations")
        .update({ status: "sending" })
        .eq("id", op.id);

      // Executa o envio na Blockchain
      const decimals = await contract.decimals();
      const parsed = ethers.parseUnits(op.usdt_amount.toString(), decimals);
      const tx = await contract.transfer(op.buyer_address, parsed);
      const receipt = await tx.wait();
      
      const txHash = receipt!.hash;
      const explorerUrl = `https://amoy.polygonscan.com/tx/${txHash}`;

      // Atualiza direto para completed salvando o rastro da transação
      await supabase
        .from("operations")
        .update({
          status: "completed",
          tx_hash: txHash,
          tx_explorer_url: explorerUrl,
        })
        .eq("id", op.id);

      console.log(`✅ Op ${op.id} completed: ${txHash}`);
    } catch (e: any) {
      console.error(`❌ Op ${op.id} failed:`, e);
      await supabase
        .from("operations")
        .update({ 
          status: "failed", 
          metadata: { ...op.metadata, error: e.message } 
        })
        .eq("id", op.id);
    }
  }

  return new Response(JSON.stringify({ processed: ops?.length ?? 0, operator_balance: balance }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});