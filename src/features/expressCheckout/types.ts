/** One-click wallets offered by the express checkout section. */
export type ExpressWalletId =
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'amazon_pay'
  | 'link'
  | 'klarna';

/** A product line shown inside the wallet payment sheet. Amounts are in cents. */
export interface ExpressLineItem {
  name: string;
  amount: number;
}

/** Shipping rate shown inside the wallet payment sheet. Amounts are in cents. */
export interface ExpressShippingRate {
  id: string;
  displayName: string;
  amount: number;
  deliveryEstimate?: {
    minimum?: { unit: 'hour' | 'day' | 'business_day' | 'week' | 'month'; value: number };
    maximum?: { unit: 'hour' | 'day' | 'business_day' | 'week' | 'month'; value: number };
  };
}

/** Buyer details known before the wallet sheet opens. */
export interface ExpressBuyer {
  name?: string;
  email?: string;
  phone?: string;
}

/** Address shape written to the order record (matches the card flow). */
export interface ExpressAddress {
  addressLine1?: string;
  addressLine2?: string | null;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
}

/**
 * Payment details written to the order record after Stripe.js confirms the
 * wallet in the browser (no server round-trip).
 */
export interface ExpressPaymentPayload {
  token: string;
  token_type: 'payment_intent' | 'confirmation_token';
  wallet: ExpressWalletId;
  payment_method_type?: string | null;
  amount: number;
  name?: string;
  email?: string;
  address?: ExpressAddress;
  comment?: string;
}

/** Result of the browser-side Stripe confirmation, stored on the order. */
export interface ExpressPaymentResult {
  message: string;
  /** 'succeeded' — Stripe confirmed the PaymentIntent; 'authorized' — wallet only. */
  status?: 'authorized' | 'succeeded';
  error?: string;
  [key: string]: unknown;
}

/** Everything the checkout page needs to place the order after a wallet authorises payment. */
export interface ExpressAuthorization {
  finalData: ExpressPaymentPayload;
  result: ExpressPaymentResult;
  wallet: ExpressWalletId;
  walletLabel: string;
  /** 'free' or 'express' — matches EXPRESS_SHIPPING_RATES ids */
  shippingMethod: string;
  /** Shipping cost in cents that the wallet sheet showed to the customer. */
  shippingRateAmount: number;
}
