import { shippingOptionParameters } from './ShippingOptions.ts';
import { STRIPE_URL, GOOGLE_PAY_MERCHANT_ID } from './env';

/** Allowed payment method configuration for Google Pay (card via Stripe gateway) */
interface PaymentRequestAllowedMethod {
  type: string;
  parameters: {
    allowedAuthMethods: string[];
    allowedCardNetworks: string[];
  };
  tokenizationSpecification: {
    type: string;
    parameters: {
      gateway: string;
      'stripe:version': string;
      'stripe:publishableKey': string;
    };
  };
}

/** Google merchant information displayed in the Google Pay payment sheet */
interface MerchantInfo {
  merchantId: string;
  merchantName: string;
}

/** Transaction details shown to the user in the Google Pay payment sheet */
interface TransactionInfo {
  totalPriceStatus: string;
  totalPriceLabel: string;
  totalPrice: string;
  currencyCode: string;
  countryCode: string;
  displayItems?: { label: string; price: string; type: string }[];
}

/** Full Google Pay payment request configuration object */
export interface GooglePayPaymentRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: PaymentRequestAllowedMethod[];
  merchantInfo: MerchantInfo;
  transactionInfo: TransactionInfo;
  shippingAddressRequired: boolean;
  shippingOptionParameters: typeof shippingOptionParameters;
  shippingOptionRequired: boolean;
  callbackIntents: string[];
}

/** Default Google Pay payment request with Stripe gateway, merchant info, and shipping config */
export const paymentRequest: GooglePayPaymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,

  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA'],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'stripe',
          'stripe:version': '2018-10-31',
          'stripe:publishableKey': `${STRIPE_URL}`,
        },
      },
    },
  ],

  merchantInfo: {
    merchantId: `${GOOGLE_PAY_MERCHANT_ID}`,
    merchantName: 'Demo Only (you will not be charged)',
  },

  transactionInfo: {
    totalPriceStatus: 'FINAL',
    totalPriceLabel: 'Total',
    totalPrice: '0',
    currencyCode: 'USD',
    countryCode: 'US',
  },

  shippingAddressRequired: true,
  shippingOptionParameters,
  shippingOptionRequired: true,
  callbackIntents: ['SHIPPING_ADDRESS', 'SHIPPING_OPTION'],
};
