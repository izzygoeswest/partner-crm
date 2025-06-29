import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentPage from "./pages/StudentPage";
import StudentList from "./pages/StudentList";
import Dashboard from "./pages/Dashboard";

// Components
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch the current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Partner CRM
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-sm text-gray-700 hover:underline">
                  Dashboard
                </Link>
                <Link to="/students/new" className="text-sm text-gray-700 hover:underline">
                  Add Student
                </Link>
                <Link to="/students" className="text-sm text-gray-700 hover:underline">
                  View Students
                </Link>
              </>
            )}
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-sm text-gray-500">Logged in as {user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-blue-600 hover:underline">
                  Login
                </Link>
                <Link to="/signup" className="text-sm text-blue-600 hover:underline">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/students/new"
            element={
              <PrivateRoute>
                <StudentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <StudentList />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
