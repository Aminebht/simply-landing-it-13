import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  orderId: string;
  successUrl: string;
  failUrl: string;
  user: {
    email: string;
    name: string;
  };
  userId?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { amount, orderId, successUrl, failUrl, user, userId }: PaymentRequest = await req.json();
    
    logStep("Payment request received", { amount, orderId, userEmail: user.email, userId });

    // For demo purposes, create a mock payment URL
    // In production, this would integrate with actual payment gateway (Konnect)
    const paymentUrl = `https://api.konnect.network/api/v2/payments/init-payment`;
    
    const paymentPayload = {
      receiverWalletId: "wallet_id", // Replace with actual wallet ID
      amount: amount,
      token: "TND",
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      orderId: orderId,
      firstName: user.name.split(' ')[0] || user.name,
      lastName: user.name.split(' ')[1] || '',
      phoneNumber: "21600000000", // Default phone
      email: user.email,
      successUrl: successUrl,
      failUrl: failUrl,
      theme: "light"
    };

    logStep("Creating Konnect payment", paymentPayload);

    // Mock response for demo - replace with actual Konnect API call
    const mockPayUrl = `https://gateway.sandbox.konnect.network/payment?paymentRef=${orderId}&amount=${amount}&email=${encodeURIComponent(user.email)}`;
    
    logStep("Payment URL generated", { payUrl: mockPayUrl });

    return new Response(JSON.stringify({ 
      payUrl: mockPayUrl,
      paymentRef: orderId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});