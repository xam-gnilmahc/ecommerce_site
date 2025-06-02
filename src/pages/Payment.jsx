import React, { useEffect, useState, useRef } from 'react';

const Payment = () => {
  const [uiData, setUiData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cardContainerRef = useRef(null);
  const googlePayContainerRef = useRef(null);

  useEffect(() => {
    const fetchPaymentUI = async () => {
      try {
        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwODAvYXBpL3JlZ2lzdGVyIiwiaWF0IjoxNzQ4NTc2NTE1LCJleHAiOjE3NDg1ODAxMTUsIm5iZiI6MTc0ODU3NjUxNSwianRpIjoiaDFlQWRiT3hJNUwxWWYyVSIsInN1YiI6IjExNiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJzdG9yZV9pZCI6NDQ2NjY4NCwiZW1haWwiOiJzdGVfcmFyZV82ODA1ZTY4ZmI5YmEyQHZveG1nLmNvbSJ9.J4ANpsCHHQZwStXNCJIpOSyiF9tGLhjOM7l8k8pJ9y4';
        const response = await fetch('https://839f-202-166-220-83.ngrok-free.app/api/stripe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: 100 }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUiData(data.uiDatas); // make sure this is the correct key
        console.log('Fetched UI Data:', data.uiDatas);
      } catch (err) {
        console.error(err);
        setError('Failed to load payment UI.');
      }
    };

    fetchPaymentUI();
  }, []);

  useEffect(() => {
    if (!uiData) return;

    // Stripe Card
    if (uiData.card) {
      const stripeScript = document.createElement('script');
      stripeScript.src = uiData.card.scriptUrl;
      stripeScript.async = true;
      stripeScript.onload = () => {
        new Function(uiData.card.script)();
      };
      document.body.appendChild(stripeScript);

      if (cardContainerRef.current) {
        cardContainerRef.current.innerHTML = uiData.card.html;
      }
    }

    // Google Pay
    if (uiData.google_pay) {
        const gPayScript = document.createElement('script');
        gPayScript.src = uiData.google_pay.scriptUrl;
        gPayScript.async = true;
      
        gPayScript.onload = () => {
          try {
            // Evaluate the backend-provided script
            const executeScript = new Function(uiData.google_pay.script);
            executeScript(); // Now this defines `initializeGooglePay` on window
      
            // Call the Google Pay initializer only after it's available
            if (typeof window.initializeGooglePay === 'function') {
              window.initializeGooglePay();
            } else {
              console.error('Google Pay init function not found on window.');
            }
          } catch (err) {
            console.error('Error running Google Pay script:', err);
          }
        };
      
        document.body.appendChild(gPayScript);
      
        // Insert the Google Pay HTML container
        if (googlePayContainerRef.current) {
          googlePayContainerRef.current.innerHTML = uiData.google_pay.html;
        }
      }
    
      
  }, [uiData]);

  const handleCardPayment = async () => {
    if (typeof window.fnCreatePaymentToken !== 'function') {
      alert('Card payment form not ready.');
      return;
    }

    try {
      setLoading(true);
      const result = await window.fnCreatePaymentToken();
      console.log('Stripe Token:', result.token);

      // Send token to backend for processing
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePayment = async () => {
    if (typeof window.onGooglePaymentButtonClicked !== 'function') {
      alert('Card payment form not ready.');
      return;
    }

    try {
      setLoading(true);
      await window.onGooglePaymentButtonClicked();
    //   console.log('Stripe Token:', result.token);

      // Send token to backend for processing
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mt-4">
      <h5 className="mb-3">Payment Options</h5>
      {error && <div className="alert alert-danger">{error}</div>}

      {uiData ? (
        <>
          {uiData.card && (
            <div className="mb-4">
              <h6>Pay with Card</h6>
              <div ref={cardContainerRef}></div>
              <button
                className="btn btn-primary mt-3"
                onClick={handleCardPayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay with Card'}
              </button>
            </div>
          )}

          {uiData.google_pay && (
            <div className="mb-4">
              <h6>Pay with Google Pay</h6>
              <div ref={googlePayContainerRef} onClick={handleGooglePayment}></div>
            </div>
          )}
        </>
      ) : (
        <p>Loading payment options...</p>
      )}
    </div>
  );
};

export default Payment;
