import React, { useState } from "react";
import { supabase } from "../supaBaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreatePassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handlePassword = async (e) => {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password added successfully!");
    navigate("/");
  };

  return (
    <div className="loginSignUpSection">
      <div className="loginSignUpContainer">
        <h3>Create Password</h3>

        <form onSubmit={handlePassword}>
          <input
            type="password"
            placeholder="Enter new password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePassword;