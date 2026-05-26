import { shippingOptionParameters } from "./ShippingOptions";

/**
 * The Google Pay payment request
 *
 * The `stripe:publishableKey` value is a sample API key provided by Stripe.
 */
export const paymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,

  allowedPaymentMethods: [
    {
      type: "CARD",
      parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["MASTERCARD", "VISA"],
      },
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
          gateway: "stripe",
          "stripe:version": "2018-10-31",
          "stripe:publishableKey":`${process.env.REACT_APP_STRIPE_URL}`,
        },
      },
    },
  ],

  merchantInfo: {
    merchantId: "17613812255336763067",
    merchantName: "Demo Only (you will not be charged)",
  },

  transactionInfo: {
    totalPriceStatus: "FINAL",
    totalPriceLabel: "Total",
    totalPrice: "0",
    currencyCode: "USD",
    countryCode: "US",
  },

  shippingAddressRequired: true,
  shippingOptionParameters: shippingOptionParameters,
  shippingOptionRequired: true,
  callbackIntents: ["SHIPPING_ADDRESS", "SHIPPING_OPTION"],
};