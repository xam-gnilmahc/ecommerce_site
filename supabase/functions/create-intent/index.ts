import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

console.info('create-intent function started');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

const ALLOWED_CURRENCIES = new Set(['usd']);
const MIN_AMOUNT_CENTS = 50;
const MAX_AMOUNT_CENTS = 99999999;

async function callStripe(endpoint: string, params: Record<string, any>, apiKey: string) {
  const body = new URLSearchParams();

  function appendParams(obj: any, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      const paramName = prefix ? `${prefix}[${key}]` : key;
      if (typeof value === 'object') {
        appendParams(value, paramName);
      } else {
        body.append(paramName, String(value));
      }
    }
  }

  appendParams(params);

  const response = await fetch(`https://api.stripe.com/v1/${endpoint.replace(/^\//, '')}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2023-08-16',
    },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw { message: data.error?.message || 'Stripe API error', raw: data.error };
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    const body = await req.json();

    // The browser sends the total in cents (cart + shipping rate selected in
    // the wallet sheet), matching the amount configured on the Elements instance.
    const amount = Number(body.amount);
    const currency = String(body.currency || 'usd').toLowerCase();

    if (!Number.isInteger(amount) || amount < MIN_AMOUNT_CENTS || amount > MAX_AMOUNT_CENTS) {
      throw new Error('Invalid payment amount.');
    }

    if (!ALLOWED_CURRENCIES.has(currency)) {
      throw new Error('Unsupported currency.');
    }

    const metadata: Record<string, string> = {};
    if (body.wallet) metadata.wallet = String(body.wallet).slice(0, 100);
    if (body.shippingMethod) metadata.shipping_method = String(body.shippingMethod).slice(0, 100);

    const params: Record<string, any> = {
      amount,
      currency,
      description: 'Payment for order',
      automatic_payment_methods: { enabled: true },
      metadata,
    };

    const intent = await callStripe('payment_intents', params, STRIPE_SECRET_KEY);

    // The client passes this secret to stripe.confirmPayment({ elements, clientSecret }).
    return new Response(
      JSON.stringify({
        client_secret: intent.client_secret,
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
      }),
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || 'Could not create the payment intent.',
        details: error?.raw || undefined,
      }),
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }
});
