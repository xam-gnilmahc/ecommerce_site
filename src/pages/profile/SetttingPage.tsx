import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import './settingsPage.css';

/* ── small pieces ─────────────────────────────────────────────────── */

interface RowProps {
  label: string;
  children: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ label, children }) => (
  <div className="st-row">
    <span className="st-label">{label}</span>
    <span className="st-value">{children}</span>
  </div>
);

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onChange }) => (
  <div className="st-row">
    <span className="st-label">{label}</span>
    <button
      type="button"
      className={`st-toggle ${value ? 'on' : ''}`}
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
    >
      <span className="st-knob" />
    </button>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════════════ */

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    email: true,
  });
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD');

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const name = user?.full_name || (user as any)?.name || '—';
  const email = user?.email || '—';

  return (
    <div className="st-page">
      <div className="st-container">
        <header className="st-head">
          <p className="st-eyebrow">Account</p>
          <h1 className="st-title">Settings</h1>
          <p className="st-subtitle">Your account details and preferences.</p>
        </header>

        <section className="st-section">
          <h2 className="st-section-title">Account</h2>
          <Row label="Name">{name}</Row>
          <Row label="Email">{email}</Row>
        </section>

        <section className="st-section">
          <h2 className="st-section-title">Notifications</h2>
          <ToggleRow
            label="Order updates"
            value={notifications.orderUpdates}
            onChange={() => toggle('orderUpdates')}
          />
          <ToggleRow
            label="Promotions and deals"
            value={notifications.promotions}
            onChange={() => toggle('promotions')}
          />
          <ToggleRow
            label="Email notifications"
            value={notifications.email}
            onChange={() => toggle('email')}
          />
        </section>

        <section className="st-section">
          <h2 className="st-section-title">Preferences</h2>
          <div className="st-row">
            <span className="st-label">Language</span>
            <select
              className="st-select"
              value={language}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Arabic</option>
            </select>
          </div>
          <div className="st-row">
            <span className="st-label">Currency</span>
            <select
              className="st-select"
              value={currency}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>NPR</option>
              <option>INR</option>
            </select>
          </div>
        </section>

        <div className="st-actions">
          <button type="button" className="st-signout" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
