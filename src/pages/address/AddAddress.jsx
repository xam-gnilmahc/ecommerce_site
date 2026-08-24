import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import { Country, State } from 'country-state-city';
import { useAuth } from '../../context/authContext';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import './AddAddress.css';

const LABELS = ['Home', 'Work', 'Other'];

const AddAddress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [label, setLabel] = useState('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [saving, setSaving] = useState(false);

  const states = country ? State.getStatesOfCountry(country) : [];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from('shipping_addresses').insert({
      user_id: user.id,
      label,
      address_line1: addressLine1,
      address_line2: addressLine2,
      country,
      state,
      zip_code: zipCode,
      is_default: true,
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Address saved!');
    navigate(-1);
  };

  return (
    <div className="addr-layout">
      <div className="addr-container">
        <button className="addr-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="addr-header">
          <div className="addr-header-icon">
            <FaMapMarkerAlt />
          </div>
          <div>
            <h1 className="addr-title">Add shipping address</h1>
            <p className="addr-subtitle">Where should we deliver your orders?</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="addr-card" autoComplete="off">
          <div className="addr-section-label">Address type</div>
          <div className="addr-labels">
            {LABELS.map((l) => (
              <button
                type="button"
                key={l}
                className={`addr-label-btn ${label === l ? 'active' : ''}`}
                onClick={() => setLabel(l)}
              >
                {l === 'Home' ? '🏠' : l === 'Work' ? '💼' : '📍'} {l}
              </button>
            ))}
          </div>

          <div className="addr-divider" />

          <div className="addr-section-label">Address details</div>

          <div className="addr-field">
            <label className="addr-field-label">Address line 1</label>
            <input
              className="addr-input"
              type="text"
              placeholder="Street address, building number"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
            />
          </div>

          <div className="addr-field">
            <label className="addr-field-label">
              Address line 2 <span className="addr-optional">(optional)</span>
            </label>
            <input
              className="addr-input"
              type="text"
              placeholder="Apartment, suite, floor"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </div>

          <div className="addr-row">
            <div className="addr-field">
              <label className="addr-field-label">Country</label>
              <select
                className="addr-select"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setState('');
                }}
                required
              >
                <option value="">Select country</option>
                {Country.getAllCountries().map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="addr-field">
              <label className="addr-field-label">State</label>
              <select
                className="addr-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="addr-field">
            <label className="addr-field-label">Zip code</label>
            <input
              className="addr-input"
              type="text"
              placeholder="Postal code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="addr-submit"
          >
            {saving ? 'Saving...' : 'Save address'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAddress;
