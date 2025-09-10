import type React from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Button
      onClick={logout}
      type="button"
      variant="outline"
      size="sm"
      className="font-semibold text-stone-300 hover:text-stone-100 hover:border-stone-600 cyber-ring hover:bg-stone-950/50 flex items-center justify-center"
      aria-label="Logout"
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
