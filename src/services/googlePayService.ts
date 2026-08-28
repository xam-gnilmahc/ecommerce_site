import { CardElement } from '@stripe/react-stripe-js';
import type { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { SMART_HANDLER_URL, SMART_HANDLER_TOKEN } from '../config/env';

/** Google Pay payment data returned by the Google Pay button callback */
export interface GooglePayPaymentData {
  paymentMethodData: {
    tokenizationData: {
      token: string;
    };
  };
  shippingAddress?: {
    address1?: string;
    address2?: string;
    countryCode?: string;
    administrativeArea?: string;
    locality?: string;
    postalCode?: string;
  };
  shippingOptionData?: {
    id: string;
  };
}

/** Options passed to processGooglePay (amount, user info, comment) */
export interface GooglePayOptions {
  amount?: number;
  name?: string;
  email?: string;
  comment?: string;
}

/** Options passed to processCardPayment (amount, user info, address, comment) */
export interface CardPaymentOptions {
  amount?: number;
  name?: string;
  email?: string;
  address?: string;
  comment?: string;
}

/** Normalized shipping address from Google Pay */
export interface PaymentAddress {
  addressLine1: string | undefined;
  addressLine2: string | null;
  country: string | undefined;
  state: string | undefined;
  city: string | undefined;
  zipCode: string | undefined;
}

/** Final payment payload sent to the smart-handler Edge Function */
export interface FinalPaymentData {
  token: string;
  amount?: number;
  name?: string;
  email?: string;
  address?: PaymentAddress | string;
  comment?: string;
}

/** Response from the smart-handler Edge Function */
export interface PaymentResult {
  message: string;
  error?: string;
  [key: string]: unknown;
}

/** Return type for both processGooglePay and processCardPayment */
export interface PaymentResponse {
  finalData: FinalPaymentData;
  result: PaymentResult;
}

const BEARER = `Bearer ${SMART_HANDLER_TOKEN}`;

/**
 * Processes a Google Pay payment. Parses the token from Google Pay,
 * builds the final payload with shipping address, and sends it to
 * the smart-handler Edge Function for Stripe processing.
 */
export async function processGooglePay(
  paymentData: GooglePayPaymentData,
  { amount, name, email, comment = 'Payment for order' }: GooglePayOptions = {}
): Promise<PaymentResponse> {
  let parsedToken: { id: string };
  try {
    parsedToken = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);
  } catch {
    throw new Error('Failed to parse payment token');
  }

  const address: PaymentAddress = {
    addressLine1: paymentData.shippingAddress?.address1,
    addressLine2: paymentData.shippingAddress?.address2 || null,
    country: paymentData.shippingAddress?.countryCode,
    state: paymentData.shippingAddress?.administrativeArea,
    city: paymentData.shippingAddress?.locality,
    zipCode: paymentData.shippingAddress?.postalCode,
  };

  const finalData: FinalPaymentData = {
    token: parsedToken.id,
    amount,
    name,
    email,
    address,
    comment,
  };

  const response = await fetch(SMART_HANDLER_URL, {
    method: 'POST',
    headers: {
      Authorization: BEARER,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(finalData),
  });

  const result: PaymentResult = await response.json();

  return { finalData, result };
}

/**
 * Processes a credit/debit card payment via Stripe. Creates a token
 * from the card element, builds the final payload, and sends it to
 * the smart-handler Edge Function for processing.
 */
export async function processCardPayment(
  stripe: Stripe,
  elements: StripeElements,
  { amount, name, email, address, comment = 'Payment for order' }: CardPaymentOptions = {}
): Promise<PaymentResponse> {
  if (!stripe || !elements) {
    throw new Error('Stripe not loaded');
  }

  const cardElement = elements.getElement(CardElement) as StripeCardElement | null;

  if (!cardElement) {
    throw new Error('Card element not found');
  }

  const { token, error } = await stripe.createToken(cardElement);

  if (error) throw new Error(error.message);

  const finalData: FinalPaymentData = { token: token.id, amount, name, email, address, comment };

  const response = await fetch(SMART_HANDLER_URL, {
    method: 'POST',
    headers: {
      Authorization: BEARER,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(finalData),
  });

  const result: PaymentResult = await response.json();

  return { finalData, result };
}

export default { processGooglePay, processCardPayment };
