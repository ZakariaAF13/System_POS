import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateTransactionRequest {
  orderId: string;
  amount: number;
  paymentType: 'qris' | 'gopay' | 'ovo';
  customerName?: string;
  phone?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { orderId, amount, paymentType, customerName, phone }: CreateTransactionRequest = await req.json();

    const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY');
    if (!MIDTRANS_SERVER_KEY) {
      return new Response(
        JSON.stringify({ error: 'Midtrans not configured. Please set MIDTRANS_SERVER_KEY' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authString = btoa(MIDTRANS_SERVER_KEY + ':');
    const isSandbox = MIDTRANS_SERVER_KEY.includes('SB-');
    const midtransUrl = isSandbox
      ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
      : 'https://app.midtrans.com/snap/v1/transactions';

    const paymentParams: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName || 'Customer',
        phone: phone || '08123456789',
      },
    };

    if (paymentType === 'gopay') {
      paymentParams.enabled_payments = ['gopay'];
    } else if (paymentType === 'ovo') {
      paymentParams.enabled_payments = ['other_qris'];
    } else if (paymentType === 'qris') {
      paymentParams.enabled_payments = ['qris'];
    }

    const response = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + authString,
      },
      body: JSON.stringify(paymentParams),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction', details: data }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ token: data.token, redirect_url: data.redirect_url }),
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
