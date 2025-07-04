import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function RecentStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecent = async () => {
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Authentication failed");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, partner_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError("Profile lookup failed");
        return;
      }

      let query = supabase
        .from("students")
        .select("full_name, email, referral_source, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (profile.role !== "admin") {
        query = query.eq("partner_id", profile.partner_id);
      }

      const { data, error: studentError } = await query;

      if (studentError) {
        setError("Failed to load recent students");
        console.error(studentError);
      } else {
        setStudents(data);
      }
    };

    loadRecent();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-600 mb-4">Recent Students</h2>
      {error && <p className="text-red-500">{error}</p>}
      {students.length === 0 ? (
        <p className="text-sm text-gray-500">No students found.</p>
      ) : (
        <ul className="space-y-2">
          {students.map((s, idx) => (
            <li key={idx} className="border-b pb-2">
              <p className="font-semibold">{s.full_name}</p>
              <p className="text-sm text-gray-500">{s.email} — {s.referral_source}</p>
              <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
