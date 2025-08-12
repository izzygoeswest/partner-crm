import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [referralCounts, setReferralCounts] = useState({});
  const [outcomes, setOutcomes] = useState({});
  const [recentStudents, setRecentStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError("");

      // 1) Auth user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      // 2) Build a base query scoped to this user_id (no users table access)
      const scoped = (q) => q.eq("user_id", user.id);

      // Total students (head request with count)
      const { count: studentCount, error: countErr } = await scoped(
        supabase.from("students").select("id", { count: "exact", head: true })
      );

      if (countErr) {
        setError("Failed to load totals.");
        setLoading(false);
        return;
      }
      setTotalStudents(studentCount || 0);

      // Referral breakdown
      const { data: referralRows = [], error: refErr } = await scoped(
        supabase.from("students").select("referral_source")
      );
      if (refErr) {
        setError("Failed to load referral data.");
        setLoading(false);
        return;
      }
      const referrals = referralRows.reduce((acc, r) => {
        const key = r.referral_source || "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      setReferralCounts(referrals);

      // Outcomes breakdown
      const { data: outcomeRows = [], error: outErr } = await scoped(
        supabase.from("students").select("outcome")
      );
      if (outErr) {
        setError("Failed to load outcomes.");
        setLoading(false);
        return;
      }
      const outcomesMap = outcomeRows.reduce((acc, r) => {
        const key = r.outcome || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      setOutcomes(outcomesMap);

      // Recent students (5 newest)
      // Use created_at if you have it; otherwise fall back to id desc
      const { data: recent = [], error: recentErr } = await scoped(
        supabase
          .from("students")
          .select("full_name, email, referral_source, created_at, id")
          .order("created_at", { ascending: false })
          .limit(5)
      );
      if (recentErr) {
        // If created_at isn't present yet, fallback to id ordering
        const { data: recentById = [], error: fallbackErr } = await scoped(
          supabase
            .from("students")
            .select("full_name, email, referral_source, id")
            .order("id", { ascending: false })
            .limit(5)
        );
        if (!fallbackErr) setRecentStudents(recentById);
      } else {
        setRecentStudents(recent);
      }

      setLoading(false);
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

      {error && <p className="text-red-600">{error}</p>}
      {loading && !error && <p>Loading…</p>}

      {!loading && !error && (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">
                Total Students
              </h2>
              <p className="text-4xl font-bold text-blue-600">{totalStudents}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-600 mb-4">
                Referral Sources
              </h2>
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

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-600 mb-4">
                Student Outcomes
              </h2>
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
              <h2 className="text-lg font-semibold text-gray-600 mb-4">
                Recent Students
              </h2>
              {recentStudents.length === 0 ? (
                <p className="text-sm text-gray-500">No recent students found.</p>
              ) : (
                <ul className="space-y-2">
                  {recentStudents.map((s) => (
                    <li key={s.id} className="border-b pb-2">
                      <p className="font-semibold">{s.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {(s.email || "No email") + " — " + (s.referral_source || "N/A")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
