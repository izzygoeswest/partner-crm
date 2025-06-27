import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PrivateRoute({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setChecking(false);
    };
    getUser();
  }, []);

  if (checking) return <p>Loading...</p>;

  return user ? children : <Navigate to="/login" replace />;
}
