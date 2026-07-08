import { useState } from 'react';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        toast.error('Error sending password reset email');
        setError('Error sending password reset email: ' + error.message);
      } else {
        toast.success('Password reset email sent. Please check your inbox');
        setSuccessMessage('Password reset email sent. Please check your inbox.');
        // Redirect after success
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-10 py-20 px-4">
        <h2 className="text-2xl font-semibold text-gray-900">Reset Your Password</h2>

        <div className="flex flex-col gap-2.5 w-[500px] max-md:w-[90%]">
          <p className="text-base font-normal text-gray-500">
            We will send you an email to reset your password
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
            <input
              type="email"
              className="p-5 border-2 border-gray-200 rounded-lg outline-gray-900 text-base text-gray-900"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="p-5 bg-gray-900 text-white border-none rounded-lg cursor-pointer uppercase font-semibold"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
        <p className="text-base font-normal text-gray-500">
          Back to{' '}
          <Link to="/login">
            <span className="text-gray-900">Login</span>
          </Link>
        </p>
      </div>
    </>
  );
};

export default ForgotPassword;
