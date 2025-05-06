import { useState } from "react";
import { supabase } from "../supaBaseClient"; // Assuming you've set up supabaseClient.js
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import "./ForgotPassword.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        toast.error("Error sending password reset email");
        console.log(error.message);
        setError("Error sending password reset email: " + error.message);
      } else {
        toast.success("Password reset email sent. Please check your inbox");
        setSuccessMessage("Password reset email sent. Please check your inbox.");
        // Redirect after success
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <>
    <Navbar/>
    <div className="resetPasswordSection">
       <h2>Reset Your Password</h2>
     
      <div className="resetPasswordContainer">
      <p>We will send you an email to reset your password</p>
     
          <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />

              <button
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            
          </form>
      </div>
      <p>
          Back to{" "}
          <Link to="/login">
            <span>Login</span>
          </Link>
        </p>
    </div>
    <Footer/>
    </>
  );
};

export default ForgotPassword;
