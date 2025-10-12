import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentCallbackRequest {
  order_id: string;
  transaction_status: string;
  payment_type: string;
  transaction_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: PaymentCallbackRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let orderStatus = 'pending';
    if (data.transaction_status === 'capture' || data.transaction_status === 'settlement') {
      orderStatus = 'paid';
    } else if (data.transaction_status === 'pending') {
      orderStatus = 'pending';
    } else if (data.transaction_status === 'deny' || data.transaction_status === 'cancel' || data.transaction_status === 'expire') {
      orderStatus = 'cancelled';
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_type: data.payment_type,
        transaction_id: data.transaction_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.order_id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update order', details: updateError }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, status: orderStatus }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
