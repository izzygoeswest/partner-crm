import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import StudentPage from "./pages/StudentPage";

export default function App() {
  return (
    <div className="p-6">
      <nav className="mb-4">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/students/new">Add Student</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/students/new" element={<StudentPage />} />
      </Routes>
    </div>
  );
}
