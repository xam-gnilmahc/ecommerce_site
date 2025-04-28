import { useState } from "react";
import { supabase } from "../supaBaseClient"; // Assuming you've set up supabaseClient.js
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
    <div className="container my-3 py-3">
      <h1 className="text-center">Forgot Password</h1>
      <hr />
      <div className="row my-4 h-100">
        <div className="col-md-4 col-lg-4 col-sm-8 mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="my-3">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            {/* {error && <div className="alert alert-danger my-2">{error}</div>}
            {successMessage && <div className="alert alert-success my-2">{successMessage}</div>} */}

            <div className="text-center">
              <button
                className="my-2 mx-auto btn btn-dark"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
