import type React from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-stone-950">
        <h1 className="font-extrabold text-yellow-500 text-4xl">
          CHRIS Loading ...
        </h1>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
