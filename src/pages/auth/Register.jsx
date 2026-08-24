import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { email, password, name } = formData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return;
    }

    navigate('/login');
    toast.success('User registered');
  };

  return (
    <>
      <div className="loginSignUpSection">
        <div className="loginSignUpContainer">
          <div className="loginSignUpTabs">
            <p>Register</p>
          </div>
          <div className="loginSignUpTabsContentRegister">
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="form-row">
                <label htmlFor="Name">Full name</label>
                <input
                  type="text"
                  id="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Johnson"
                  required
                />
                <p className="form-hint">This name will appear on your orders and profile.</p>
              </div>

              <div className="form-row">
                <label htmlFor="Email">Email address</label>
                <input
                  type="email"
                  id="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
                <p className="form-hint">Order updates and receipts will be sent to this email.</p>
              </div>

              <div className="form-row">
                <label htmlFor="Password">Password</label>
                <input
                  type="password"
                  id="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
                <p className="form-hint">
                  Use at least 6 characters. A mix of letters and numbers is stronger.
                </p>
              </div>

              <div className="register-privacy-note">
                <i className="fa fa-lock"></i>
                <p>
                  Your personal data will be used to support your experience throughout this
                  website, to manage access to your account, and for other purposes described in our{' '}
                  <Link to="/terms">privacy policy</Link>.
                </p>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>

              <div className="loginSignUpTabsContentLoginText">
                <p>
                  Already have an account?{' '}
                  <Link to="/login">
                    <span>Login</span>
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
