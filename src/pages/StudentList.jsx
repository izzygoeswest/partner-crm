import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Not authenticated.");
        setLoading(false);
        return;
      }

      // Get logged-in user's partner ID
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

      // Fetch students linked to this partner
      const { data, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("partner_id", profile.partner_id)
        .order("full_name", { ascending: true });

      if (studentError) {
        setError("Could not load students.");
      } else {
        setStudents(data);
      }

      setLoading(false);
    };

    fetchStudents();
  }, []);

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Your Students</h2>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul className="space-y-4">
          {students.map((student) => (
            <li key={student.id} className="border rounded p-4">
              <p><strong>Name:</strong> {student.full_name}</p>
              <p><strong>Email:</strong> {student.email || "N/A"}</p>
              <p><strong>Referral Source:</strong> {student.referral_source}</p>
              <p><strong>Status:</strong> {student.current_status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
