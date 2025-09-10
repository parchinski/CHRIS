import type React from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const LoginButton: React.FC = () => {
  const { login } = useAuth();

  return (
    <Button
      onClick={login}
      type="button"
      variant="outline"
      size="lg"
      className="px-6 font-semibold border-stone-700 hover:bg-[hsl(var(--muted)/0.35)]"
      aria-label="Login with Discord"
    >
      Login with Discord
    </Button>
  );
};

export default LoginButton;
