import type React from "react";

import LoginButton from "@/components/LoginButton";

const LoginPage: React.FC = () => (
  <div className="relative flex min-h-screen items-center justify-center bg-background text-foreground overflow-hidden px-4">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 opacity-30" />
      <div className="absolute -inset-40 opacity-20 blur-3xl cyber-gradient" />
    </div>

    <div className="relative z-10 w-full max-w-xl login-surface p-8 sm:p-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
          IHPL Home
        </h1>
        <p className="mt-2 text-base md:text-lg text-stone-300">
          Please login with Discord to create or access your account.
        </p>
      </header>

      <div className="flex justify-center">
        <LoginButton />
      </div>
    </div>
  </div>
);

export default LoginPage;
