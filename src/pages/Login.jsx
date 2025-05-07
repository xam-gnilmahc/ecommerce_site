import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "../components";
import { supabase } from "../supaBaseClient";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import FacebookLogin from "react-facebook-login";
import PublicNavbar from "../components/PublicNavbar";
import "./Login.css";

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Login successful!");
    navigate("/");
  };

  const loginWithGoogle = async () => {
    console.log("google");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
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
      <PublicNavbar />
      <div className="loginSignUpSection">
        <div className="loginSignUpContainer">
        <div className="loginSignUpTabs">
            <p          
            >
              Login
            </p>
           
          </div>
          <div className="loginSignUpTabsContentLogin">
            
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address *"
                required
              />

              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password *"
                required
              />

              <div className="loginSignUpForgetPass">
              <div className="form-check d-flex align-items-center">
                <input
                  type="checkbox"
                  className="form-check-input me-2 brandRadio"
                  id="rememberMe"
                  style={{ transform: "scale(0.85)", cursor: "pointer" }}
                />
                <label className="form-check-label mb-0" htmlFor="rememberMe" style={{ fontSize: "0.9rem" }}>
                  Remember me
                </label>
              </div>

                <p style={{ margin : 0}}>
                  <Link to="/forgot-password">Lost password?</Link>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="text-center mb-3 text-muted">
                or continue with
              </div>

              <button
                onClick={loginWithGoogle}
                type="button"
                className="btn btn-outline-danger w-100 "
              >
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

              <div className="loginSignUpTabsContentLoginText">
                <p>
                  No account yet?{" "}
                  <Link
                    to="/register"
                    className="text-decoration-underline text-info"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
