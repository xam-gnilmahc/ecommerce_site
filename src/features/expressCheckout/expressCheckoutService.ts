import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { STRIPE_INTENT_URL, STRIPE_URL, SUPABASE_ANON_KEY } from '../../config/env';
import { EXPRESS_CURRENCY, resolveShippingRate } from './expressCheckoutConfig';
import type {
  ExpressAddress,
  ExpressAuthorization,
  ExpressBuyer,
  ExpressPaymentPayload,
  ExpressPaymentResult,
  ExpressWalletId,
} from './types';

/** Shared Stripe.js instance (cached by loadStripe). */
export const stripePromise = loadStripe(STRIPE_URL);

const WALLET_LABELS: Record<ExpressWalletId, string> = {
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  paypal: 'PayPal',
  amazon_pay: 'Amazon Pay',
  link: 'Link',
  klarna: 'Klarna',
};

export const walletLabel = (wallet: string): string =>
  WALLET_LABELS[wallet as ExpressWalletId] || 'Wallet';

export class ExpressCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpressCheckoutError';
  }
}

/** Where a redirect-based wallet (PayPal, Amazon Pay) sends the customer afterwards. */
export const buildReturnUrl = (): string => {
  if (typeof window === 'undefined') return '/order';
  return `${window.location.origin}/order`;
};

/** Stripe address (line1, postal_code, …) → the shape our orders table stores. */
const toExpressAddress = (
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null,
  fallback?: ExpressAddress
): ExpressAddress | undefined => {
  if (!address && !fallback) return undefined;
  return {
    addressLine1: address?.line1 || fallback?.addressLine1 || '',
    addressLine2: address?.line2 || fallback?.addressLine2 || null,
    city: address?.city || fallback?.city || '',
    state: address?.state || fallback?.state || '',
    zipCode: address?.postal_code || fallback?.zipCode || '',
    country: address?.country || fallback?.country || '',
  };
};

export interface ConfirmExpressPaymentOptions {
  /** Wallet the customer tapped (Stripe's `expressPaymentType`). */
  wallet: string;
  /** Cart subtotal in cents, before the wallet's selected shipping rate. */
  subtotalCents: number;
  buyer: ExpressBuyer;
  /** Billing details collected by the wallet sheet. */
  billingDetails?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  /** Shipping address collected by the wallet sheet. */
  shippingAddress?: {
    name?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
  /** Shipping rate the customer left selected in the wallet sheet. */
  shippingRateId?: string | null;
  /** Cart address, used when a wallet does not return one. */
  fallbackAddress?: ExpressAddress;
  comment?: string;
}

interface CreatePaymentIntentOptions {
  /** Total in cents: cart subtotal + the shipping rate chosen in the wallet. */
  amount: number;
  wallet: ExpressWalletId;
  shippingMethod: string;
}

/**
 * Asks the server for a PaymentIntent client secret. The amount is always
 * derived here from the cart + selected shipping rate, never taken from the
 * wallet sheet, and the secret key stays on the server.
 */
const createPaymentIntent = async ({
  amount,
  wallet,
  shippingMethod,
}: CreatePaymentIntentOptions): Promise<string> => {
  let response: Response;

  try {
    response = await fetch(STRIPE_INTENT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency: EXPRESS_CURRENCY,
        wallet,
        shippingMethod,
      }),
    });
  } catch {
    throw new ExpressCheckoutError('Could not reach the payment server. Please try again.');
  }

  const payload = (await response.json().catch(() => null)) as {
    client_secret?: string;
    error?: string;
  } | null;

  if (!response.ok || !payload?.client_secret) {
    throw new ExpressCheckoutError(
      payload?.error || 'Could not start the payment. Please try again.'
    );
  }

  return payload.client_secret;
};

/**
 * Confirms the wallet payment the way Stripe documents the Express Checkout
 * Element: submit the element, create a PaymentIntent on the server, then
 * confirm it with Stripe.js so real declines are reported to the customer.
 * The order record stores the confirmed PaymentIntent id.
 */
export const confirmExpressPayment = async (
  stripe: Stripe,
  elements: StripeElements,
  options: ConfirmExpressPaymentOptions
): Promise<ExpressAuthorization> => {
  const wallet = options.wallet as ExpressWalletId;

  const { error: submitError } = await elements.submit();
  if (submitError) {
    throw new ExpressCheckoutError(submitError.message);
  }

  const shippingRate = resolveShippingRate(options.shippingRateId);
  const totalCents = Math.max(0, Math.round(options.subtotalCents + shippingRate.amount));

  const clientSecret = await createPaymentIntent({
    amount: totalCents,
    wallet,
    shippingMethod: shippingRate.id,
  });

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: { return_url: buildReturnUrl() },
    // Only redirect-based wallets (PayPal, …) leave the page; the rest settle here.
    redirect: 'if_required',
  });

  if (error) {
    // Immediate error while confirming — e.g. the wallet's card was declined.
    throw new ExpressCheckoutError(error.message || 'Payment could not be completed.');
  }

  if (!paymentIntent) {
    throw new ExpressCheckoutError(
      'The payment needs an extra step. Please finish it and try again.'
    );
  }

  if (paymentIntent.status !== 'succeeded') {
    throw new ExpressCheckoutError(
      paymentIntent.last_payment_error?.message ||
        `Payment was not completed (status: ${paymentIntent.status}).`
    );
  }

  const name =
    paymentIntent.shipping?.name ||
    options.billingDetails?.name ||
    options.shippingAddress?.name ||
    options.buyer.name;
  const email = options.billingDetails?.email || options.buyer.email;

  const finalData: ExpressPaymentPayload = {
    token: paymentIntent.id,
    token_type: 'payment_intent',
    wallet,
    payment_method_type: paymentIntent.payment_method_types?.[0] || null,
    amount: Math.round(totalCents / 100),
    name,
    email,
    address: toExpressAddress(
      paymentIntent.shipping?.address || options.shippingAddress?.address,
      options.fallbackAddress
    ),
    comment: options.comment || 'Express checkout payment for order',
  };

  const result: ExpressPaymentResult = {
    message: 'Payment successful',
    status: 'succeeded',
    wallet,
    wallet_label: walletLabel(wallet),
    payment_intent: paymentIntent.id,
    payment_method_type: finalData.payment_method_type || null,
    transactionId: paymentIntent.id,
    chargeId: null,
  };

  return {
    finalData,
    result,
    wallet,
    walletLabel: walletLabel(wallet),
    shippingMethod: shippingRate.id,
    shippingRateAmount: shippingRate.amount,
  };
};
