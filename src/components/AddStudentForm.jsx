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

    // Get the currently logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    // Get their partner ID from the users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("partner_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setError("Partner information not found.");
      setLoading(false);
      return;
    }

    // Insert the student record with partner ID
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block font-medium">Full Name</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Date of Birth</label>
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Referral Source</label>
        <select
          name="referral_source"
          value={formData.referral_source}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="self">Self</option>
          <option value="school">School</option>
          <option value="welfare agency">Welfare Agency</option>
          <option value="TANF">TANF</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Saving..." : "Add Student"}
      </button>

      {success && <p className="text-green-600 mt-2">Student added successfully!</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}
