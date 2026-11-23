import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Stripe,
  StripeElements,
  StripeExpressCheckoutElement,
  StripeExpressCheckoutElementConfirmEvent,
} from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import {
  buildElementsOptions,
  buildExpressElementOptions,
  resolveShippingRate,
} from './expressCheckoutConfig';
import {
  ExpressCheckoutError,
  confirmExpressPayment,
  stripePromise,
} from './expressCheckoutService';
import type {
  ExpressAddress,
  ExpressAuthorization,
  ExpressBuyer,
  ExpressLineItem,
  ExpressShippingRate,
} from './types';
import './expressCheckout.css';

export interface ExpressCheckoutProps {
  /** Cart subtotal in cents (before shipping). */
  subtotalCents: number;
  /** Product lines shown inside the wallet sheet, in cents. */
  lineItems: ExpressLineItem[];
  /** Known buyer details, used to prefill the wallet sheet. */
  buyer: ExpressBuyer;
  /** Optional override of the shipping rates offered inside the wallet sheet. */
  shippingRates?: ExpressShippingRate[];
  /** Cart address, used when a wallet does not return one. */
  fallbackAddress?: ExpressAddress;
  /** Called with the successful payment after Stripe authorised it. Throw to mark payment as failed. */
  onAuthorized: (authorization: ExpressAuthorization) => Promise<void>;
  /** Lets the page show its own processing overlay while the order is created. */
  onProcessingChange?: (busy: boolean) => void;
}

/**
 * Stripe Express Checkout Element wrapped in the store's own styling.
 * Every wallet button on this section is drawn by Stripe itself; the element is
 * mounted without extra device checks (see `paymentMethods` in the config).
 */
const ExpressCheckout: React.FC<ExpressCheckoutProps> = ({
  subtotalCents,
  lineItems,
  buyer,
  shippingRates,
  fallbackAddress,
  onAuthorized,
  onProcessingChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const elementRef = useRef<StripeExpressCheckoutElement | null>(null);

  const subtotalRef = useRef(subtotalCents);
  const lineItemsRef = useRef(lineItems);
  const ratesRef = useRef(shippingRates);
  const buyerRef = useRef(buyer);
  const fallbackAddressRef = useRef(fallbackAddress);
  const onAuthorizedRef = useRef(onAuthorized);
  const onProcessingChangeRef = useRef(onProcessingChange);
  const busyRef = useRef(false);
  /** Shipping cost currently selected in the wallet sheet (cents). */
  const selectedRateAmountRef = useRef(resolveShippingRate(null).amount);

  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);

  subtotalRef.current = subtotalCents;
  lineItemsRef.current = lineItems;
  ratesRef.current = shippingRates;
  buyerRef.current = buyer;
  fallbackAddressRef.current = fallbackAddress;
  onAuthorizedRef.current = onAuthorized;
  onProcessingChangeRef.current = onProcessingChange;

  const handleConfirm = useCallback(
    async (
      stripe: Stripe,
      elements: StripeElements,
      event: StripeExpressCheckoutElementConfirmEvent
    ) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);

      try {
        const authorization = await confirmExpressPayment(stripe, elements, {
          wallet: event.expressPaymentType,
          subtotalCents: subtotalRef.current,
          buyer: buyerRef.current,
          billingDetails: event.billingDetails,
          shippingAddress: event.shippingAddress,
          shippingRateId: event.shippingRate?.id,
          fallbackAddress: fallbackAddressRef.current,
        });

        // The wallet sheet has closed by now, so only from here is a page-wide
        // processing state useful. Showing it earlier flashed behind the sheet.
        onProcessingChangeRef.current?.(true);

        await onAuthorizedRef.current(authorization);
      } catch (error) {
        const message =
          error instanceof ExpressCheckoutError
            ? error.message
            : 'Payment could not be completed. Please try again.';

        event.paymentFailed({ reason: 'fail', message });
        toast.error(message);
      } finally {
        busyRef.current = false;
        setBusy(false);
        onProcessingChangeRef.current?.(false);
      }
    },
    []
  );

  /* Mount the Express Checkout Element once; later amount changes go through elements.update(). */
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    const mount = async () => {
      const stripe = await stripePromise;
      if (cancelled || !stripe || !container) return;

      // Stripe expects the Elements amount to be the cart total, shipping included.
      const elements = stripe.elements(
        buildElementsOptions(subtotalRef.current + selectedRateAmountRef.current)
      );
      elementsRef.current = elements;

      const element = elements.create(
        'expressCheckout',
        buildExpressElementOptions({
          lineItems: lineItemsRef.current,
          shippingRates: ratesRef.current,
        })
      );
      elementRef.current = element;

      element.on('ready', () => {
        if (cancelled) return;
        setMounted(true);
      });

      element.on('confirm', (event) => {
        void handleConfirm(stripe, elements, event);
      });

      /* Keep the amount Stripe charges in sync with the shipping rate the customer picks. */
      element.on('shippingratechange', (event) => {
        const rate = event.shippingRate;
        selectedRateAmountRef.current = rate?.amount ?? 0;

        elements.update({
          amount: Math.max(0, Math.round(subtotalRef.current + selectedRateAmountRef.current)),
        });

        event.resolve({
          lineItems: [
            ...lineItemsRef.current.map((item) => ({
              name: item.name,
              amount: Math.max(0, Math.round(item.amount)),
            })),
            ...(rate ? [{ name: rate.displayName, amount: rate.amount }] : []),
          ],
        });
      });

      element.on('cancel', () => {
        selectedRateAmountRef.current = resolveShippingRate(null).amount;
        elements.update({
          amount: Math.max(0, Math.round(subtotalRef.current + selectedRateAmountRef.current)),
        });
        setBusy(false);
        busyRef.current = false;
        onProcessingChangeRef.current?.(false);
      });

      // Keep the button skeleton up until Stripe reports the element is ready.
      element.mount(container);
    };

    void mount();

    return () => {
      cancelled = true;
      elementRef.current?.destroy();
      elementRef.current = null;
      elementsRef.current = null;
    };
  }, [handleConfirm]);

  /* Keep the wallet sheet total in sync with the cart. */
  useEffect(() => {
    const elements = elementsRef.current;
    if (!elements) return;
    elements.update({
      amount: Math.max(0, Math.round(subtotalCents + selectedRateAmountRef.current)),
    });
  }, [subtotalCents]);

  return (
    <section className="ec" aria-labelledby="ec-title">
      <div className="ec-head">
        <h2 className="ec-title" id="ec-title">
          Express checkout
        </h2>
        <p className="ec-hint">Pay in one tap with a saved wallet — no form filling.</p>
      </div>

      {!mounted && (
        <div className="ec-buttons-skeleton" aria-hidden="true">
          <span className="ec-button-skeleton" />
          <span className="ec-button-skeleton" />
          <span className="ec-button-skeleton" />
          <span className="ec-button-skeleton" />
        </div>
      )}

      <div
        ref={containerRef}
        className={`ec-element${mounted ? ' is-ready' : ''}${busy ? ' is-busy' : ''}`}
      />

      <p className="ec-note">
        Your wallet opens in a secure Stripe sheet where shipping is confirmed before any charge.
      </p>
    </section>
  );
};

export default ExpressCheckout;
