import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import { Country, State } from 'country-state-city';
import { useAuth } from '../../context/authContext';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex items-start justify-center pt-16 pb-20 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-[28px] font-black italic uppercase tracking-[-0.02em] text-[#0a0a0a] mb-8">
          Add your
          <br />
          <em className="italic text-transparent" style={{ WebkitTextStroke: '2px #0a0a0a' }}>
            address
          </em>
        </h1>

        <form onSubmit={handleSave} className="flex flex-col gap-5" autoComplete="off">
          <div className="flex gap-2">
            {LABELS.map((l) => (
              <button
                type="button"
                key={l}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer border transition-all duration-200 ${
                  label === l
                    ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                    : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#999]'
                }`}
                onClick={() => setLabel(l)}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-xs font-semibold text-[#0a0a0a] tracking-[0.02em]">Address line 1</label>
            <input
              className="h-12 border-[1.5px] border-[#e8e8e8] rounded-xl px-4 text-sm text-[#0a0a0a] outline-none bg-white w-full focus:border-[#0a0a0a] focus:shadow-[3px_3px_0_#0a0a0a] transition-all duration-200"
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-xs font-semibold text-[#0a0a0a] tracking-[0.02em]">
              Address line 2 <span className="text-[#999] font-normal">(optional)</span>
            </label>
            <input
              className="h-12 border-[1.5px] border-[#e8e8e8] rounded-xl px-4 text-sm text-[#0a0a0a] outline-none bg-white w-full focus:border-[#0a0a0a] focus:shadow-[3px_3px_0_#0a0a0a] transition-all duration-200"
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <div className="flex flex-col gap-[6px]">
              <label className="text-xs font-semibold text-[#0a0a0a] tracking-[0.02em]">Country</label>
              <select
                className="h-12 border-[1.5px] border-[#e8e8e8] rounded-xl px-4 text-sm text-[#0a0a0a] outline-none bg-white w-full appearance-none focus:border-[#0a0a0a] focus:shadow-[3px_3px_0_#0a0a0a] transition-all duration-200"
                value={country}
                onChange={(e) => { setCountry(e.target.value); setState(''); }}
                required
              >
                <option value="">Select country</option>
                {Country.getAllCountries().map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-xs font-semibold text-[#0a0a0a] tracking-[0.02em]">State</label>
              <select
                className="h-12 border-[1.5px] border-[#e8e8e8] rounded-xl px-4 text-sm text-[#0a0a0a] outline-none bg-white w-full appearance-none focus:border-[#0a0a0a] focus:shadow-[3px_3px_0_#0a0a0a] transition-all duration-200"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-xs font-semibold text-[#0a0a0a] tracking-[0.02em]">Zip code</label>
            <input
              className="h-12 border-[1.5px] border-[#e8e8e8] rounded-xl px-4 text-sm text-[#0a0a0a] outline-none bg-white w-full focus:border-[#0a0a0a] focus:shadow-[3px_3px_0_#0a0a0a] transition-all duration-200"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-14 bg-[#0a0a0a] text-white border-none rounded-xl text-base font-bold tracking-[0.02em] cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {saving ? 'Saving...' : 'Save address'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAddress;
