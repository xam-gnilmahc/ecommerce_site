import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    shippingUpdates: true,
    delivered: true,
    cancelled: false,
    promos: false,
    stockAlert: true,
    priceDrop: true,
    cartReminders: false,
    reviewRequests: true,
    securityAlerts: true,
    subscriptionAlerts: false,
  });

  const toggleSetting = (key) => {
    if (key === 'securityAlerts') return;
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSwitch = (label, key, disabled = false) => (
    <div className="d-flex justify-content-between align-items-center border rounded-3 bg-light px-3 py-3 mb-3">
      <label htmlFor={`switch-${key}`} className="mb-0 fw-medium text-dark">
        {label} {disabled && <span className="text-muted small">(Always On)</span>}
      </label>
      <div className="form-check form-switch custom-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id={`switch-${key}`}
          checked={settings[key]}
          onChange={() => toggleSetting(key)}
          disabled={disabled}
          style={{
            width: '3rem',
            height: '1.7rem',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column flex-md-row">
      <Sidebar />
      <main className="flex-grow-1 p-3" style={{ marginLeft: "280px", backgroundColor: "#fff", minHeight: "100vh" }}>
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-6 mb-4">
              <div className="card  border-0 rounded-4">
                <div className="card-body">
                  <h5 className="mb-3">🛒 Order Notifications</h5>
                  {renderSwitch('Order Confirmation', 'orderUpdates')}
                  {renderSwitch('Shipping Updates', 'shippingUpdates')}
                  {renderSwitch('Delivered Updates', 'delivered')}
                  {renderSwitch('Cancellation & Refunds', 'cancelled')}
                </div>
              </div>

              <div className="card mt-4  border-0 rounded-4">
                <div className="card-body">
                  <h5 className="mb-3">🛍️ Promotional Alerts</h5>
                  {renderSwitch('New Offers & Discounts', 'promos')}
                  {renderSwitch('Wishlist Back in Stock', 'stockAlert')}
                  {renderSwitch('Price Drop Alerts', 'priceDrop')}
                  {renderSwitch('Abandoned Cart Reminders', 'cartReminders')}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 mb-4">
              <div className="card  border-0 rounded-4">
                <div className="card-body">
                  <h5 className="mb-3">⭐ Reviews & Feedback</h5>
                  {renderSwitch('Review Requests after Purchase', 'reviewRequests')}
                </div>
              </div>

              <div className="card mt-4  border-0 rounded-4">
                <div className="card-body">
                  <h5 className="mb-3">🔐 Security & Subscriptions</h5>
                  {renderSwitch('Security Alerts', 'securityAlerts', true)}
                  {renderSwitch('Subscription / Renewal Alerts', 'subscriptionAlerts')}
                </div>
              </div>

              <div className="d-grid mt-4">
                <button className="btn btn-primary btn-lg rounded-3">Save Preferences</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationSettings;
