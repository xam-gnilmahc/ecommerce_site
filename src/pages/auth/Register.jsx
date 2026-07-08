import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="flex justify-center items-center px-4 pt-[48px] pb-[64px] max-md:pb-[32px]">
        <div className="flex flex-col justify-center items-center gap-[8px]">
          <div className="flex flex-wrap items-center justify-center">
            <p className="border-none cursor-pointer no-underline uppercase text-[20px] font-semibold relative text-gray-900">
              Register
            </p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-[24px] w-[480px] max-[450px]:w-[340px] max-[320px]:w-[280px]"
            >
              <input
                type="text"
                className="p-4 border border-gray-200 rounded-lg outline-none text-[15px] transition-colors focus:border-gray-900 w-full"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                required
              />

              <input
                type="email"
                className="p-4 border border-gray-200 rounded-lg outline-none text-[15px] transition-colors focus:border-gray-900 w-full"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />

              <input
                type="password"
                className="p-4 border border-gray-200 rounded-lg outline-none text-[15px] transition-colors focus:border-gray-900 w-full"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />

              <p className="text-[13px] text-gray-400">
                Your personal data will be used to support your experience throughout this website,
                to manage access to your account, and for other purposes described in our
                <Link to="/terms" className="text-[13px] text-gray-900">
                  {' '}
                  privacy policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="p-4 bg-gray-900 text-white border-none rounded-lg cursor-pointer uppercase font-semibold text-[13px] transition-colors hover:bg-gray-800"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>

              <div className="pt-[24px]">
                <p className="text-[13px] text-center text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-underline text-info">
                    Login
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
