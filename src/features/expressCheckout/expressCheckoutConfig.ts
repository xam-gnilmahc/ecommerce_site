import type {
  LineItem,
  ShippingRate,
  StripeElementsOptionsMode,
  StripeExpressCheckoutElementOptions,
} from '@stripe/stripe-js';
import type { ExpressShippingRate } from './types';

/** Currency used by the store checkout. */
export const EXPRESS_CURRENCY = 'usd';

/** Shipping rates offered inside the wallet sheet (cents). */
export const EXPRESS_SHIPPING_RATES: ExpressShippingRate[] = [
  {
    id: 'free',
    displayName: 'Free shipping',
    amount: 0,
    deliveryEstimate: {
      minimum: { unit: 'business_day', value: 7 },
      maximum: { unit: 'business_day', value: 20 },
    },
  },
  {
    id: 'express',
    displayName: 'Express shipping',
    amount: 300,
    deliveryEstimate: {
      minimum: { unit: 'business_day', value: 1 },
      maximum: { unit: 'business_day', value: 3 },
    },
  },
];

export const resolveShippingRate = (rateId?: string | null): ExpressShippingRate =>
  EXPRESS_SHIPPING_RATES.find((rate) => rate.id === rateId) || EXPRESS_SHIPPING_RATES[0];

/**
 * Elements options for the express section. `mode`/`amount`/`currency` are what
 * let Stripe decide which wallets the account can offer; the element options
 * below decide whether they are actually drawn.
 */
export const buildElementsOptions = (subtotalCents: number): StripeElementsOptionsMode => ({
  mode: 'payment',
  amount: Math.max(0, Math.round(subtotalCents)),
  currency: EXPRESS_CURRENCY,
  paymentMethodCreation: 'manual',
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#111111',
      colorText: '#111111',
      colorDanger: '#b91c1c',
      borderRadius: '8px',
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
  },
});

/**
 * Express Checkout Element options.
 *
 * `paymentMethods.applePay` / `googlePay` are set to `always` on purpose, so the
 * buttons render even when the browser reports no stored wallet (and on
 * non-Safari desktop for Apple Pay). Nothing here inspects the device — Stripe
 * only limits a wallet when the account or currency cannot support it at all.
 */
export const buildExpressElementOptions = (params: {
  lineItems: ExpressLineItemInput[];
  shippingRates?: ExpressShippingRate[];
}): StripeExpressCheckoutElementOptions => {
  const rates = (params.shippingRates || EXPRESS_SHIPPING_RATES).map(
    (rate): ShippingRate => ({
      id: rate.id,
      displayName: rate.displayName,
      amount: rate.amount,
      deliveryEstimate: rate.deliveryEstimate,
    })
  );

  return {
    buttonHeight: 48,
    buttonTheme: {
      applePay: 'black',
      googlePay: 'black',
      paypal: 'black',
    },
    buttonType: {
      applePay: 'check-out',
      googlePay: 'checkout',
      paypal: 'checkout',
    },
    layout: { maxColumns: 2, maxRows: 2, overflow: 'auto' },
    paymentMethods: {
      applePay: 'always',
      googlePay: 'always',
      link: 'auto',
    },
    paymentMethodOrder: ['apple_pay', 'google_pay', 'link'],
    emailRequired: true,
    billingAddressRequired: true,
    shippingAddressRequired: true,
    shippingRates: rates,
    lineItems: params.lineItems.map(
      (item): LineItem => ({ name: item.name, amount: Math.max(0, Math.round(item.amount)) })
    ),
  };
};

/** Minimal line item input used above (cents). */
export interface ExpressLineItemInput {
  name: string;
  amount: number;
}
