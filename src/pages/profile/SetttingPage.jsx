import React, { useState } from 'react';
import Navbar from '../../components/ui/Navbar';
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
import { useAuth } from '../../context/authContext';

/* ── tiny reusable toggle ───────────────────────────────────────────── */
const Toggle = ({ value, onChange }) => (
  <button
    className={`w-[40px] h-[22px] rounded-full border-none cursor-pointer relative shrink-0 transition-colors duration-250 ease-out p-0 ${value ? 'bg-gray-900' : 'bg-gray-300'}`}
    onClick={() => onChange(!value)}
    aria-checked={value}
    role="switch"
  >
    <span
      className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] block ${value ? 'translate-x-[18px]' : ''}`}
    />
  </button>
);

/* ── section wrapper ────────────────────────────────────────────────── */
const Section = ({ icon, title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50">
      <span className="w-[28px] h-[28px] bg-gray-900 text-white rounded flex items-center justify-center text-[11px] shrink-0">
        {icon}
      </span>
      <h2 className="text-[13px] font-semibold text-gray-900 m-0">{title}</h2>
    </div>
    <div className="py-1">{children}</div>
  </div>
);

/* ── row variants ───────────────────────────────────────────────────── */
const ToggleRow = ({ label, sub, value, onChange }) => (
  <div className="flex items-center justify-between py-2 px-4 gap-2 border-b border-gray-200 w-full bg-transparent border-l-0 border-r-0 border-t-0 text-left cursor-default last:border-b-0">
    <div className="flex flex-col gap-[2px] min-w-0">
      <span className="text-[13px] font-semibold text-gray-900 truncate">{label}</span>
      {sub && <span className="text-[11px] text-gray-400 truncate">{sub}</span>}
    </div>
    <Toggle value={value} onChange={onChange} />
  </div>
);

const LinkRow = ({ label, sub, value, onClick, danger }) => (
  <button
    className={`group flex items-center justify-between py-2 px-4 gap-2 border-b border-gray-200 w-full bg-transparent border-l-0 border-r-0 border-t-0 text-left cursor-pointer last:border-b-0 transition-colors duration-150 ease-out hover:bg-gray-50 ${danger ? '' : ''}`}
    onClick={onClick}
  >
    <div className="flex flex-col gap-[2px] min-w-0">
      <span
        className={`text-[13px] font-semibold truncate ${danger ? 'text-red-600' : 'text-gray-900'}`}
      >
        {label}
      </span>
      {sub && <span className="text-[11px] text-gray-400 truncate">{sub}</span>}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {value && (
        <span className="text-[11px] text-gray-400 bg-gray-50 py-[3px] px-[8px] rounded whitespace-nowrap font-semibold">
          {value}
        </span>
      )}
      <FaChevronRight className="text-[11px] text-gray-300 group-hover:text-gray-900" />
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
      <div className="bg-gray-50 min-h-screen pt-6 px-4 md:px-8 lg:px-[60px] pb-12 md:pb-[60px] max-md:pt-4 max-md:px-3 max-md:pb-8">
        <div className="max-w-[900px] mx-auto">
          {/* ── PAGE TITLE ───────────────────────────── */}
          <div className="mb-6">
            <h1 className="text-xl md:text-[26px] font-extrabold text-gray-900 mb-1 tracking-[-0.3px]">
              Settings
            </h1>
            <p className="text-[13px] text-gray-400 m-0">Manage your account and preferences</p>
          </div>

          {/* ── PROFILE CARD ─────────────────────────── */}
          <div className="bg-gray-900 rounded-xl p-4 md:p-6 flex items-center gap-4 md:gap-6 mb-6 relative overflow-hidden max-md:flex-wrap before:content-[''] before:absolute before:-top-[40px] before:-right-[40px] before:w-[160px] before:h-[160px] before:rounded-full before:bg-white/5 after:content-[''] after:absolute after:-bottom-[60px] after:right-[80px] after:w-[120px] after:h-[120px] after:rounded-full after:bg-white/3">
            <div className="relative shrink-0">
              {user?.picture || user?.avatar_url ? (
                <img
                  src={user?.picture || user?.avatar_url}
                  alt={user?.full_name}
                  className="w-[56px] h-[56px] rounded-full object-cover border-2 border-white/25 block"
                />
              ) : (
                <div className="w-[56px] h-[56px] rounded-full bg-white/12 border-2 border-white/25 flex items-center justify-center text-[22px] font-extrabold text-white tracking-widest">
                  <span>{user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}</span>
                </div>
              )}
              <button className="absolute bottom-0 right-0 w-[20px] h-[20px] rounded-full bg-white border-none text-gray-900 text-[10px] flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out hover:scale-110">
                <FaCamera />
              </button>
            </div>
            <div className="flex-1 z-10">
              <p className="text-[18px] font-bold text-white mb-[2px]">
                {user?.full_name || user?.name || '—'}
              </p>
              <p className="text-[11px] text-white/55 mb-2">{user?.email || '—'}</p>
              <span className="bg-white/10 border border-white/20 text-white/80 text-[11px] font-semibold py-[3px] px-[10px] rounded-full tracking-[0.3px]">
                {user?.email_verified ? '✓ Verified Account' : 'Unverified'}
              </span>
            </div>
            <button className="bg-white/10 border border-white/25 text-white text-[11px] font-semibold py-2 px-4 rounded cursor-pointer transition-colors duration-200 ease-out z-10 whitespace-nowrap hover:bg-white/18 max-md:w-full max-md:text-center max-md:justify-center">
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <div className="text-[10px] font-semibold uppercase tracking-[0.7px] text-gray-500 py-[10px] px-[18px]">
                What to notify you about
              </div>
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
              <div className="flex items-center justify-between py-2 px-4 gap-2 border-b border-gray-200 w-full bg-transparent border-l-0 border-r-0 border-t-0 text-left cursor-default last:border-b-0">
                <div className="flex flex-col gap-[2px] min-w-0">
                  <span className="text-[13px] font-semibold text-gray-900 truncate">Language</span>
                  <span className="text-[11px] text-gray-400 truncate">App display language</span>
                </div>
                <select
                  className="border border-gray-200 rounded py-1 px-2 text-[11px] font-semibold text-gray-900 bg-gray-50 cursor-pointer outline-none transition-colors duration-200 focus:border-gray-900"
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
              <div className="flex items-center justify-between py-2 px-4 gap-2 border-b border-gray-200 w-full bg-transparent border-l-0 border-r-0 border-t-0 text-left cursor-default last:border-b-0">
                <div className="flex flex-col gap-[2px] min-w-0">
                  <span className="text-[13px] font-semibold text-gray-900 truncate">Currency</span>
                  <span className="text-[11px] text-gray-400 truncate">Prices displayed in</span>
                </div>
                <select
                  className="border border-gray-200 rounded py-1 px-2 text-[11px] font-semibold text-gray-900 bg-gray-50 cursor-pointer outline-none transition-colors duration-200 focus:border-gray-900"
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
          <div className="flex gap-2 justify-end max-md:flex-col">
            <button className="flex items-center gap-2 py-2 px-6 rounded-lg text-[13px] font-semibold cursor-pointer border-[1.5px] border-solid transition-all duration-200 bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300 max-md:justify-center">
              <FaSignOutAlt /> Sign Out
            </button>
            <button className="flex items-center gap-2 py-2 px-6 rounded-lg text-[13px] font-semibold cursor-pointer border-[1.5px] border-solid transition-all duration-200 bg-[#fff5f5] text-red-600 border-[#ffcdd2] hover:bg-[#ffebee] hover:border-red-600 max-md:justify-center">
              <FaTrashAlt /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
