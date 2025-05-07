import React, { useState } from "react";
import { Footer, Navbar } from "../components";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supaBaseClient"; // adjust path as needed
import toast from "react-hot-toast";
import PublicNavbar from "../components/PublicNavbar";
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      setLoading(false);
      return;
    }

    navigate("/login");
    toast.success("User registered");
  };

  return (
    <>
    <PublicNavbar />
      <div className="loginSignUpSection">
        <div className="loginSignUpContainer">
        <div className="loginSignUpTabs">
            <p          
            >
              Register
            </p>
           
          </div>
          <div className="loginSignUpTabsContentRegister">
            <form onSubmit={handleSubmit} autoComplete="off">
              <input
                type="text"
                className="form-control"
                id="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                required
              />

              <input
                type="email"
                className="form-control"
                id="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />

              <input
                type="password"
                className="form-control"
                id="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />

              <p>
                Your personal data will be used to support your experience
                throughout this website, to manage access to your account, and
                for other purposes described in our
                <Link
                  to="/terms"
                  style={{ textDecoration: "none", color: "#c32929" }}
                >
                  {" "}
                  privacy policy
                </Link>
                .
              </p>

              <div className="my-3">
                <p>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-decoration-underline text-info"
                  >
                    Login
                  </Link>
                </p>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
