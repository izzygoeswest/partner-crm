import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddStudentForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    date_of_birth: "",
    referral_source: "self",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("partner_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.partner_id) {
      setError("Partner not found.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("students").insert([
      {
        full_name: formData.full_name,
        email: formData.email,
        date_of_birth: formData.date_of_birth,
        referral_source: formData.referral_source,
        partner_id: profile.partner_id,
      },
    ]);

    if (insertError) {
      console.error(insertError);
      setError("Failed to save student.");
    } else {
      setSuccess(true);
      setFormData({
        full_name: "",
        email: "",
        date_of_birth: "",
        referral_source: "self",
      });
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 text-center">Add New Student</h2>

      {success && (
        <p className="text-green-600 text-center font-medium">
          Student added successfully!
        </p>
      )}
      {error && (
        <p className="text-red-600 text-center font-medium">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Referral Source
        </label>
        <select
          name="referral_source"
          value={formData.referral_source}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-500"
        >
          <option value="self">Self</option>
          <option value="school">School</option>
          <option value="welfare agency">Welfare Agency</option>
          <option value="TANF">TANF</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        disabled={loading}
      >
        {loading ? "Saving..." : "Add Student"}
      </button>
    </form>
  );
}
