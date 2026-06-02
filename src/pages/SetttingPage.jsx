import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import './settingsPage.css';
import {
  FaUser,
  FaBell,
  FaMapMarkerAlt,
  FaCreditCard,
  FaShieldAlt,
  FaGlobe,
  FaInfoCircle,
  FaChevronRight,
  FaToggleOn,
  FaToggleOff,
  FaCamera,
  FaSignOutAlt,
  FaTrashAlt,
  FaLock,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import { useAuth } from '../context/authContext';

/* ── tiny reusable toggle ───────────────────────────────────────────── */
const Toggle = ({ value, onChange }) => (
  <button
    className={`sett-toggle ${value ? 'on' : ''}`}
    onClick={() => onChange(!value)}
    aria-checked={value}
    role="switch"
  >
    <span className="sett-toggle-knob" />
  </button>
);

/* ── section wrapper ────────────────────────────────────────────────── */
const Section = ({ icon, title, children }) => (
  <div className="sett-section">
    <div className="sett-section-header">
      <span className="sett-section-icon">{icon}</span>
      <h2 className="sett-section-title">{title}</h2>
    </div>
    <div className="sett-section-body">{children}</div>
  </div>
);

/* ── row variants ───────────────────────────────────────────────────── */
const ToggleRow = ({ label, sub, value, onChange }) => (
  <div className="sett-row">
    <div className="sett-row-text">
      <span className="sett-row-label">{label}</span>
      {sub && <span className="sett-row-sub">{sub}</span>}
    </div>
    <Toggle value={value} onChange={onChange} />
  </div>
);

const LinkRow = ({ label, sub, value, onClick, danger }) => (
  <button
    className={`sett-row sett-row--link ${danger ? 'sett-row--danger' : ''}`}
    onClick={onClick}
  >
    <div className="sett-row-text">
      <span className="sett-row-label">{label}</span>
      {sub && <span className="sett-row-sub">{sub}</span>}
    </div>
    <div className="sett-row-right">
      {value && <span className="sett-row-value">{value}</span>}
      <FaChevronRight className="sett-row-chevron" />
    </div>
  </button>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
const SettingsPage = () => {
  const { user } = useAuth();
  /* notification toggles */
  const [notif, setNotif] = useState({
    push: true,
    email: true,
    orderUpdates: true,
    promos: false,
    sms: false,
    newArrivals: true,
    priceDrops: true,
  });

  /* preference state */
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD');

  const toggle = (key) => setNotif((p) => ({ ...p, [key]: !p[key] }));

  return (
    <>
      <Navbar />
      <div className="sett-layout">
        <div className="sett-container">
          {/* ── PAGE TITLE ───────────────────────────── */}
          <div className="sett-page-header">
            <h1 className="sett-page-title">Settings</h1>
            <p className="sett-page-sub">Manage your account and preferences</p>
          </div>

          {/* ── PROFILE CARD ─────────────────────────── */}
          <div className="sett-profile-card">
            <div className="sett-avatar-wrap">
              {user?.picture || user?.avatar_url ? (
                <img
                  src={user?.picture || user?.avatar_url}
                  alt={user?.full_name}
                  className="sett-avatar-img"
                />
              ) : (
                <div className="sett-avatar">
                  <span>{user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}</span>
                </div>
              )}
              <button className="sett-avatar-edit">
                <FaCamera />
              </button>
            </div>
            <div className="sett-profile-info">
              <p className="sett-profile-name">{user?.full_name || user?.name || '—'}</p>
              <p className="sett-profile-email">{user?.email || '—'}</p>
              <span className="sett-profile-badge">
                {user?.email_verified ? '✓ Verified Account' : 'Unverified'}
              </span>
            </div>
            <button className="sett-edit-profile-btn">Edit Profile</button>
          </div>

          <div className="sett-grid">
            {/* ── ACCOUNT ──────────────────────────────── */}
            <Section icon={<FaUser />} title="Account">
              <LinkRow
                label="Full Name"
                sub="Your display name"
                value={user?.full_name || user?.name || '—'}
                onClick={() => {}}
              />
              <LinkRow
                label="Email Address"
                sub="Login & notifications"
                value={user?.email || '—'}
                onClick={() => {}}
              />
              <LinkRow
                label="Phone Number"
                sub={user?.phone_verified ? 'Verified' : 'Not added yet'}
                value={user?.phone_verified ? 'Verified' : null}
                onClick={() => {}}
              />
              <LinkRow
                label="Google Account"
                sub={user?.iss?.includes('google') ? 'Connected via Google' : 'Not connected'}
                value={user?.iss?.includes('google') ? 'Connected' : null}
                onClick={() => {}}
              />
            </Section>

            {/* ── NOTIFICATIONS ────────────────────────── */}
            <Section icon={<FaBell />} title="Notifications">
              <ToggleRow
                label="Push Notifications"
                sub="Browser & device alerts"
                value={notif.push}
                onChange={() => toggle('push')}
              />
              <ToggleRow
                label="Email Notifications"
                sub="Receipts and updates to your inbox"
                value={notif.email}
                onChange={() => toggle('email')}
              />
              <ToggleRow
                label="SMS Alerts"
                sub="Text messages for urgent updates"
                value={notif.sms}
                onChange={() => toggle('sms')}
              />
              <div className="sett-row-group-label">What to notify you about</div>
              <ToggleRow
                label="Order Updates"
                sub="Shipping, delivery & cancellations"
                value={notif.orderUpdates}
                onChange={() => toggle('orderUpdates')}
              />
              <ToggleRow
                label="Promotions & Deals"
                sub="Flash sales and discount codes"
                value={notif.promos}
                onChange={() => toggle('promos')}
              />
              <ToggleRow
                label="New Arrivals"
                sub="Products matching your interests"
                value={notif.newArrivals}
                onChange={() => toggle('newArrivals')}
              />
              <ToggleRow
                label="Price Drops"
                sub="Items in your wishlist go on sale"
                value={notif.priceDrops}
                onChange={() => toggle('priceDrops')}
              />
            </Section>

            {/* ── ADDRESSES ────────────────────────────── */}
            <Section icon={<FaMapMarkerAlt />} title="Address Book">
              <LinkRow
                label="Home"
                sub="123 Main St, New York, NY 10001"
                value="Default"
                onClick={() => {}}
              />
              <LinkRow label="Office" sub="456 Park Ave, New York, NY 10022" onClick={() => {}} />
              <LinkRow label="Add New Address" onClick={() => {}} />
            </Section>

            {/* ── PAYMENT ──────────────────────────────── */}
            <Section icon={<FaCreditCard />} title="Payment Methods">
              <LinkRow
                label="Visa •••• 4242"
                sub="Expires 08/26"
                value="Default"
                onClick={() => {}}
              />
              <LinkRow label="Mastercard •••• 8810" sub="Expires 12/25" onClick={() => {}} />
              <LinkRow label="Google Pay" sub="Connected" onClick={() => {}} />
              <LinkRow label="Add Payment Method" onClick={() => {}} />
            </Section>

            {/* ── SECURITY ─────────────────────────────── */}
            <Section icon={<FaShieldAlt />} title="Privacy & Security">
              <LinkRow label="Change Password" sub="Last changed 3 months ago" onClick={() => {}} />
              <LinkRow
                label="Two-Factor Authentication"
                sub="Extra layer of protection"
                onClick={() => {}}
              />
              <LinkRow label="Login Sessions" sub="2 active sessions" onClick={() => {}} />
              <LinkRow label="Download My Data" sub="Export your account data" onClick={() => {}} />
            </Section>

            {/* ── PREFERENCES ──────────────────────────── */}
            <Section icon={<FaGlobe />} title="Preferences">
              <div className="sett-row">
                <div className="sett-row-text">
                  <span className="sett-row-label">Language</span>
                  <span className="sett-row-sub">App display language</span>
                </div>
                <select
                  className="sett-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Arabic</option>
                </select>
              </div>
              <div className="sett-row">
                <div className="sett-row-text">
                  <span className="sett-row-label">Currency</span>
                  <span className="sett-row-sub">Prices displayed in</span>
                </div>
                <select
                  className="sett-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>NPR</option>
                  <option>INR</option>
                </select>
              </div>
            </Section>

            {/* ── ABOUT ────────────────────────────────── */}
            <Section icon={<FaInfoCircle />} title="About">
              <LinkRow
                label="App Version"
                sub="You're up to date"
                value="v2.4.1"
                onClick={() => {}}
              />
              <LinkRow label="Terms of Service" sub="Read our terms" onClick={() => {}} />
              <LinkRow label="Privacy Policy" sub="How we use your data" onClick={() => {}} />
              <LinkRow label="Contact Support" sub="We're here to help" onClick={() => {}} />
              <LinkRow label="Rate the App" sub="Leave a review" onClick={() => {}} />
            </Section>
          </div>

          {/* ── DANGER ZONE ──────────────────────────── */}
          <div className="sett-danger-zone">
            <button className="sett-danger-btn sett-logout-btn">
              <FaSignOutAlt /> Sign Out
            </button>
            <button className="sett-danger-btn sett-delete-btn">
              <FaTrashAlt /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
