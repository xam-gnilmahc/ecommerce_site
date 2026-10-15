import React, { useState } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../context/authContext';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileForm>({
    name: user?.full_name || (user as any)?.name || '',
    email: user?.email || '',
    phone: '+1 234 567 890',
    address: '123 Main Street, City, Country',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('Profile saved!');
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <main
        style={{
          marginLeft: '280px',
          minHeight: '100vh',
          overflowY: 'auto',
          padding: '30px',
          backgroundColor: '#fff',
          width: '100%',
        }}
      >
        <h2 className="mb-4">Profile</h2>

        <div className="card p-4" style={{ maxWidth: 700 }}>
          {/* Profile Picture + Upload */}
          <div className="d-flex align-items-center mb-4">
            <img
              src={user?.picture}
              alt={user?.full_name || user?.name || 'Profile'}
              className="rounded-circle me-4"
              style={{ width: 100, height: 100, objectFit: 'cover' }}
              title={user?.full_name || user?.name}
            />
            <div>
              <label htmlFor="profileImage" className="btn btn-dark rounded btn-sm">
                Change Photo
              </label>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                style={{ display: 'none' }}
                disabled
              />
            </div>
          </div>

          {/* Profile Form */}
          <form
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter full name"
                readOnly
                disabled
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter email"
                readOnly
                disabled
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label fw-semibold">
                Phone Number
              </label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                readOnly
                disabled
              />
            </div>

            <div className="mb-4">
              <label htmlFor="address" className="form-label fw-semibold">
                Address
              </label>
              <textarea
                className="form-control"
                id="address"
                name="address"
                rows={3}
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter address"
                readOnly
                disabled
              />
            </div>

            <button type="submit" className="btn btn-dark btn-lg w-100 rounded-3" disabled>
              Save Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
