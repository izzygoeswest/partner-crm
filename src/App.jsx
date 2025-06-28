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

  // Get current user on load
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
    <div className="p-6">
      {/* Navbar */}
      <nav className="mb-6 flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/" className="font-semibold text-blue-600">Home</Link>
          {user && (
            <>
              <Link to="/dashboard" className="ml-4">Dashboard</Link>
              <Link to="/students/new" className="ml-4">Add Student</Link>
              <Link to="/students" className="ml-4">View Students</Link>
            </>
          )}
        </div>

        <div className="space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">Logged in as {user.email}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 text-sm underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600">Login</Link>
              <Link to="/signup" className="text-blue-600 ml-4">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Routes */}
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
    </div>
  );
}
