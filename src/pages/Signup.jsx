import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "partner",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const {
      data: { user },
      error: signupError,
    } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (signupError || !user) {
      setError(signupError?.message || "Signup failed.");
      return;
    }

    const { error: profileError } = await supabase.from("users").insert([
      {
        id: user.id,
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
      },
    ]);

    if (profileError) {
      setError("User created but failed to save profile.");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="partner">Partner</option>
          <option value="advisor">Advisor</option>
        </select>
        <button className="w-full bg-blue-600 text-white p-2 rounded" type="submit">
          Sign Up
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
