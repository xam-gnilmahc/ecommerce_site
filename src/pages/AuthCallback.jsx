import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supaBaseClient";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const identities = user.identities || [];

      const hasEmailProvider = identities.some(
        (identity) => identity.provider === "email"
      );

      // user logged with google only
      if (!hasEmailProvider) {
        navigate("/create-password");
      } else {
        toast.success("Login successful!");
        navigate("/");
      }
    };

    checkUser();
  }, []);

  return <div>Loading...</div>;
};

export default AuthCallback;