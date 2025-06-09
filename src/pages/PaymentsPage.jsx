import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaApplePay, FaGooglePay, FaCreditCard } from 'react-icons/fa';
import Sidebar from "../components/Sidebar";

const PaymentSetupPage = () => {
  const [paymentOptions, setPaymentOptions] = useState({
    googlePay: false,
    applePay: false,
    card: false,
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const handleToggle = (method) => {
    setPaymentOptions((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSave = async () => {
    const dataToSave = {
      ...paymentOptions,
      ...(paymentOptions.card ? { cardDetails } : {}),
    };
    console.log('Saving:', dataToSave);
    alert('Payment method saved!');
  };

  return (
    <div className="d-flex flex-column flex-md-row">
      <Sidebar />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "280px", backgroundColor: "#fff", minHeight: "100vh" }}>
        <div className="container">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 0.4 }}>
              <h3 className="text-center mb-4">Setup Your Payment Methods</h3>
              {[ 
                { id: 'googlePay', label: 'Google Pay', icon: <FaGooglePay size={28} /> },
                { id: 'applePay', label: 'Apple Pay', icon: <FaApplePay size={28} /> },
                { id: 'card', label: 'Credit / Debit Card', icon: <FaCreditCard size={26} /> }
              ].map((option) => (
                <div
                  key={option.id}
                  className="form-check form-switch d-flex align-items-center justify-content-between mb-4"
                  style={{ fontSize: '1.2rem' }}
                >
                  <label className="form-check-label d-flex align-items-center gap-3">
                    {option.icon} {option.label}
                  </label>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    style={{ width: '3rem', height: '1.7rem' }}
                    checked={paymentOptions[option.id]}
                    onChange={() => handleToggle(option.id)}
                  />
                </div>
              ))}

              {paymentOptions.card && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-3">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-control border-0 shadow-none"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardInputChange}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="row">
                    <div className="col">
                      <label className="form-label">Expiry</label>
                      <input
                        type="text"
                        className="form-control border-0 shadow-none"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardInputChange}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">CVV</label>
                      <input
                        type="text"
                        className="form-control border-0 shadow-none"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.button
                className="btn btn-primary w-100 mt-4 border-0 shadow-none"
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
              >
                Save Payment Setup
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSetupPage;
