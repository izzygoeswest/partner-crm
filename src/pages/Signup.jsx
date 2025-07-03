import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "partner",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Step 3: Log session
    supabase.auth.getSession().then(({ data }) => {
      console.log("Session on load:", data);
    });
  }, []);

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

    // Step 2: Log user ID returned
    console.log("Signed-up user:", user);

    const { error: profileError } = await supabase.from("users").insert([
      {
        id: user.id,
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
      },
    ]);

    if (profileError) {
      console.error("Profile insert error:", profileError);
      setError("User created but failed to save profile.");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
      <form onSubmit={handleSignup} className="w-full space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800">Sign Up</h2>
          <p className="text-sm text-center text-gray-500">Create your partner account</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="Jane Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="partner">Partner</option>
            <option value="advisor">Advisor</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Sign Up
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
