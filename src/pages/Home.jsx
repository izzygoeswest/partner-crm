import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          Streamline Your Student Referrals
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Partner CRM helps advisors, partners, and organizations easily track student referrals,
          outcomes, and engagement — all in one place.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 hover:bg-blue-100 font-semibold py-2 px-6 rounded transition"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
