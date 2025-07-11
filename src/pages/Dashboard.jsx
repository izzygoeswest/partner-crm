import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [referralCounts, setReferralCounts] = useState({});
  const [outcomes, setOutcomes] = useState({});
  const [recentStudents, setRecentStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!user || authError) {
        setError("User not authenticated.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("partner_id, role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Failed to fetch user profile.");
        return;
      }

      const filter = profile.role === "admin" ? {} : { partner_id: profile.partner_id };

      // Total students
      const { count: studentCount } = await supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .match(filter);

      setTotalStudents(studentCount || 0);

      // Referral sources breakdown
      const { data: referralStats = [] } = await supabase
        .from("students")
        .select("referral_source")
        .match(filter);

      const referrals = referralStats.reduce((acc, curr) => {
        acc[curr.referral_source] = (acc[curr.referral_source] || 0) + 1;
        return acc;
      }, {});

      setReferralCounts(referrals);

      // Outcomes breakdown
      const { data: outcomeStats = [] } = await supabase
        .from("students")
        .select("outcome")
        .match(filter);

      const outcomesMap = outcomeStats.reduce((acc, curr) => {
        const key = curr.outcome || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      setOutcomes(outcomesMap);

      // Recent students (optional)
      const { data: recent = [], error: recentError } = await supabase
        .from("students")
        .select("full_name, email, referral_source")
        .match(filter)
        .order("id", { ascending: false })
        .limit(5);

      if (!recentError) {
        setRecentStudents(recent);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Students</h2>
          <p className="text-4xl font-bold text-blue-600">{totalStudents}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-600 mb-4">Referral Sources</h2>
          {Object.keys(referralCounts).length === 0 ? (
            <p className="text-sm text-gray-500">No data available.</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(referralCounts).map(([source, count]) => (
                <li key={source} className="flex justify-between">
                  <span className="capitalize">{source}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-600 mb-4">Student Outcomes</h2>
        {Object.keys(outcomes).length === 0 ? (
          <p className="text-sm text-gray-500">No outcomes recorded.</p>
        ) : (
          <ul className="space-y-1">
            {Object.entries(outcomes).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="capitalize">{status}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-600 mb-4">Recent Students</h2>
        {recentStudents.length === 0 ? (
          <p className="text-sm text-gray-500">No recent students found.</p>
        ) : (
          <ul className="space-y-2">
            {recentStudents.map((student, index) => (
              <li key={index} className="flex justify-between">
                <span>{student.full_name}</span>
                <span className="text-sm text-gray-500">{student.referral_source}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
