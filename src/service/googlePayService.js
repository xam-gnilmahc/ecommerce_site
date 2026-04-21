import { CardElement } from '@stripe/react-stripe-js';

/**
 * Shared Google Pay service
 * - Parses Google Pay paymentData token
 * - Builds a final payload and sends it to your smart-handler endpoint
 * - Returns { finalData, result }
 */
const SMART_HANDLER_URL =
  "https://fzliiwigydluhgbuvnmr.supabase.co/functions/v1/smart-handler";

const BEARER =
  `Bearer ${process.env.REACT_APP_SMART_HANDLER_URL}`;

/**
 * Shared Google Pay service
 * - Parses Google Pay paymentData token
 * - Builds a final payload and sends it to your smart-handler endpoint
 * - Returns { finalData, result }
 * @param {*} paymentData
 * @param {*} param1
 * @returns
 */
export async function processGooglePay(paymentData, { amount, name, email, comment = "Payment for order" } = {}) {
  // Parse token returned from Google Pay (Stripe gateway)
  let parsedToken = null;
  try {
    parsedToken = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);
  } catch (err) {
    throw new Error("Failed to parse payment token");
  }

  const address = {
    addressLine1: paymentData.shippingAddress?.address1,
    addressLine2: paymentData.shippingAddress?.address2 || null,
    country: paymentData.shippingAddress?.countryCode,
    state: paymentData.shippingAddress?.administrativeArea,
    city: paymentData.shippingAddress?.locality,
    zipCode: paymentData.shippingAddress?.postalCode,
  };

  const finalData = {
    token: parsedToken.id,
    amount,
    name,
    email,
    address,
    comment,
  };

  const response = await fetch(SMART_HANDLER_URL, {
    method: "POST",
    headers: {
      Authorization: BEARER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
  });

  const result = await response.json();

  return { finalData, result };
}

/**
 * Shared Google Pay service
 * - Parses Google Pay paymentData token
 * - Builds a final payload and sends it to your smart-handler endpoint
 * - Returns { finalData, result }
 * @param {*} stripe
 * @param {*} elements
 * @param {*} param2
 * @returns
 */
/* ---------------- CARD PAYMENT ---------------- */
export async function processCardPayment(
  stripe,
  elements,
  {
    amount,
    name,
    email,
    address,
    comment = "Payment for order",
  } = {}
) {
  if (!stripe || !elements) {
    throw new Error("Stripe not loaded");
  }

  const cardElement = elements.getElement(CardElement);

  if (!cardElement) {
    throw new Error("Card element not found");
  }

  const { token, error } = await stripe.createToken(cardElement);

  if (error) {
    throw new Error(error.message);
  }

  const finalData = {
    token: token.id,
    amount,
    name,
    email,
    address,
    comment,
  };

  const response = await fetch(SMART_HANDLER_URL, {
    method: "POST",
    headers: {
      Authorization: BEARER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalData),
  });

  const result = await response.json();

  return { finalData, result };
}

export default { processGooglePay, processCardPayment };
