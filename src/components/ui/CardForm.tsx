import React, { useState, useRef } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import './CardForm.css';

interface CardFormProps {
  onCardChange?: (complete: boolean) => void;
}

const ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      fontFamily:
        "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
      color: '#1a1a1a',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

const CardForm: React.FC<CardFormProps> = ({ onCardChange }) => {
  const [cardComplete, setCardComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• ••••');
  const [cardExpiry, setCardExpiry] = useState('MM/YY');
  const [cardHolder, setCardHolder] = useState('');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');
  const [cardError, setCardError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const formatDisplayNumber = (val: string): string => {
    const cleaned = val.replace(/\s/g, '');
    const padded = cleaned.padEnd(16, '•');
    return padded.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error?.message || null);
    if (event.brand) {
      const b = event.brand;
      setCardType(
        b === 'visa'
          ? 'visa'
          : b === 'mastercard'
            ? 'mastercard'
            : b === 'amex'
              ? 'amex'
              : 'unknown'
      );
    }
    setCardNumber(event.value ? formatDisplayNumber(event.value) : '•••• •••• •••• ••••');
    onCardChange?.(event.complete && expiryComplete && cvcComplete);
  };

  const handleExpiryChange = (event: any) => {
    setExpiryComplete(event.complete);
    setCardExpiry(event.value || 'MM/YY');
    onCardChange?.(cardComplete && event.complete && cvcComplete);
  };

  const handleCvcChange = (event: any) => {
    setCvcComplete(event.complete);
    onCardChange?.(cardComplete && expiryComplete && event.complete);
  };

  return (
    <div className="cf">
      {/* Card preview */}
      <div className={`cf-card ${cardType !== 'unknown' ? `cf-card--${cardType}` : ''}`}>
        <div className="cf-card-glow" />
        <div className="cf-card-row">
          <div className="cf-chip">
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <rect
                x="0.5"
                y="0.5"
                width="39"
                height="29"
                rx="5"
                fill="url(#cg)"
                stroke="rgba(255,255,255,0.15)"
              />
              <line
                x1="0"
                y1="10"
                x2="40"
                y2="10"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.6"
              />
              <line
                x1="0"
                y1="20"
                x2="40"
                y2="20"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.6"
              />
              <line
                x1="13"
                y1="0"
                x2="13"
                y2="30"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.6"
              />
              <line
                x1="27"
                y1="0"
                x2="27"
                y2="30"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.6"
              />
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="40" y2="30">
                  <stop stopColor="#f0e4c4" />
                  <stop offset="1" stopColor="#c9a86c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="cf-brand">
            {cardType === 'visa' && <span className="cf-brand-text cf-brand--visa">VISA</span>}
            {cardType === 'mastercard' && (
              <span className="cf-brand-mc">
                <span className="cf-mc-circle cf-mc-circle--red" />
                <span className="cf-mc-circle cf-mc-circle--yellow" />
              </span>
            )}
            {cardType === 'amex' && <span className="cf-brand-text cf-brand--amex">AMEX</span>}
          </div>
        </div>

        <div className="cf-card-number">{cardNumber}</div>

        <div className="cf-card-bottom">
          <div className="cf-card-col">
            <span className="cf-card-label">Card Holder</span>
            <span className="cf-card-val">{cardHolder || 'YOUR NAME'}</span>
          </div>
          <div className="cf-card-col cf-card-col--right">
            <span className="cf-card-label">Expires</span>
            <span className="cf-card-val">{cardExpiry}</span>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="cf-fields">
        <div
          className={`cf-field ${focusedField === 'number' ? 'cf-field--focus' : ''} ${cardError ? 'cf-field--error' : ''}`}
        >
          <label className="cf-label">Card Number</label>
          <div className="cf-input">
            <svg
              className="cf-input-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <CardNumberElement
              options={ELEMENT_STYLE}
              onChange={handleCardNumberChange}
              onFocus={() => setFocusedField('number')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          {cardError && <span className="cf-error">{cardError}</span>}
        </div>

        <div className={`cf-field ${focusedField === 'name' ? 'cf-field--focus' : ''}`}>
          <label className="cf-label">Cardholder Name</label>
          <div className="cf-input">
            <svg
              className="cf-input-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              className="cf-text-input"
              placeholder="YOUR NAME"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>

        <div className="cf-row">
          <div className={`cf-field ${focusedField === 'expiry' ? 'cf-field--focus' : ''}`}>
            <label className="cf-label">Expiry Date</label>
            <div className="cf-input">
              <svg
                className="cf-input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <CardExpiryElement
                options={ELEMENT_STYLE}
                onChange={handleExpiryChange}
                onFocus={() => setFocusedField('expiry')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>
          <div className={`cf-field ${focusedField === 'cvc' ? 'cf-field--focus' : ''}`}>
            <label className="cf-label">CVV</label>
            <div className="cf-input">
              <svg
                className="cf-input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <CardCvcElement
                options={ELEMENT_STYLE}
                onChange={handleCvcChange}
                onFocus={() => setFocusedField('cvc')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test hint */}
      <p className="cf-hint">
        Test: <code>4242 4242 4242 4242</code> · <code>5555 5555 5555 4444</code>
      </p>
    </div>
  );
};

export default CardForm;
