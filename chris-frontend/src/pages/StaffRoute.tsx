import type React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

const StaffRoute: React.FC = () => {
  const { isAuthLoading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <h1 className="font-extrabold text-primary text-4xl animate-pulse">
          Loading …
        </h1>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole("staff")) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default StaffRoute;
