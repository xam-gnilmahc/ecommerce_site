import React, { useState, useEffect } from 'react';
import { supabase } from '../../supaBaseClient';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import toast from 'react-hot-toast';

const generatePassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const UpdatePassword: React.FC = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const recoveryToken = searchParams.get('token');

  useEffect(() => {
    if (!recoveryToken) {
      setError('Invalid or expired recovery token.');
      navigate('/login');
    }
  }, [recoveryToken]);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card w-50 p-4 border-0">
        <h3 className="text-center mb-4">Update Password</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Password updated successfully!</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-control pe-5"
              placeholder="Enter new password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <i
              onClick={() => setShowPassword(!showPassword)}
              className={`fa fa-eye${showPassword ? '-slash' : ''} position-absolute top-50 end-0 me-3 text-muted`}
              style={{
                cursor: 'pointer',
                right: '10px',
                marginTop: '8px',
                transform: 'translateY(-50%)',
              }}
            ></i>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Update Password
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => setPassword(generatePassword())}
          >
            Generate Secure Password
          </button>
        </form>

        <p className="mt-3 text-center">
          Remembered your password?{' '}
          <a href="/login" className="text-primary">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default UpdatePassword;
