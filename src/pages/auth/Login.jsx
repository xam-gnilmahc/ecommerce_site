import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import FacebookLogin from 'react-facebook-login';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Login successful!');
    navigate('/');
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      toast.error(error.message);
      return;
    }
  };

  const responseFacebook = (response) => {
    if (response && response.name && response.email) {
      toast.success(
        `Welcome ${response.name}!\nEmail: ${response.email}\n\nNote: Facebook login is under development and not fully functional for end users.`
      );
    } else {
      toast.error('Facebook login failed or is incomplete.');
    }
  };

  return (
    <>
      <div className="flex justify-center items-center px-4 pt-[48px] pb-[64px] max-md:pb-[32px]">
        <div className="flex flex-col justify-center items-center gap-[8px]">
          <div className="flex flex-wrap items-center justify-center">
            <p className="border-none cursor-pointer no-underline uppercase text-[20px] font-semibold relative text-gray-900">
              Login
            </p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <form onSubmit={handleSubmit} className="flex flex-col gap-[24px] w-[480px] max-[450px]:w-[340px] max-[320px]:w-[280px]">
              <input
                type="email"
                className="p-[16px] border border-gray-200 rounded-lg outline-none text-[15px] transition-colors focus:border-gray-900"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address *"
                required
              />

              <input
                type="password"
                className="p-[16px] border border-gray-200 rounded-lg outline-none text-[15px] transition-colors focus:border-gray-900"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password *"
                required
              />

              <div className="flex justify-between pb-[8px]">
                <p style={{ margin: 0 }} className="text-[13px] text-gray-400">
                  <Link to="/forgot-password" className="text-[13px] text-gray-900">
                    Lost password?
                  </Link>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="p-[16px] bg-gray-900 text-white border-none rounded-lg cursor-pointer uppercase font-semibold text-[13px] transition-colors hover:bg-gray-800"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-center mb-3 text-gray-400 text-sm">or continue with</div>

              <button
                onClick={loginWithGoogle}
                type="button"
                className="w-full py-3 px-4 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-900 cursor-pointer transition-colors duration-200 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-2"
              >
                <i className="fab fa-google"></i> Continue with Google
              </button>
              <FacebookLogin
                appId="1206302750908024"
                autoLoad={false}
                fields="name,email,picture"
                callback={responseFacebook}
                icon="fab fa-facebook"
                textButton="Continue with Facebook"
                cssClass="w-full py-3 px-4 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-900 cursor-pointer transition-colors duration-200 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-2 mb-2"
              />

              <div className="pt-[24px]">
                <p className="text-[13px] text-center text-gray-400">
                  No account yet?{' '}
                  <Link to="/register" className="text-decoration-underline text-info">
                    Create Account
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

export default Login;
