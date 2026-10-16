import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import FacebookLogin from 'react-facebook-login';
import { FACEBOOK_APP_ID } from '../../config/env';
import logo from '../../components/cart/assets/logo.png';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const isLogin = !location.pathname.startsWith('/register');

  if (user) return <Navigate to="/" replace />;

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      toast.error(error.message);
      setLoginLoading(false);
      return;
    }

    toast.success('Login successful!');
    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    const { error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          full_name: registerData.name,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setRegisterLoading(false);
      return;
    }

    toast.success('Account created. Please sign in.');
    navigate('/login');
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      toast.error(error.message);
    }
  };

  const responseFacebook = (response: any) => {
    if (response && response.name && response.email) {
      toast.success(
        `Welcome ${response.name}!\nEmail: ${response.email}\n\nNote: Facebook login is under development and not fully functional for end users.`
      );
    } else {
      toast.error('Facebook login failed or is incomplete.');
    }
  };

  return (
    <section className="auth-page">
      <Link to="/" className="auth-logo" aria-label="Home">
        <img src={logo} alt="" />
      </Link>

      <div className="auth-main">
        <div className="auth-heading">
          <h1 className="auth-title">{isLogin ? 'Sign in' : 'Create account'}</h1>
          <p className="auth-sub">
            {isLogin
              ? 'Sign in or create an account'
              : 'Register to place orders and check out faster'}
          </p>
        </div>

        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <button type="button" onClick={loginWithGoogle} className="social-btn google-btn">
              <i className="fa fa-google"></i> Continue with Google
            </button>

            <FacebookLogin
              appId={FACEBOOK_APP_ID}
              autoLoad={false}
              fields="name,email,picture"
              callback={responseFacebook}
              icon="fa-facebook"
              textButton="Continue with Facebook"
              cssClass="social-btn fb-btn"
            />

            <div className="auth-divider">or</div>

            <div className="auth-field">
              <input
                type="email"
                name="email"
                aria-label="Email address"
                placeholder="Email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className="auth-field">
              <input
                type="password"
                name="password"
                aria-label="Password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              <button
                type="submit"
                className="auth-arrow"
                aria-label="Sign in"
                disabled={loginLoading}
              >
                <i className="fa fa-arrow-right"></i>
              </button>
            </div>

            <p className="auth-help">
              <Link to="/forgot-password">Lost your password?</Link>
            </p>

            <p className="auth-switch">
              New here? <Link to="/register">Create an account</Link>
            </p>

            <p className="auth-terms">
              By continuing, you agree to our <Link to="/terms">Terms of service</Link>.
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister} autoComplete="off">
            <div className="auth-field">
              <input
                type="text"
                name="name"
                aria-label="Full name"
                placeholder="Full name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="auth-field">
              <input
                type="email"
                name="email"
                aria-label="Email address"
                placeholder="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="auth-field">
              <input
                type="password"
                name="password"
                aria-label="Password"
                placeholder="Password (min. 6 characters)"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                minLength={6}
              />
              <button
                type="submit"
                className="auth-arrow"
                aria-label="Create account"
                disabled={registerLoading}
              >
                <i className="fa fa-arrow-right"></i>
              </button>
            </div>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <p className="auth-terms">
              By creating an account, you agree to our <Link to="/terms">Terms of service</Link>.
            </p>
          </form>
        )}
      </div>

      <div className="auth-footer">
        <Link to="/terms">Privacy policy</Link>
      </div>
    </section>
  );
};

export default AuthPage;
