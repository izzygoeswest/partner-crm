import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [referralCounts, setReferralCounts] = useState({});
  const [outcomes, setOutcomes] = useState({});
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

      const { data: profile } = await supabase
        .from("users")
        .select("partner_id, role")
        .eq("id", user.id)
        .single();

      const filter = profile.role === "admin"
        ? {}
        : { partner_id: profile.partner_id };

      // 1. Total students
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .match(filter);

      setTotalStudents(studentCount || 0);

      // 2. Referral source breakdown
      const { data: referralStats } = await supabase
        .from("students")
        .select("referral_source, count:referral_source", { count: "exact" })
        .match(filter)
        .group("referral_source");

      const referralMap = {};
      referralStats?.forEach((row) => {
        referralMap[row.referral_source] = (referralMap[row.referral_source] || 0) + 1;
      });
      setReferralCounts(referralMap);

      // 3. Outcome breakdown
      const { data: outcomeStats } = await supabase
        .from("students")
        .select("outcome, count:outcome", { count: "exact" })
        .match(filter)
        .group("outcome");

      const outcomeMap = {};
      outcomeStats?.forEach((row) => {
        const label = row.outcome || "Unknown";
        outcomeMap[label] = (outcomeMap[label] || 0) + 1;
      });
      setOutcomes(outcomeMap);
    };

    loadStats();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Total Students</h2>
        <p className="text-3xl font-bold">{totalStudents}</p>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Referral Sources</h2>
        <ul className="space-y-1">
          {Object.entries(referralCounts).map(([source, count]) => (
            <li key={source}>
              {source}: <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Student Outcomes</h2>
        <ul className="space-y-1">
          {Object.entries(outcomes).map(([outcome, count]) => (
            <li key={outcome}>
              {outcome}: <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
