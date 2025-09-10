import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./pages/Layout";
import ProtectedRoute from "./pages/ProtectedRoute";
import StaffRoute from "./pages/StaffRoute";
import LoginPage from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import UserSettings from "./pages/UserSettings";
import Staff from "./pages/Staff";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <h1 className="font-extrabold text-primary text-4xl animate-pulse">
          CHRIS Loading ...
        </h1>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<UserProfile />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route element={<StaffRoute />}>
            <Route path="/staff" element={<Staff />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
