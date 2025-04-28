import { useState, useEffect } from 'react';
import { supabase } from '../supaBaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom'; // For redirection
import toast from "react-hot-toast";

// Function to generate a random secure password
const generatePassword = () => {
  const length = 12; // Password length
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // For redirecting after successful update
  const [searchParams] = useSearchParams(); // Get the search params from the URL (the recovery token)
  const recoveryToken = searchParams.get('token'); // Get recovery token from the URL

  useEffect(() => {
    // If there's no recovery token, display an error message and stop the process
    if (!recoveryToken) {
      setError('Invalid or expired recovery token.');
      navigate('/login');
    }
  }, [recoveryToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Use the recovery token to reset the password
      const { error } = await supabase.auth.api.updateUser({
        password: password,
      });
      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login'); // Redirect to login after success
      }, 3000);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
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
              type={showPassword ? "text" : "password"} // Toggle password visibility
              id="password"
              className="form-control pe-5" // Add padding-right for the eye icon
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className={`fa fa-eye${showPassword ? '-slash' : ''} position-absolute top-50 end-0 me-3 text-muted`}
              style={{
                cursor: 'pointer',
                right: '10px', // Ensure it's placed 10px from the right edge of the input
                marginTop: '8px',
                transform: 'translateY(-50%)', // Center vertically inside the input
              }}
            ></i>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Update Password
          </button>

          {/* Button to generate a new password */}
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
