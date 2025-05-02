import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Footer, Navbar } from "../components";
import { supabase } from "../supaBaseClient";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import FacebookLogin from 'react-facebook-login';


const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Login successful!");
    navigate("/");
  };

  const loginWithGoogle = async () => {
    console.log('google');
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) {
      toast.error("Facebook sign-in failed: " + error.message);
      return; 
    }
  };

  // const loginWithFacebook = async () => {
  //   const { error } = await supabase.auth.signInWithOAuth({ provider: "facebook" });
  //   if (error) toast.error("Facebook sign-in failed: " + error.message);
  // };
  const responseFacebook = (response) => {
    if (response && response.name && response.email) {
      toast.success(
        `Welcome ${response.name}!\nEmail: ${response.email}\n\nNote: Facebook login is under development and not fully functional for end users.`
      );
    } else {
      toast.error("Facebook login failed or is incomplete.");
    }
  };
  
  

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <h2 className="text-center mb-3">Login</h2>
        <hr />
        <div className="row justify-content-center">
          <div className="col-md-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button className="btn btn-dark w-100 mb-2" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <Link to="/forgot-password" className="d-block text-center text-info mb-3 text-decoration-underline">
                Forgot Password?
              </Link>

              <div className="text-center mb-3 text-muted">or continue with</div>

              <button onClick={loginWithGoogle} type="button" className="btn btn-outline-danger w-100 mb-2">
                <i className="fab fa-google me-2"></i> Continue with Google
              </button>     
              <FacebookLogin
                appId="1206302750908024"
                autoLoad={false}
                fields="name,email,picture"
                callback={responseFacebook}
                icon="fa-facebook me-2"
                textButton="Continue with Facebook"
                cssClass="btn btn-outline-primary w-100 mb-2 d-flex align-items-center justify-content-center"
              />
              <p className="text-center mt-4">
                New here?{" "}
                <Link to="/register" className="text-decoration-underline text-info">
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
